package com.agrismart.weather.dto;

import java.time.LocalDateTime;

public class WeatherResponse {
    private Double temperature; // Celsius
    private Double humidity;    // percentage
    private Double rainfall;    // mm
    private String description; // e.g., "scattered clouds", "light rain"
    private Double windSpeed;   // m/s
    private LocalDateTime recordedAt;

    public WeatherResponse() {
    }

    public WeatherResponse(Double temperature, Double humidity, Double rainfall, String description, Double windSpeed, LocalDateTime recordedAt) {
        this.temperature = temperature;
        this.humidity = humidity;
        this.rainfall = rainfall;
        this.description = description;
        this.windSpeed = windSpeed;
        this.recordedAt = recordedAt;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public Double getRainfall() {
        return rainfall;
    }

    public void setRainfall(Double rainfall) {
        this.rainfall = rainfall;
    }

    public String getRainfallFormatted() {
        if (rainfall == null || rainfall == 0.0) {
            return "No rainfall";
        }
        return String.format("%.1f mm", rainfall);
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public static WeatherResponseBuilder builder() {
        return new WeatherResponseBuilder();
    }

    public static class WeatherResponseBuilder {
        private Double temperature;
        private Double humidity;
        private Double rainfall;
        private String description;
        private Double windSpeed;
        private LocalDateTime recordedAt;

        public WeatherResponseBuilder temperature(Double temperature) {
            this.temperature = temperature;
            return this;
        }

        public WeatherResponseBuilder humidity(Double humidity) {
            this.humidity = humidity;
            return this;
        }

        public WeatherResponseBuilder rainfall(Double rainfall) {
            this.rainfall = rainfall;
            return this;
        }

        public WeatherResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public WeatherResponseBuilder windSpeed(Double windSpeed) {
            this.windSpeed = windSpeed;
            return this;
        }

        public WeatherResponseBuilder recordedAt(LocalDateTime recordedAt) {
            this.recordedAt = recordedAt;
            return this;
        }

        public WeatherResponse build() {
            return new WeatherResponse(temperature, humidity, rainfall, description, windSpeed, recordedAt);
        }
    }
}

