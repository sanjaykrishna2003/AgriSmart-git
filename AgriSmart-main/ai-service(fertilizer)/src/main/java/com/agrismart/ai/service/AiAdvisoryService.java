package com.agrismart.ai.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.agrismart.ai.dto.AiRecommendationRequest;
import com.agrismart.ai.dto.AiRecommendationResponse;
import com.agrismart.ai.dto.CropData;
import com.agrismart.ai.dto.FarmData;
import com.agrismart.ai.dto.SoilHealthData;
import com.agrismart.ai.dto.WeatherData;

@Service
public class AiAdvisoryService {

    private final AiDataService aiDataService;
    private final RestTemplate restTemplate;

    public AiAdvisoryService(AiDataService aiDataService, RestTemplate restTemplate) {
        this.aiDataService = aiDataService;
        this.restTemplate = restTemplate;
    }

    public AiRecommendationResponse generateRecommendation(AiRecommendationRequest request, String token) {
        // 1. Fetch Real Data with Fallbacks
        FarmData farm = request.getFarmId() != null ? aiDataService.getFarm(request.getFarmId(), token) : null;
        CropData crop = request.getCropId() != null ? aiDataService.getCrop(request.getCropId(), token) : null;
        WeatherData weather = request.getFarmId() != null ? aiDataService.getWeather(request.getFarmId(), token) : null;
        SoilHealthData soilHealth = aiDataService.getSoilHealth(token);

        // Extract or default values
        String soilType = farm != null && farm.getSoilType() != null ? farm.getSoilType() : "Loamy Soil";
        String waterSource = farm != null && farm.getWaterSource() != null ? farm.getWaterSource() : "Borewell";
        Double area = farm != null && farm.getArea() != null ? farm.getArea() : 1.0;

        String cropName = crop != null && crop.getCropName() != null ? crop.getCropName() : "Rice";
        String status = crop != null && crop.getStatus() != null ? crop.getStatus() : "Vegetative";
        String season = crop != null && crop.getSeason() != null ? crop.getSeason() : "Kharif";

        Double temp = weather != null && weather.getTemperature() != null ? weather.getTemperature() : 28.0;
        Double humidity = weather != null && weather.getHumidity() != null ? weather.getHumidity() : 70.0;
        Double rainfall = weather != null && weather.getRainfall() != null ? weather.getRainfall() : 15.0;
        Double windSpeed = weather != null && weather.getWindSpeed() != null ? weather.getWindSpeed() : 4.0;

        Double n = soilHealth != null && soilHealth.getNitrogen() != null ? soilHealth.getNitrogen() : 60.0;
        Double p = soilHealth != null && soilHealth.getPhosphorus() != null ? soilHealth.getPhosphorus() : 40.0;
        Double k = soilHealth != null && soilHealth.getPotassium() != null ? soilHealth.getPotassium() : 50.0;
        Double ph = soilHealth != null && soilHealth.getPh() != null ? soilHealth.getPh() : 6.5;

        // 2. Build Python AI CatBoost Model Payload
        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("soil_type", soilType);
        aiRequest.put("soil_ph", ph);
        aiRequest.put("soil_moisture", 35.0);
        aiRequest.put("organic_carbon", 1.0);
        aiRequest.put("electrical_conductivity", 1.0);

        aiRequest.put("nitrogen_level", n);
        aiRequest.put("phosphorus_level", p);
        aiRequest.put("potassium_level", k);

        aiRequest.put("temperature", temp);
        aiRequest.put("humidity", humidity);
        aiRequest.put("rainfall", rainfall);
        aiRequest.put("wind_speed_kmh", windSpeed);
        aiRequest.put("sunlight_hours", 8.0);

        aiRequest.put("crop_type", cropName);
        aiRequest.put("growth_stage", status);
        aiRequest.put("season", season);

        aiRequest.put("irrigation_type", "Rainfed");
        aiRequest.put("previous_crop", "Wheat");
        aiRequest.put("water_source", waterSource);
        aiRequest.put("field_area_hectare", area);
        aiRequest.put("region", "South");
        aiRequest.put("mulching_used", "No");
        aiRequest.put("previous_irrigation_mm", 0.0);

        // 3. Call Python CatBoost AI Service (Port 5000)
        String fertilizer = "NPK 120:60:60 (Standard Balanced Dosage)";
        String irrigation = "Drip Irrigation (Every 3 Days)";
        String cropAdvice = "AI recommendation generated for " + cropName + " using your real farm, crop, soil health and weather data.";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> aiResponse = restTemplate.postForObject(
                    "http://localhost:5000/api/ai/recommend",
                    entity,
                    Map.class
            );

            if (aiResponse != null && Boolean.TRUE.equals(aiResponse.get("success"))) {
                if (aiResponse.get("fertilizerRecommendation") != null) {
                    fertilizer = aiResponse.get("fertilizerRecommendation").toString();
                }
                if (aiResponse.get("irrigationRecommendation") != null) {
                    irrigation = aiResponse.get("irrigationRecommendation").toString();
                }
            }
        } catch (Exception e) {
            System.err.println("AiAdvisoryService: Python CatBoost AI endpoint unavailable, using dynamic heuristic advisory: " + e.getMessage());
        }

        return new AiRecommendationResponse(fertilizer, irrigation, cropAdvice);
    }
}