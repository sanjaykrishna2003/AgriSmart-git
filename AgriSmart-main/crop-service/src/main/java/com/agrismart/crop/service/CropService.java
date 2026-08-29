package com.agrismart.crop.service;

import com.agrismart.crop.dto.CropRequest;
import com.agrismart.crop.dto.CropResponse;
import com.agrismart.crop.dto.FarmResponse;
import com.agrismart.crop.entity.Crop;
import com.agrismart.crop.entity.CropStatus;
import com.agrismart.crop.exception.BadRequestException;
import com.agrismart.crop.exception.ResourceNotFoundException;
import com.agrismart.crop.repository.CropRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CropService {

    private final CropRepository cropRepository;
    private final RestClient.Builder restClientBuilder;

    public CropService(CropRepository cropRepository, RestClient.Builder restClientBuilder) {
        this.cropRepository = cropRepository;
        this.restClientBuilder = restClientBuilder;
    }
    private RestClient getFarmRestClient() {
        return restClientBuilder.baseUrl("http://localhost:8082").build();
    }

    private FarmResponse verifyAndGetFarm(Long farmId, String jwtToken) {
        try {
            return getFarmRestClient().get()
                    .uri("/api/farms/{id}", farmId)
                    .header("Authorization", "Bearer " + jwtToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(FarmResponse.class);
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify farm: Farm not found or access denied.");
        }
    }

    private List<Long> getFarmerFarmIds(String jwtToken) {
        try {
            // Retrieve farmer's farms (returns a page)
            Map<String, Object> response = getFarmRestClient().get()
                    .uri("/api/farms?size=1000")
                    .header("Authorization", "Bearer " + jwtToken)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response != null && response.containsKey("content")) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
                return content.stream()
                        .map(item -> ((Number) item.get("farmId")).longValue())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            // Log or fallback
        }
        return Collections.emptyList();
    }

    @Transactional
    public CropResponse addCrop(CropRequest request, String jwtToken) {
        // Validate farm and check ownership
        verifyAndGetFarm(request.getFarmId(), jwtToken);

        Crop crop = Crop.builder()
                .cropName(request.getCropName())
                .duration(request.getDuration())
                .description(request.getDescription())
                .status(request.getStatus())
                .season(request.getSeason())
                .plantedDate(request.getPlantedDate())
                .expectedHarvestDate(request.getExpectedHarvestDate() != null ? 
                        request.getExpectedHarvestDate() : 
                        request.getPlantedDate().plusDays(request.getDuration()))
                .farmId(request.getFarmId())
                .yield(request.getYield())
                .area(request.getArea())
                .build();

        Crop savedCrop = cropRepository.save(crop);
        return mapToCropResponse(savedCrop);
    }

    @Transactional
    public CropResponse updateCrop(Long cropId, CropRequest request, Long userId, String userRole, String jwtToken) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + cropId));

        // Enforce ownership for farmer: check existing farm ownership
        if ("ROLE_FARMER".equals(userRole)) {
            verifyAndGetFarm(crop.getFarmId(), jwtToken);
            if (!crop.getFarmId().equals(request.getFarmId())) {
                // If moving to a new farm, check new farm ownership
                verifyAndGetFarm(request.getFarmId(), jwtToken);
            }
        }

        crop.setCropName(request.getCropName());
        crop.setDuration(request.getDuration());
        crop.setDescription(request.getDescription());
        crop.setStatus(request.getStatus());
        crop.setSeason(request.getSeason());
        crop.setPlantedDate(request.getPlantedDate());
        crop.setExpectedHarvestDate(request.getExpectedHarvestDate() != null ? 
                request.getExpectedHarvestDate() : 
                request.getPlantedDate().plusDays(request.getDuration()));
        crop.setFarmId(request.getFarmId());
        crop.setYield(request.getYield());
        crop.setArea(request.getArea());

        Crop updatedCrop = cropRepository.save(crop);
        return mapToCropResponse(updatedCrop);
    }

    @Transactional
    public CropResponse updateStatus(Long cropId, CropStatus status, String userRole, String jwtToken) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + cropId));

        if ("ROLE_FARMER".equals(userRole)) {
            verifyAndGetFarm(crop.getFarmId(), jwtToken);
        }

        crop.setStatus(status);
        Crop updatedCrop = cropRepository.save(crop);
        return mapToCropResponse(updatedCrop);
    }

    @Transactional
    public void deleteCrop(Long cropId, String userRole, String jwtToken) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + cropId));

        if ("ROLE_FARMER".equals(userRole)) {
            verifyAndGetFarm(crop.getFarmId(), jwtToken);
        }

        cropRepository.delete(crop);
    }

    public CropResponse getCropById(Long cropId, String userRole, String jwtToken) {
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with id: " + cropId));

        if ("ROLE_FARMER".equals(userRole)) {
            verifyAndGetFarm(crop.getFarmId(), jwtToken);
        }

        return mapToCropResponse(crop);
    }

    public Page<CropResponse> viewCrops(Long farmId, Long userId, String userRole, Pageable pageable, String jwtToken) {
        Page<Crop> cropPage;

        if ("ROLE_FARMER".equals(userRole)) {
            if (farmId != null) {
                // Verify farm ownership
                verifyAndGetFarm(farmId, jwtToken);
                cropPage = cropRepository.findByFarmId(farmId, pageable);
            } else {
                // Get all farm IDs for this farmer
                List<Long> farmIds = getFarmerFarmIds(jwtToken);
                if (farmIds.isEmpty()) {
                    return Page.empty(pageable);
                }
                cropPage = cropRepository.findByFarmIdIn(farmIds, pageable);
            }
        } else if ("ROLE_OFFICER".equals(userRole)) {
            if (farmId != null) {
                cropPage = cropRepository.findByFarmId(farmId, pageable);
            } else {
                List<Long> farmIds = getFarmIdsInOfficerRegion(userId);
                if (farmIds.isEmpty()) {
                    return Page.empty(pageable);
                }
                cropPage = cropRepository.findByFarmIdIn(farmIds, pageable);
            }
        } else {
            // ADMIN
            if (farmId != null) {
                cropPage = cropRepository.findByFarmId(farmId, pageable);
            } else {
                cropPage = cropRepository.findAll(pageable);
            }
        }

        return cropPage.map(this::mapToCropResponse);
    }

    private List<Long> getFarmIdsInOfficerRegion(Long officerId) {
        try {
            if (officerId == null) return Collections.emptyList();
            List<String> officerDistList = cropRepository.findOfficerDistrict(officerId);
            if (officerDistList.isEmpty() || officerDistList.get(0) == null || officerDistList.get(0).trim().isEmpty()) {
                return Collections.emptyList();
            }
            String dist = officerDistList.get(0).trim();
            return cropRepository.findFarmIdsByRegion(dist);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private CropResponse mapToCropResponse(Crop crop) {
        return CropResponse.builder()
                .cropId(crop.getCropId())
                .cropName(crop.getCropName())
                .duration(crop.getDuration())
                .description(crop.getDescription())
                .status(crop.getStatus())
                .season(crop.getSeason())
                .plantedDate(crop.getPlantedDate())
                .expectedHarvestDate(crop.getExpectedHarvestDate())
                .farmId(crop.getFarmId())
                .yield(crop.getYield())
                .area(crop.getArea())
                .build();
    }
}
