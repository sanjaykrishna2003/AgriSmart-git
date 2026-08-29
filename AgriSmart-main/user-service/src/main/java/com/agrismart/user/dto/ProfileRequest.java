package com.agrismart.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProfileRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 15, message = "Phone number cannot exceed 15 characters")
    private String phone;

    private String district;
    private String state;
    
    // 1. Personal
    private String dob;
    private String gender;

    // 2. Location
    private String taluk;
    private String village;
    private String pincode;

    // 3. Land / Farmer Information
    private String landOwnershipType;
    private Double totalLandholding;
    private String farmerCategory;
    private Boolean ownershipDocumentAvailable;

    // 4. Financial
    private String annualIncomeRange;
    private Boolean incomeCertificateAvailable;

    // 5. Farm Assets
    private Boolean hasTractor;
    private Boolean hasMachinery;
    private Boolean hasIrrigationEquipment;
    private Boolean hasPumpSet;
    private Boolean hasStorageFacility;
    private Boolean hasGreenhouse;

    // 6. Farming Background
    private String farmingType;
    private Integer yearsFarming;
    private String organizationMembership;

    // Optional password update
    private String password;

    // Soil Health Parameters
    private Double nitrogen;
    private Double phosphorus;
    private Double potassium;
    private Double soilPh;
    private Double soilMoisture;
    private Double organicCarbon;
    private Double electricalConductivity;

    public ProfileRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getTaluk() { return taluk; }
    public void setTaluk(String taluk) { this.taluk = taluk; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getLandOwnershipType() { return landOwnershipType; }
    public void setLandOwnershipType(String landOwnershipType) { this.landOwnershipType = landOwnershipType; }

    public Double getTotalLandholding() { return totalLandholding; }
    public void setTotalLandholding(Double totalLandholding) { this.totalLandholding = totalLandholding; }

    public String getFarmerCategory() { return farmerCategory; }
    public void setFarmerCategory(String farmerCategory) { this.farmerCategory = farmerCategory; }

    public Boolean getOwnershipDocumentAvailable() { return ownershipDocumentAvailable; }
    public void setOwnershipDocumentAvailable(Boolean ownershipDocumentAvailable) { this.ownershipDocumentAvailable = ownershipDocumentAvailable; }

    public String getAnnualIncomeRange() { return annualIncomeRange; }
    public void setAnnualIncomeRange(String annualIncomeRange) { this.annualIncomeRange = annualIncomeRange; }

    public Boolean getIncomeCertificateAvailable() { return incomeCertificateAvailable; }
    public void setIncomeCertificateAvailable(Boolean incomeCertificateAvailable) { this.incomeCertificateAvailable = incomeCertificateAvailable; }

    public Boolean getHasTractor() { return hasTractor; }
    public void setHasTractor(Boolean hasTractor) { this.hasTractor = hasTractor; }

    public Boolean getHasMachinery() { return hasMachinery; }
    public void setHasMachinery(Boolean hasMachinery) { this.hasMachinery = hasMachinery; }

    public Boolean getHasIrrigationEquipment() { return hasIrrigationEquipment; }
    public void setHasIrrigationEquipment(Boolean hasIrrigationEquipment) { this.hasIrrigationEquipment = hasIrrigationEquipment; }

    public Boolean getHasPumpSet() { return hasPumpSet; }
    public void setHasPumpSet(Boolean hasPumpSet) { this.hasPumpSet = hasPumpSet; }

    public Boolean getHasStorageFacility() { return hasStorageFacility; }
    public void setHasStorageFacility(Boolean hasStorageFacility) { this.hasStorageFacility = hasStorageFacility; }

    public Boolean getHasGreenhouse() { return hasGreenhouse; }
    public void setHasGreenhouse(Boolean hasGreenhouse) { this.hasGreenhouse = hasGreenhouse; }

    public String getFarmingType() { return farmingType; }
    public void setFarmingType(String farmingType) { this.farmingType = farmingType; }

    public Integer getYearsFarming() { return yearsFarming; }
    public void setYearsFarming(Integer yearsFarming) { this.yearsFarming = yearsFarming; }

    public String getOrganizationMembership() { return organizationMembership; }
    public void setOrganizationMembership(String organizationMembership) { this.organizationMembership = organizationMembership; }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Double getNitrogen() {
        return nitrogen;
    }

    public void setNitrogen(Double nitrogen) {
        this.nitrogen = nitrogen;
    }

    public Double getPhosphorus() {
        return phosphorus;
    }

    public void setPhosphorus(Double phosphorus) {
        this.phosphorus = phosphorus;
    }

    public Double getPotassium() {
        return potassium;
    }

    public void setPotassium(Double potassium) {
        this.potassium = potassium;
    }

    public Double getSoilPh() {
        return soilPh;
    }

    public void setSoilPh(Double soilPh) {
        this.soilPh = soilPh;
    }

    public Double getSoilMoisture() {
        return soilMoisture;
    }

    public void setSoilMoisture(Double soilMoisture) {
        this.soilMoisture = soilMoisture;
    }

    public Double getOrganicCarbon() {
        return organicCarbon;
    }

    public void setOrganicCarbon(Double organicCarbon) {
        this.organicCarbon = organicCarbon;
    }

    public Double getElectricalConductivity() {
        return electricalConductivity;
    }

    public void setElectricalConductivity(Double electricalConductivity) {
        this.electricalConductivity = electricalConductivity;
    }
}
