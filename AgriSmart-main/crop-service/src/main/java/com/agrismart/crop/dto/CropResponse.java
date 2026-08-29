package com.agrismart.crop.dto;

import com.agrismart.crop.entity.CropStatus;
import java.time.LocalDate;

public class CropResponse {
    private Long cropId;
    private String cropName;
    private Integer duration;
    private String description;
    private CropStatus status;
    private String season;
    private LocalDate plantedDate;
    private LocalDate expectedHarvestDate;
    private Long farmId;
    private Double yield;
    private Double area;

    public CropResponse() {
    }

    public CropResponse(Long cropId, String cropName, Integer duration, String description, CropStatus status, String season, LocalDate plantedDate, LocalDate expectedHarvestDate, Long farmId, Double yield, Double area) {
        this.cropId = cropId;
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

    public Long getCropId() {
        return cropId;
    }

    public void setCropId(Long cropId) {
        this.cropId = cropId;
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

    public static CropResponseBuilder builder() {
        return new CropResponseBuilder();
    }

    public static class CropResponseBuilder {
        private Long cropId;
        private String cropName;
        private Integer duration;
        private String description;
        private CropStatus status;
        private String season;
        private LocalDate plantedDate;
        private LocalDate expectedHarvestDate;
        private Long farmId;
        private Double yield;
        private Double area;

        public CropResponseBuilder cropId(Long cropId) {
            this.cropId = cropId;
            return this;
        }

        public CropResponseBuilder cropName(String cropName) {
            this.cropName = cropName;
            return this;
        }

        public CropResponseBuilder duration(Integer duration) {
            this.duration = duration;
            return this;
        }

        public CropResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CropResponseBuilder status(CropStatus status) {
            this.status = status;
            return this;
        }

        public CropResponseBuilder season(String season) {
            this.season = season;
            return this;
        }

        public CropResponseBuilder plantedDate(LocalDate plantedDate) {
            this.plantedDate = plantedDate;
            return this;
        }

        public CropResponseBuilder expectedHarvestDate(LocalDate expectedHarvestDate) {
            this.expectedHarvestDate = expectedHarvestDate;
            return this;
        }

        public CropResponseBuilder farmId(Long farmId) {
            this.farmId = farmId;
            return this;
        }

        public CropResponseBuilder yield(Double yield) {
            this.yield = yield;
            return this;
        }

        public CropResponseBuilder area(Double area) {
            this.area = area;
            return this;
        }

        public CropResponse build() {
            return new CropResponse(cropId, cropName, duration, description, status, season, plantedDate, expectedHarvestDate, farmId, yield, area);
        }
    }
}
