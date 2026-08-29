package com.agrismart.ai.dto;

public class AiRecommendationRequest {

    private Long farmId;
    private Long cropId;

    public Long getFarmId() {
        return farmId;
    }

    public void setFarmId(Long farmId) {
        this.farmId = farmId;
    }

    public Long getCropId() {
        return cropId;
    }

    public void setCropId(Long cropId) {
        this.cropId = cropId;
    }
}