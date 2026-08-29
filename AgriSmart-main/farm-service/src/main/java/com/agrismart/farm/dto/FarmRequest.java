package com.agrismart.farm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class FarmRequest {

    @NotBlank(message = "Farm name is required")
    private String farmName;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Area is required")
    @Positive(message = "Area must be a positive number")
    private Double area;

    private String soilType;
    private String waterSource;
    private Double latitude;
    private Double longitude;

    public FarmRequest() {
    }

    public FarmRequest(String farmName, String location, Double area, String soilType, String waterSource, Double latitude, Double longitude) {
        this.farmName = farmName;
        this.location = location;
        this.area = area;
        this.soilType = soilType;
        this.waterSource = waterSource;
        this.latitude = latitude;
        this.longitude = longitude;
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

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public String getWaterSource() {
        return waterSource;
    }

    public void setWaterSource(String waterSource) {
        this.waterSource = waterSource;
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
}

