package com.agrismart.crop.dto;

import java.util.List;

public class ChatbotRequest {
    private String message;
    private String language;
    private String farmerName;
    private String district;
    private String state;
    private String soilType;
    private List<String> activeCrops;
    private List<ChatMessageDto> history;

    public ChatbotRequest() {
    }

    public ChatbotRequest(String message, String language, String farmerName, String district, String state, String soilType, List<String> activeCrops, List<ChatMessageDto> history) {
        this.message = message;
        this.language = language;
        this.farmerName = farmerName;
        this.district = district;
        this.state = state;
        this.soilType = soilType;
        this.activeCrops = activeCrops;
        this.history = history;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public List<String> getActiveCrops() {
        return activeCrops;
    }

    public void setActiveCrops(List<String> activeCrops) {
        this.activeCrops = activeCrops;
    }

    public List<ChatMessageDto> getHistory() {
        return history;
    }

    public void setHistory(List<ChatMessageDto> history) {
        this.history = history;
    }
}

