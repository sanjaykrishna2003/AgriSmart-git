package com.agrismart.ai.service;

import com.agrismart.ai.dto.CropData;
import com.agrismart.ai.dto.FarmData;
import com.agrismart.ai.dto.SoilHealthData;
import com.agrismart.ai.dto.WeatherData;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AiDataService {

    private final RestTemplate restTemplate;

    public AiDataService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private HttpHeaders buildAuthHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        if (token != null && !token.isBlank()) {
            String formattedToken = token.startsWith("Bearer ") ? token : "Bearer " + token;
            headers.set("Authorization", formattedToken);
        }
        return headers;
    }

    public FarmData getFarm(Long farmId, String token) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(buildAuthHeaders(token));
            ResponseEntity<FarmData> response = restTemplate.exchange(
                    "http://localhost:8082/api/farms/" + farmId,
                    HttpMethod.GET,
                    entity,
                    FarmData.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("AiDataService: Failed to fetch farm details: " + e.getMessage());
            return null;
        }
    }

    public CropData getCrop(Long cropId, String token) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(buildAuthHeaders(token));
            ResponseEntity<CropData> response = restTemplate.exchange(
                    "http://localhost:8083/api/crops/" + cropId,
                    HttpMethod.GET,
                    entity,
                    CropData.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("AiDataService: Failed to fetch crop details: " + e.getMessage());
            return null;
        }
    }

    public WeatherData getWeather(Long farmId, String token) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(buildAuthHeaders(token));
            ResponseEntity<WeatherData> response = restTemplate.exchange(
                    "http://localhost:8084/api/weather/current?farmId=" + farmId,
                    HttpMethod.GET,
                    entity,
                    WeatherData.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("AiDataService: Failed to fetch weather details: " + e.getMessage());
            return null;
        }
    }

    public SoilHealthData getSoilHealth(String token) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(buildAuthHeaders(token));
            ResponseEntity<SoilHealthData> response = restTemplate.exchange(
                    "http://localhost:8081/api/users/soil-health",
                    HttpMethod.GET,
                    entity,
                    SoilHealthData.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("AiDataService: Failed to fetch soil health: " + e.getMessage());
            SoilHealthData defaultData = new SoilHealthData();
            defaultData.setNitrogen(60.0);
            defaultData.setPhosphorus(40.0);
            defaultData.setPotassium(50.0);
            defaultData.setPh(6.5);
            return defaultData;
        }
    }
}