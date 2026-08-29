package com.agrismart.weather.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "weather_history")
public class WeatherHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "weather_id")
    private Long weatherId;

    @Column(nullable = false)
    private Double temperature;

    private Double rainfall; // in mm

    private Double humidity; // in percentage

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "weather_condition", length = 100)
    private String weatherCondition;

    @Column(name = "farm_id", nullable = false)
    private Long farmId;

    public WeatherHistory() {
    }

    public WeatherHistory(Long weatherId, Double temperature, Double rainfall, Double humidity, LocalDateTime recordedAt, String weatherCondition, Long farmId) {
        this.weatherId = weatherId;
        this.temperature = temperature;
        this.rainfall = rainfall;
        this.humidity = humidity;
        this.recordedAt = recordedAt;
        this.weatherCondition = weatherCondition;
        this.farmId = farmId;
    }

    public Long getWeatherId() {
        return weatherId;
    }

    public void setWeatherId(Long weatherId) {
        this.weatherId = weatherId;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getRainfall() {
        return rainfall;
    }

    public void setRainfall(Double rainfall) {
        this.rainfall = rainfall;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public String getWeatherCondition() {
        return weatherCondition;
    }

    public void setWeatherCondition(String weatherCondition) {
        this.weatherCondition = weatherCondition;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }

    public static WeatherHistoryBuilder builder() {
        return new WeatherHistoryBuilder();
    }

    public static class WeatherHistoryBuilder {
        private Long weatherId;
        private Double temperature;
        private Double rainfall;
        private Double humidity;
        private LocalDateTime recordedAt;
        private String weatherCondition;
        private Long farmId;

        public WeatherHistoryBuilder weatherId(Long weatherId) {
            this.weatherId = weatherId;
            return this;
        }

        public WeatherHistoryBuilder temperature(Double temperature) {
            this.temperature = temperature;
            return this;
        }

        public WeatherHistoryBuilder rainfall(Double rainfall) {
            this.rainfall = rainfall;
            return this;
        }

        public WeatherHistoryBuilder humidity(Double humidity) {
            this.humidity = humidity;
            return this;
        }

        public WeatherHistoryBuilder recordedAt(LocalDateTime recordedAt) {
            this.recordedAt = recordedAt;
            return this;
        }

        public WeatherHistoryBuilder weatherCondition(String weatherCondition) {
            this.weatherCondition = weatherCondition;
            return this;
        }

        public WeatherHistoryBuilder farmId(Long farmId) {
            this.farmId = farmId;
            return this;
        }

        public WeatherHistory build() {
            return new WeatherHistory(weatherId, temperature, rainfall, humidity, recordedAt, weatherCondition, farmId);
        }
    }
}

