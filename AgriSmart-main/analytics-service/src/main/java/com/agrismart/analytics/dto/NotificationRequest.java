package com.agrismart.analytics.dto;

public class NotificationRequest {
    private String title;
    private String message;
    private String type;
    private String priority;
    private String targetRegion;

    public NotificationRequest() {
    }

    public NotificationRequest(String title, String message, String type, String priority, String targetRegion) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.priority = priority;
        this.targetRegion = targetRegion;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getTargetRegion() {
        return targetRegion;
    }

    public void setTargetRegion(String targetRegion) {
        this.targetRegion = targetRegion;
    }
}

