package com.agrismart.analytics.dto;

public class EventRequest {
    private String title;
    private String description;
    private String eventDate;
    private String location;
    private String category;

    public EventRequest() {}

    public EventRequest(String title, String description, String eventDate, String location, String category) {
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.location = location;
        this.category = category;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
