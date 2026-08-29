package com.agrismart.analytics.controller;

import com.agrismart.analytics.dto.NotificationRequest;
import com.agrismart.analytics.service.AnalyticsService;
import com.agrismart.analytics.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for managing notifications")
public class NotificationController {

    private final NotificationService notificationService;
    public NotificationController(NotificationService notificationService) {
        this.notificationService= notificationService;
    }
    @PostMapping
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Create notification", description = "Officer or Admin creates a new notification")
    public ResponseEntity<Map<String, Object>> createNotification(
            @RequestBody NotificationRequest request,
            Authentication authentication) {
        Long senderId = (Long) authentication.getCredentials();
        String senderName = authentication.getPrincipal().toString();
        
        return ResponseEntity.ok(notificationService.createNotification(
                request.getTitle(),
                request.getMessage(),
                request.getType(),
                request.getPriority(),
                request.getTargetRegion(),
                senderId,
                senderName
        ));
    }

    @GetMapping
    @Operation(summary = "Get all notifications", description = "List all notifications (accessible by farmers too)")
    public ResponseEntity<List<Map<String, Object>>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Delete notification", description = "Officer or Admin deletes a notification")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Get notification stats", description = "Officer views notification statistics")
    public ResponseEntity<Map<String, Object>> getNotificationStats() {
        return ResponseEntity.ok(notificationService.getNotificationStats());
    }
}
