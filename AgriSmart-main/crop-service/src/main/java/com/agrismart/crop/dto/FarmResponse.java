package com.agrismart.crop.dto;

public class FarmResponse {
    private Long farmId;
    private String farmName;
    private String location;
    private Double area;
    private Long userId;

    public FarmResponse() {
    }

    public FarmResponse(Long farmId, String farmName, String location, Double area, Long userId) {
        this.farmId = farmId;
        this.farmName = farmName;
        this.location = location;
        this.area = area;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}

