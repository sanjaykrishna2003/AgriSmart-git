package com.agrismart.weather.controller;

import com.agrismart.weather.dto.ForecastResponse;
import com.agrismart.weather.dto.WeatherResponse;
import com.agrismart.weather.entity.WeatherHistory;
import com.agrismart.weather.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/weather")
@Tag(name = "Weather Intelligence", description = "Endpoints for weather lookup, forecast extraction, and historical logging")
public class WeatherController {

    private final WeatherService weatherService;
    public WeatherController(WeatherService weatherService) {
    	this.weatherService=weatherService;
    }
    @GetMapping("/current/{farmId}")
    @Operation(summary = "Get current weather for farm", description = "Retrieve current weather readings for a farm (using its latitude and longitude) and log the values in historical records.")
    public ResponseEntity<WeatherResponse> getCurrentWeather(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long farmId
    ) {
        String token = authHeader.substring(7);
        return ResponseEntity.ok(weatherService.fetchCurrentWeather(farmId, token));
    }

    @GetMapping("/forecast/{farmId}")
    @Operation(summary = "Get 5-day weather forecast", description = "Retrieve 5-day weather predictions for a farm plot.")
    public ResponseEntity<ForecastResponse> getWeatherForecast(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long farmId
    ) {
        String token = authHeader.substring(7);
        return ResponseEntity.ok(weatherService.forecastWeather(farmId, token));
    }

    @GetMapping("/history/{farmId}")
    @Operation(summary = "Get weather history", description = "Retrieve historical weather logs for a farm.")
    public ResponseEntity<List<WeatherHistory>> getWeatherHistory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long farmId
    ) {
        String token = authHeader.substring(7);
        return ResponseEntity.ok(weatherService.getWeatherHistory(farmId, token));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint", description = "Returns service availability status")
    public ResponseEntity<java.util.Map<String, Object>> healthCheck() {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        map.put("service", "Weather Service");
        map.put("status", "UP");
        map.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(map);
    }
}
