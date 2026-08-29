package com.agrismart.crop.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "crops")
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "crop_id")
    private Long cropId;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Column(nullable = false)
    private Integer duration; // in days

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CropStatus status;

    @Column(length = 50)
    private String season; // KHARIF, RABI, etc.

    @Column(name = "planted_date")
    private LocalDate plantedDate;

    @Column(name = "expected_harvest_date")
    private LocalDate expectedHarvestDate;

    @Column(name = "farm_id", nullable = false)
    private Long farmId;

    private Double yield; // yield in kg/tonnes

    private Double area; // planted crop area in acres

    public Crop() {
    }

    public Crop(Long cropId, String cropName, Integer duration, String description, CropStatus status, String season, LocalDate plantedDate, LocalDate expectedHarvestDate, Long farmId, Double yield, Double area) {
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

    public static CropBuilder builder() {
        return new CropBuilder();
    }

    public static class CropBuilder {
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

        public CropBuilder cropId(Long cropId) {
            this.cropId = cropId;
            return this;
        }

        public CropBuilder cropName(String cropName) {
            this.cropName = cropName;
            return this;
        }

        public CropBuilder duration(Integer duration) {
            this.duration = duration;
            return this;
        }

        public CropBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CropBuilder status(CropStatus status) {
            this.status = status;
            return this;
        }

        public CropBuilder season(String season) {
            this.season = season;
            return this;
        }

        public CropBuilder plantedDate(LocalDate plantedDate) {
            this.plantedDate = plantedDate;
            return this;
        }

        public CropBuilder expectedHarvestDate(LocalDate expectedHarvestDate) {
            this.expectedHarvestDate = expectedHarvestDate;
            return this;
        }

        public CropBuilder farmId(Long farmId) {
            this.farmId = farmId;
            return this;
        }

        public CropBuilder yield(Double yield) {
            this.yield = yield;
            return this;
        }

        public CropBuilder area(Double area) {
            this.area = area;
            return this;
        }

        public Crop build() {
            return new Crop(cropId, cropName, duration, description, status, season, plantedDate, expectedHarvestDate, farmId, yield, area);
        }
    }
}
