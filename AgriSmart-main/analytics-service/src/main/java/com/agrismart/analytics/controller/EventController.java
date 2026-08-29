package com.agrismart.analytics.controller;

import com.agrismart.analytics.dto.EventRequest;
import com.agrismart.analytics.dto.EventRegistrationRequest;
import com.agrismart.analytics.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Important Events", description = "Endpoints for managing farmer events and RSVPs")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    @Operation(summary = "Get all events", description = "List all active events for farmers and admins")
    public ResponseEntity<List<Map<String, Object>>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Create an event", description = "Admin or Officer creates a new farmer event")
    public ResponseEntity<Map<String, Object>> createEvent(
            @RequestBody EventRequest request,
            Authentication authentication) {
        String createdBy = authentication.getPrincipal().toString();
        return ResponseEntity.ok(eventService.createEvent(
                request.getTitle(),
                request.getDescription(),
                request.getEventDate(),
                request.getLocation(),
                request.getCategory(),
                createdBy
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Delete an event", description = "Admin or Officer deletes an event and its registrations")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    @Operation(summary = "Register/RSVP for an event", description = "Farmer registers participation for an event")
    public ResponseEntity<Map<String, Object>> registerForEvent(
            @PathVariable Long id,
            @RequestBody EventRegistrationRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(eventService.registerForEvent(
                id,
                userId,
                request.getFarmerName(),
                request.getPhoneNumber(),
                request.getAttendeesCount(),
                request.getRemarks()
        ));
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Get event attendee list", description = "Admin views list of farmers who registered for an event")
    public ResponseEntity<List<Map<String, Object>>> getEventRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventRegistrations(id));
    }

    @GetMapping("/registrations/my")
    @Operation(summary = "Get farmer's event registrations", description = "Farmer checks which events they registered for")
    public ResponseEntity<List<Map<String, Object>>> getMyRegistrations(Authentication authentication) {
        Long userId = (Long) authentication.getCredentials();
        return ResponseEntity.ok(eventService.getFarmerRegistrations(userId));
    }
}
