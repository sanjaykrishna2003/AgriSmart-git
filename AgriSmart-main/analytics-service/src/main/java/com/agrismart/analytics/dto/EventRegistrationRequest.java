package com.agrismart.analytics.dto;

public class EventRegistrationRequest {
    private String farmerName;
    private String phoneNumber;
    private Integer attendeesCount;
    private String remarks;

    public EventRegistrationRequest() {}

    public EventRegistrationRequest(String farmerName, String phoneNumber, Integer attendeesCount, String remarks) {
        this.farmerName = farmerName;
        this.phoneNumber = phoneNumber;
        this.attendeesCount = attendeesCount;
        this.remarks = remarks;
    }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Integer getAttendeesCount() { return attendeesCount; }
    public void setAttendeesCount(Integer attendeesCount) { this.attendeesCount = attendeesCount; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
