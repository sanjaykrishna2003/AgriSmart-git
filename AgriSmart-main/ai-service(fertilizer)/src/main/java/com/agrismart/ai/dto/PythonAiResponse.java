package com.agrismart.ai.dto;

public class PythonAiResponse {

    private Boolean success;
    private String fertilizerRecommendation;
    private String irrigationRecommendation;
    private String error;

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getFertilizerRecommendation() {
        return fertilizerRecommendation;
    }

    public void setFertilizerRecommendation(String fertilizerRecommendation) {
        this.fertilizerRecommendation = fertilizerRecommendation;
    }

    public String getIrrigationRecommendation() {
        return irrigationRecommendation;
    }

    public void setIrrigationRecommendation(String irrigationRecommendation) {
        this.irrigationRecommendation = irrigationRecommendation;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}