package com.agrismart.analytics.controller;

import com.agrismart.analytics.service.NotificationService;
import com.agrismart.analytics.service.SchemeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schemes")
@Tag(name = "Government Schemes & Recommendations", description = "Endpoints for discovering agricultural schemes, checking eligibility, and recommending options")
public class SchemeController {

    private final SchemeService schemeService;
    public SchemeController(SchemeService schemeService) {
        this.schemeService= schemeService;
    }
    @GetMapping
    @Operation(summary = "Get all government schemes", description = "Retrieve list of all registered government schemes and subsidies.")
    public ResponseEntity<List<Map<String, Object>>> getAllSchemes() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    @GetMapping("/recommend")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Get scheme recommendations for current user", description = "Calculate and retrieve eligible schemes matching the farmer's state, farm area, and active crops.")
    public ResponseEntity<List<Map<String, Object>>> getRecommendedSchemes(Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(schemeService.getRecommendedSchemes(userId));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Apply to scheme", description = "Farmer applies to a specific scheme")
    public ResponseEntity<Map<String, Object>> applyToScheme(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam Long schemeId) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(schemeService.applyToScheme(userId, schemeId));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/withdraw")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Withdraw application", description = "Farmer withdraws an application from a scheme")
    public ResponseEntity<Void> withdrawApplication(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam Long schemeId) {
        Long userId = (Long) authentication.getCredentials();
        schemeService.withdrawApplication(userId, schemeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/applications/me")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Get my applications", description = "Farmer views their own applications")
    public ResponseEntity<List<Map<String, Object>>> getMyApplications(Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(schemeService.getUserApplications(userId));
    }

    @GetMapping("/applications/user/{userId}")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Get user applications", description = "Officer views applications of a specific user")
    public ResponseEntity<List<Map<String, Object>>> getUserApplications(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        return ResponseEntity.ok(schemeService.getUserApplications(userId));
    }

    @GetMapping("/applications")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Get all applications", description = "Officer views all applications across all users")
    public ResponseEntity<List<Map<String, Object>>> getAllApplications() {
        return ResponseEntity.ok(schemeService.getAllApplications());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Get scheme stats", description = "Officer views scheme statistics")
    public ResponseEntity<Map<String, Object>> getSchemeStats() {
        return ResponseEntity.ok(schemeService.getSchemeStats());
    }

    @PutMapping("/applications/{applicationId}/status")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Update application status", description = "Officer approves or rejects a scheme application")
    public ResponseEntity<Void> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam String status) {
        schemeService.updateApplicationStatus(applicationId, status);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a scheme", description = "Admin creates a new government scheme")
    public ResponseEntity<Map<String, Object>> createScheme(
            Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        Long adminUserId = authentication != null ? (Long) authentication.getCredentials() : null;
        String adminName = authentication != null ? (String) authentication.getPrincipal() : "Admin";
        return ResponseEntity.ok(schemeService.createScheme(payload, adminUserId, adminName));
    }

    @PutMapping("/{schemeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a scheme", description = "Admin updates an existing government scheme")
    public ResponseEntity<Map<String, Object>> updateScheme(
            Authentication authentication,
            @PathVariable Long schemeId,
            @RequestBody Map<String, Object> payload) {
        Long adminUserId = authentication != null ? (Long) authentication.getCredentials() : null;
        String adminName = authentication != null ? (String) authentication.getPrincipal() : "Admin";
        return ResponseEntity.ok(schemeService.updateScheme(schemeId, payload, adminUserId, adminName));
    }

    @DeleteMapping("/{schemeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a scheme", description = "Admin deletes or archives a government scheme")
    public ResponseEntity<Void> deleteScheme(
            Authentication authentication,
            @PathVariable Long schemeId) {
        Long adminUserId = authentication != null ? (Long) authentication.getCredentials() : null;
        String adminName = authentication != null ? (String) authentication.getPrincipal() : "Admin";
        schemeService.deleteScheme(schemeId, adminUserId, adminName);
        return ResponseEntity.noContent().build();
    }
}
