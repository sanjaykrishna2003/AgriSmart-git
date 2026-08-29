package com.agrismart.ai.dto;

public class AiRecommendationResponse {

    private String fertilizer;
    private String irrigation;
    private String crop;

    public AiRecommendationResponse() {
    }

    public AiRecommendationResponse(
            String fertilizer,
            String irrigation,
            String crop) {

        this.fertilizer = fertilizer;
        this.irrigation = irrigation;
        this.crop = crop;
    }

    public String getFertilizer() {
        return fertilizer;
    }

    public void setFertilizer(String fertilizer) {
        this.fertilizer = fertilizer;
    }

    public String getIrrigation() {
        return irrigation;
    }

    public void setIrrigation(String irrigation) {
        this.irrigation = irrigation;
    }

    public String getCrop() {
        return crop;
    }

    public void setCrop(String crop) {
        this.crop = crop;
    }
}