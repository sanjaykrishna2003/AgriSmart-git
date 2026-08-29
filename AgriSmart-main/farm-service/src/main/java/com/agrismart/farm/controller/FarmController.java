package com.agrismart.farm.controller;

import com.agrismart.farm.dto.FarmRequest;
import com.agrismart.farm.dto.FarmResponse;
import com.agrismart.farm.service.FarmService;
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

@RestController
@RequestMapping("/api/farms")
@Tag(name = "Farm Management", description = "Endpoints for farm configuration, tracking, and details retrieval")
public class FarmController {

    private final FarmService farmService;
    public FarmController(FarmService farmService) {
    	this.farmService=farmService;
    }
    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Add a new farm", description = "Farmer registers a new farm plot. Coordinates and soil specifications are optional.")
    public ResponseEntity<FarmResponse> addFarm(
            Authentication authentication,
            @Valid @RequestBody FarmRequest request
    ) {
        Long userId = (Long) authentication.getCredentials();
        return new ResponseEntity<>(farmService.addFarm(request, userId), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Update an existing farm", description = "Farmer updates specifications of a farm they own.")
    public ResponseEntity<FarmResponse> updateFarm(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody FarmRequest request
    ) {
        Long userId = (Long) authentication.getCredentials();
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");
        return ResponseEntity.ok(farmService.updateFarm(id, request, userId, userRole));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Delete a farm", description = "Farmer deletes a farm they own. Deletes all associated crops and logs.")
    public ResponseEntity<Void> deleteFarm(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = (Long) authentication.getCredentials();
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");
        farmService.deleteFarm(id, userId, userRole);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get farm by ID", description = "Retrieve details of a farm. Farmers can only retrieve their own; Officers and Admins can retrieve any.")
    public ResponseEntity<FarmResponse> getFarmById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = (Long) authentication.getCredentials();
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");
        return ResponseEntity.ok(farmService.getFarmById(id, userId, userRole));
    }

    @GetMapping
    @Operation(summary = "View all farms", description = "Retrieve list of farms with pagination. Farmers see only theirs; Officers and Admins see all.")
    public ResponseEntity<Page<FarmResponse>> viewFarms(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "farmId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Long userId = (Long) authentication.getCredentials();
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("");

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(farmService.viewFarms(userId, userRole, pageable));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint", description = "Returns service availability status")
    public ResponseEntity<java.util.Map<String, Object>> healthCheck() {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("service", "Farm Service");
        map.put("status", "UP");
        map.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(map);
    }
}
