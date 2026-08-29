package com.agrismart.farm.dto;

public class FarmResponse {
    private Long farmId;
    private String farmName;
    private String location;
    private Double area;
    private String soilType;
    private String waterSource;
    private Double latitude;
    private Double longitude;
    private Long userId;

    public FarmResponse() {
    }

    public FarmResponse(Long farmId, String farmName, String location, Double area, String soilType, String waterSource, Double latitude, Double longitude, Long userId) {
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

    public static FarmResponseBuilder builder() {
        return new FarmResponseBuilder();
    }

    public static class FarmResponseBuilder {
        private Long farmId;
        private String farmName;
        private String location;
        private Double area;
        private String soilType;
        private String waterSource;
        private Double latitude;
        private Double longitude;
        private Long userId;

        public FarmResponseBuilder farmId(Long farmId) {
            this.farmId = farmId;
            return this;
        }

        public FarmResponseBuilder farmName(String farmName) {
            this.farmName = farmName;
            return this;
        }

        public FarmResponseBuilder location(String location) {
            this.location = location;
            return this;
        }

        public FarmResponseBuilder area(Double area) {
            this.area = area;
            return this;
        }

        public FarmResponseBuilder soilType(String soilType) {
            this.soilType = soilType;
            return this;
        }

        public FarmResponseBuilder waterSource(String waterSource) {
            this.waterSource = waterSource;
            return this;
        }

        public FarmResponseBuilder latitude(Double latitude) {
            this.latitude = latitude;
            return this;
        }

        public FarmResponseBuilder longitude(Double longitude) {
            this.longitude = longitude;
            return this;
        }

        public FarmResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public FarmResponse build() {
            return new FarmResponse(farmId, farmName, location, area, soilType, waterSource, latitude, longitude, userId);
        }
    }
}

