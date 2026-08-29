package com.agrismart.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrismart.ai.dto.AiRecommendationRequest;
import com.agrismart.ai.dto.AiRecommendationResponse;
import com.agrismart.ai.service.AiAdvisoryService;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiAdvisoryController {

    private final AiAdvisoryService aiAdvisoryService;

    public AiAdvisoryController(AiAdvisoryService aiAdvisoryService) {
        this.aiAdvisoryService = aiAdvisoryService;
    }

    @PostMapping("/recommendation")
    public ResponseEntity<AiRecommendationResponse> getRecommendation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody AiRecommendationRequest request
    ) {
        AiRecommendationResponse response = aiAdvisoryService.generateRecommendation(request, authHeader);
        return ResponseEntity.ok(response);
    }

    @org.springframework.web.bind.annotation.GetMapping("/health")
    public ResponseEntity<java.util.Map<String, Object>> healthCheck() {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("service", "AI Service");
        map.put("status", "UP");
        map.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(map);
    }
}