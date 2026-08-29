package com.agrismart.crop.controller;

import com.agrismart.crop.dto.CropRequest;
import com.agrismart.crop.dto.CropResponse;
import com.agrismart.crop.entity.CropStatus;
import com.agrismart.crop.service.CropService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import com.agrismart.crop.service.ChatbotService;
import com.agrismart.crop.dto.ChatbotRequest;
import com.agrismart.crop.dto.ChatbotResponse;

@RestController
@RequestMapping("/api/crops")
@Tag(name = "Crop Management", description = "Endpoints for crop tracking, logging, lifecycle updates, and details retrieval")
public class CropController {

    private final CropService cropService;
    private final ChatbotService chatbotService;
    public CropController(CropService cropService, ChatbotService chatbotService) {
        this.cropService = cropService;
        this.chatbotService = chatbotService;
    }
    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Add a new crop record", description = "Farmer registers a crop cultivation event. Verifies farm ownership.")
    public ResponseEntity<CropResponse> addCrop(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CropRequest request
    ) {
        String token = authHeader.substring(7);
        return new ResponseEntity<>(cropService.addCrop(request, token), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Update a crop record", description = "Farmer updates crop cultivation details. Verifies farm ownership.")
    public ResponseEntity<CropResponse> updateCrop(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @Valid @RequestBody CropRequest request
    ) {
        Long userId = (Long) authentication.getCredentials();
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");
        String token = authHeader.substring(7);
        return ResponseEntity.ok(cropService.updateCrop(id, request, userId, userRole, token));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Track crop lifecycle", description = "Farmer updates the lifecycle status of a crop (PLANTED, GROWING, HARVESTED, WASTED).")
    public ResponseEntity<CropResponse> updateStatus(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestParam CropStatus status
    ) {
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");
        String token = authHeader.substring(7);
        return ResponseEntity.ok(cropService.updateStatus(id, status, userRole, token));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Delete a crop record", description = "Farmer deletes a crop logging record from their farm.")
    public ResponseEntity<Void> deleteCrop(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");
        String token = authHeader.substring(7);
        cropService.deleteCrop(id, userRole, token);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get crop details by ID", description = "Retrieve specific crop record details. Verifies ownership for farmers.")
    public ResponseEntity<CropResponse> getCropById(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");
        String token = authHeader.substring(7);
        return ResponseEntity.ok(cropService.getCropById(id, userRole, token));
    }

    @GetMapping
    @Operation(summary = "View crops list", description = "Retrieve a list of crops. Farmers see crops on their farms; Officers and Admins see all.")
    public ResponseEntity<Page<CropResponse>> viewCrops(
            Authentication authentication,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Long farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "cropId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Long userId = (Long) authentication.getCredentials();
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");
        String token = authHeader.substring(7);

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(cropService.viewCrops(farmId, userId, userRole, pageable, token));
    }

    @PostMapping("/chatbot")
    @Operation(summary = "Query the AI chatbot", description = "Query the local AI model for agronomist tips.")
    public ResponseEntity<ChatbotResponse> queryChatbot(
            @RequestBody ChatbotRequest request
    ) {
        return ResponseEntity.ok(chatbotService.getReply(request));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint", description = "Returns service availability status")
    public ResponseEntity<java.util.Map<String, Object>> healthCheck() {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("service", "Crop Service");
        map.put("status", "UP");
        map.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(map);
    }
}
