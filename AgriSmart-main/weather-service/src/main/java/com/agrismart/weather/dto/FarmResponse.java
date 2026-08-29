package com.agrismart.weather.dto;

public class FarmResponse {
    private Long farmId;
    private String farmName;
    private Double latitude;
    private Double longitude;
    private Long userId;

    public FarmResponse() {
    }

    public FarmResponse(Long farmId, String farmName, Double latitude, Double longitude, Long userId) {
        this.farmId = farmId;
        this.farmName = farmName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.userId = userId;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}

