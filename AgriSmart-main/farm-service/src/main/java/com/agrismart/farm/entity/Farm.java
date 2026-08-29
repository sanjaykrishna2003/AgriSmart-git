package com.agrismart.farm.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "farms")
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "farm_id")
    private Long farmId;

    @Column(name = "farm_name", nullable = false, length = 100)
    private String farmName;

    @Column(nullable = false, length = 2000)
    private String location;

    @Column(nullable = false)
    private Double area;

    @Column(name = "soil_type", length = 50)
    private String soilType;

    @Column(name = "water_source", length = 100)
    private String waterSource;

    private Double latitude;
    private Double longitude;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    public Farm() {
    }

    public Farm(Long farmId, String farmName, String location, Double area, String soilType, String waterSource, Double latitude, Double longitude, Long userId) {
        this.farmId = farmId;
        this.farmName = farmName;
        this.location = location;
        this.area = area;
        this.soilType = soilType;
        this.waterSource = waterSource;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public static FarmBuilder builder() {
        return new FarmBuilder();
    }

    public static class FarmBuilder {
        private Long farmId;
        private String farmName;
        private String location;
        private Double area;
        private String soilType;
        private String waterSource;
        private Double latitude;
        private Double longitude;
        private Long userId;

        public FarmBuilder farmId(Long farmId) {
            this.farmId = farmId;
            return this;
        }

        public FarmBuilder farmName(String farmName) {
            this.farmName = farmName;
            return this;
        }

        public FarmBuilder location(String location) {
            this.location = location;
            return this;
        }

        public FarmBuilder area(Double area) {
            this.area = area;
            return this;
        }

        public FarmBuilder soilType(String soilType) {
            this.soilType = soilType;
            return this;
        }

        public FarmBuilder waterSource(String waterSource) {
            this.waterSource = waterSource;
            return this;
        }

        public FarmBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public FarmBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public FarmBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public Farm build() {
            return new Farm(farmId, farmName, location, area, soilType, waterSource, latitude, longitude, userId);
        }
    }
}

