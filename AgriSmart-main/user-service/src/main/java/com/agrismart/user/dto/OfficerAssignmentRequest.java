package com.agrismart.user.dto;

public class OfficerAssignmentRequest {
    private String district;
    private String state;

    public OfficerAssignmentRequest() {
    }

    public OfficerAssignmentRequest(String district, String state) {
        this.district = district;
        this.state = state;
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

    public static OfficerAssignmentRequestBuilder builder() {
        return new OfficerAssignmentRequestBuilder();
    }

    public static class OfficerAssignmentRequestBuilder {
        private String district;
        private String state;

        public OfficerAssignmentRequestBuilder district(String district) {
            this.district = district;
            return this;
        }

        public OfficerAssignmentRequestBuilder state(String state) {
            this.state = state;
            return this;
        }

        public OfficerAssignmentRequest build() {
            return new OfficerAssignmentRequest(district, state);
        }
    }
}
