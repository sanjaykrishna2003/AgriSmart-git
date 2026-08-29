package com.agrismart.crop.dto;

import com.agrismart.crop.entity.CropStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class CropRequest {

    @NotBlank(message = "Crop name is required")
    private String cropName;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer duration; // in days

    private String description;

    @NotNull(message = "Crop status is required")
    private CropStatus status;

    private String season;

    @NotNull(message = "Planted date is required")
    private LocalDate plantedDate;

    private LocalDate expectedHarvestDate;

    @NotNull(message = "Farm ID is required")
    private Long farmId;

    private Double yield;

    private Double area; // planted crop area in acres

    public CropRequest() {
    }

    public CropRequest(String cropName, Integer duration, String description, CropStatus status, String season, LocalDate plantedDate, LocalDate expectedHarvestDate, Long farmId, Double yield, Double area) {
        this.cropName = cropName;
        this.duration = duration;
        this.description = description;
        this.status = status;
        this.season = season;
        this.plantedDate = plantedDate;
        this.expectedHarvestDate = expectedHarvestDate;
        this.farmId = farmId;
        this.yield = yield;
        this.area = area;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CropStatus getStatus() {
        return status;
    }

    public void setStatus(CropStatus status) {
        this.status = status;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public LocalDate getPlantedDate() {
        return plantedDate;
    }

    public void setPlantedDate(LocalDate plantedDate) {
        this.plantedDate = plantedDate;
    }

    public LocalDate getExpectedHarvestDate() {
        return expectedHarvestDate;
    }

    public void setExpectedHarvestDate(LocalDate expectedHarvestDate) {
        this.expectedHarvestDate = expectedHarvestDate;
    }

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public Double getYield() {
        return yield;
    }

    public void setYield(Double yield) {
        this.yield = yield;
    }

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }
}
