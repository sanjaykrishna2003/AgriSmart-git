package com.agrismart.user.service;

import com.agrismart.user.dto.*;
import com.agrismart.user.entity.User;
import com.agrismart.user.exception.BadRequestException;
import com.agrismart.user.exception.ResourceNotFoundException;
import com.agrismart.user.repository.UserRepository;
import com.agrismart.user.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.agrismart.user.entity.Role;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        boolean isVerified = request.getRole() != Role.OFFICER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .district(request.getDistrict())
                .state(request.getState())
                .nitrogen(60.0)
                .phosphorus(40.0)
                .potassium(50.0)
                .soilPh(6.5)
                .soilMoisture(35.0)
                .organicCarbon(1.0)
                .electricalConductivity(1.0)
                .isVerified(isVerified)
                .build();

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailOrPhone(request.getEmail(), request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email/phone or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email/phone or password");
        }

        if (user.getRole() == Role.OFFICER && Boolean.FALSE.equals(user.getIsVerified())) {
            throw new BadRequestException("Your officer account is pending Admin approval. Access is denied until verified.");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getUserId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToUserResponse(user))
                .build();
    }

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setName(request.getName());
        user.setPhone(request.getPhone());
        
        // Officers CANNOT update their assigned district/state via profile endpoint. Only Admin can assign regions.
        if (user.getRole() != Role.OFFICER) {
            user.setDistrict(request.getDistrict());
            user.setState(request.getState());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getDob() != null) user.setDob(request.getDob());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getTaluk() != null) user.setTaluk(request.getTaluk());
        if (request.getVillage() != null) user.setVillage(request.getVillage());
        if (request.getPincode() != null) user.setPincode(request.getPincode());
        if (request.getLandOwnershipType() != null) user.setLandOwnershipType(request.getLandOwnershipType());
        if (request.getTotalLandholding() != null) user.setTotalLandholding(request.getTotalLandholding());
        if (request.getFarmerCategory() != null) user.setFarmerCategory(request.getFarmerCategory());
        if (request.getOwnershipDocumentAvailable() != null) user.setOwnershipDocumentAvailable(request.getOwnershipDocumentAvailable());
        if (request.getAnnualIncomeRange() != null) user.setAnnualIncomeRange(request.getAnnualIncomeRange());
        if (request.getIncomeCertificateAvailable() != null) user.setIncomeCertificateAvailable(request.getIncomeCertificateAvailable());
        if (request.getHasTractor() != null) user.setHasTractor(request.getHasTractor());
        if (request.getHasMachinery() != null) user.setHasMachinery(request.getHasMachinery());
        if (request.getHasIrrigationEquipment() != null) user.setHasIrrigationEquipment(request.getHasIrrigationEquipment());
        if (request.getHasPumpSet() != null) user.setHasPumpSet(request.getHasPumpSet());
        if (request.getHasStorageFacility() != null) user.setHasStorageFacility(request.getHasStorageFacility());
        if (request.getHasGreenhouse() != null) user.setHasGreenhouse(request.getHasGreenhouse());
        if (request.getFarmingType() != null) user.setFarmingType(request.getFarmingType());
        if (request.getYearsFarming() != null) user.setYearsFarming(request.getYearsFarming());
        if (request.getOrganizationMembership() != null) user.setOrganizationMembership(request.getOrganizationMembership());

        if (request.getNitrogen() != null) user.setNitrogen(request.getNitrogen());
        if (request.getPhosphorus() != null) user.setPhosphorus(request.getPhosphorus());
        if (request.getPotassium() != null) user.setPotassium(request.getPotassium());
        if (request.getSoilPh() != null) user.setSoilPh(request.getSoilPh());
        if (request.getSoilMoisture() != null) user.setSoilMoisture(request.getSoilMoisture());
        if (request.getOrganicCarbon() != null) user.setOrganicCarbon(request.getOrganicCarbon());
        if (request.getElectricalConductivity() != null) user.setElectricalConductivity(request.getElectricalConductivity());

        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    public Map<String, Object> getSoilHealth(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        Map<String, Object> map = new HashMap<>();
        map.put("nitrogen", user != null && user.getNitrogen() != null ? user.getNitrogen() : 60.0);
        map.put("phosphorus", user != null && user.getPhosphorus() != null ? user.getPhosphorus() : 40.0);
        map.put("potassium", user != null && user.getPotassium() != null ? user.getPotassium() : 50.0);
        map.put("ph", user != null && user.getSoilPh() != null ? user.getSoilPh() : 6.5);
        map.put("soil_ph", user != null && user.getSoilPh() != null ? user.getSoilPh() : 6.5);
        map.put("soil_moisture", user != null && user.getSoilMoisture() != null ? user.getSoilMoisture() : 35.0);
        map.put("organic_carbon", user != null && user.getOrganicCarbon() != null ? user.getOrganicCarbon() : 1.0);
        map.put("electrical_conductivity", user != null && user.getElectricalConductivity() != null ? user.getElectricalConductivity() : 1.0);
        return map;
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .district(user.getDistrict())
                .state(user.getState())
                .dob(user.getDob())
                .gender(user.getGender())
                .taluk(user.getTaluk())
                .village(user.getVillage())
                .pincode(user.getPincode())
                .landOwnershipType(user.getLandOwnershipType())
                .totalLandholding(user.getTotalLandholding())
                .farmerCategory(user.getFarmerCategory())
                .ownershipDocumentAvailable(user.getOwnershipDocumentAvailable())
                .annualIncomeRange(user.getAnnualIncomeRange())
                .incomeCertificateAvailable(user.getIncomeCertificateAvailable())
                .hasTractor(user.getHasTractor())
                .hasMachinery(user.getHasMachinery())
                .hasIrrigationEquipment(user.getHasIrrigationEquipment())
                .hasPumpSet(user.getHasPumpSet())
                .hasStorageFacility(user.getHasStorageFacility())
                .hasGreenhouse(user.getHasGreenhouse())
                .farmingType(user.getFarmingType())
                .yearsFarming(user.getYearsFarming())
                .organizationMembership(user.getOrganizationMembership())
                .nitrogen(user.getNitrogen() != null ? user.getNitrogen() : 60.0)
                .phosphorus(user.getPhosphorus() != null ? user.getPhosphorus() : 40.0)
                .potassium(user.getPotassium() != null ? user.getPotassium() : 50.0)
                .soilPh(user.getSoilPh() != null ? user.getSoilPh() : 6.5)
                .soilMoisture(user.getSoilMoisture() != null ? user.getSoilMoisture() : 35.0)
                .organicCarbon(user.getOrganicCarbon() != null ? user.getOrganicCarbon() : 1.0)
                .electricalConductivity(user.getElectricalConductivity() != null ? user.getElectricalConductivity() : 1.0)
                .isVerified(user.getIsVerified() != null ? user.getIsVerified() : true)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToUserResponse);
    }

    public Page<UserResponse> getFarmersList(Pageable pageable) {
        return userRepository.findByRole(Role.FARMER, pageable)
                .map(this::mapToUserResponse);
    }

    public List<UserResponse> getAllFarmers(Long requesterId, String requesterRole) {
        List<User> farmers = userRepository.findByRole(Role.FARMER);
        
        // Regional filtering: If caller is an OFFICER, limit returned farmers to their assigned district/state
        if ("ROLE_OFFICER".equals(requesterRole) && requesterId != null) {
            User officer = userRepository.findById(requesterId).orElse(null);
            if (officer != null && officer.getDistrict() != null && !officer.getDistrict().trim().isEmpty()) {
                String officerDist = officer.getDistrict().trim().toLowerCase();
                String officerState = officer.getState() != null ? officer.getState().trim().toLowerCase() : "";
                farmers = farmers.stream()
                        .filter(f -> (f.getDistrict() != null && f.getDistrict().trim().toLowerCase().equals(officerDist)) ||
                                     (f.getState() != null && f.getState().trim().toLowerCase().equals(officerState)))
                        .collect(Collectors.toList());
            }
        }
        
        return farmers.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getOfficersList() {
        return userRepository.findByRole(Role.OFFICER).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse verifyOfficer(Long officerId, Boolean verified, Long adminUserId) {
        User user = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));
        if (user.getRole() != Role.OFFICER) {
            throw new BadRequestException("Selected user is not an officer");
        }
        boolean isApproved = verified != null ? verified : true;
        user.setIsVerified(isApproved);
        User updatedUser = userRepository.save(user);

        // Audit Log
        if (adminUserId != null) {
            User admin = userRepository.findById(adminUserId).orElse(null);
            String adminName = admin != null ? admin.getName() : "Admin (" + adminUserId + ")";
            String action = isApproved ? "OFFICER_VERIFIED" : "OFFICER_REVOKED";
            String details = (isApproved ? "Approved officer " : "Revoked verification for officer ") + user.getName() + " (" + user.getEmail() + ")";
            auditLogService.logAction(action, adminUserId, adminName, "OFFICER", String.valueOf(officerId), details);
        }

        return mapToUserResponse(updatedUser);
    }

    @Transactional
    public UserResponse assignOfficerRegion(Long officerId, String district, String state, Long adminUserId) {
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));
        if (officer.getRole() != Role.OFFICER) {
            throw new BadRequestException("Selected user is not an officer");
        }

        officer.setDistrict(district);
        officer.setState(state);
        User updatedOfficer = userRepository.save(officer);

        // Audit Log
        if (adminUserId != null) {
            User admin = userRepository.findById(adminUserId).orElse(null);
            String adminName = admin != null ? admin.getName() : "Admin (" + adminUserId + ")";
            auditLogService.logAction(
                "OFFICER_ASSIGNED",
                adminUserId,
                adminName,
                "OFFICER",
                String.valueOf(officerId),
                "Assigned officer " + officer.getName() + " to region: District='" + district + "', State='" + state + "'"
            );
        }

        return mapToUserResponse(updatedOfficer);
    }

    public Map<String, Long> getUserCountsByRole() {
        Map<String, Long> counts = new HashMap<>();
        for (Role role : Role.values()) {
            counts.put(role.name(), userRepository.countByRole(role));
        }
        return counts;
    }
}
