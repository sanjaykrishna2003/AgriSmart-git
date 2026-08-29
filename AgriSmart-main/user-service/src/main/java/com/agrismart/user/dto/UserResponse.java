package com.agrismart.user.dto;

import com.agrismart.user.entity.Role;
import java.time.LocalDateTime;

public class UserResponse {
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private Role role;
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

    private Double nitrogen;
    private Double phosphorus;
    private Double potassium;
    private Double soilPh;
    private Double soilMoisture;
    private Double organicCarbon;
    private Double electricalConductivity;
    private Boolean isVerified;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }

    public static class UserResponseBuilder {
        private Long userId;
        private String name;
        private String email;
        private String phone;
        private Role role;
        private String district;
        private String state;
        private String dob;
        private String gender;
        private String taluk;
        private String village;
        private String pincode;
        private String landOwnershipType;
        private Double totalLandholding;
        private String farmerCategory;
        private Boolean ownershipDocumentAvailable;
        private String annualIncomeRange;
        private Boolean incomeCertificateAvailable;
        private Boolean hasTractor;
        private Boolean hasMachinery;
        private Boolean hasIrrigationEquipment;
        private Boolean hasPumpSet;
        private Boolean hasStorageFacility;
        private Boolean hasGreenhouse;
        private String farmingType;
        private Integer yearsFarming;
        private String organizationMembership;
        private Double nitrogen;
        private Double phosphorus;
        private Double potassium;
        private Double soilPh;
        private Double soilMoisture;
        private Double organicCarbon;
        private Double electricalConductivity;
        private Boolean isVerified;
        private LocalDateTime createdAt;

        public UserResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public UserResponseBuilder name(String name) { this.name = name; return this; }
        public UserResponseBuilder email(String email) { this.email = email; return this; }
        public UserResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public UserResponseBuilder role(Role role) { this.role = role; return this; }
        public UserResponseBuilder district(String district) { this.district = district; return this; }
        public UserResponseBuilder state(String state) { this.state = state; return this; }
        public UserResponseBuilder dob(String dob) { this.dob = dob; return this; }
        public UserResponseBuilder gender(String gender) { this.gender = gender; return this; }
        public UserResponseBuilder taluk(String taluk) { this.taluk = taluk; return this; }
        public UserResponseBuilder village(String village) { this.village = village; return this; }
        public UserResponseBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public UserResponseBuilder landOwnershipType(String landOwnershipType) { this.landOwnershipType = landOwnershipType; return this; }
        public UserResponseBuilder totalLandholding(Double totalLandholding) { this.totalLandholding = totalLandholding; return this; }
        public UserResponseBuilder farmerCategory(String farmerCategory) { this.farmerCategory = farmerCategory; return this; }
        public UserResponseBuilder ownershipDocumentAvailable(Boolean ownershipDocumentAvailable) { this.ownershipDocumentAvailable = ownershipDocumentAvailable; return this; }
        public UserResponseBuilder annualIncomeRange(String annualIncomeRange) { this.annualIncomeRange = annualIncomeRange; return this; }
        public UserResponseBuilder incomeCertificateAvailable(Boolean incomeCertificateAvailable) { this.incomeCertificateAvailable = incomeCertificateAvailable; return this; }
        public UserResponseBuilder hasTractor(Boolean hasTractor) { this.hasTractor = hasTractor; return this; }
        public UserResponseBuilder hasMachinery(Boolean hasMachinery) { this.hasMachinery = hasMachinery; return this; }
        public UserResponseBuilder hasIrrigationEquipment(Boolean hasIrrigationEquipment) { this.hasIrrigationEquipment = hasIrrigationEquipment; return this; }
        public UserResponseBuilder hasPumpSet(Boolean hasPumpSet) { this.hasPumpSet = hasPumpSet; return this; }
        public UserResponseBuilder hasStorageFacility(Boolean hasStorageFacility) { this.hasStorageFacility = hasStorageFacility; return this; }
        public UserResponseBuilder hasGreenhouse(Boolean hasGreenhouse) { this.hasGreenhouse = hasGreenhouse; return this; }
        public UserResponseBuilder farmingType(String farmingType) { this.farmingType = farmingType; return this; }
        public UserResponseBuilder yearsFarming(Integer yearsFarming) { this.yearsFarming = yearsFarming; return this; }
        public UserResponseBuilder organizationMembership(String organizationMembership) { this.organizationMembership = organizationMembership; return this; }
        public UserResponseBuilder nitrogen(Double nitrogen) { this.nitrogen = nitrogen; return this; }
        public UserResponseBuilder phosphorus(Double phosphorus) { this.phosphorus = phosphorus; return this; }
        public UserResponseBuilder potassium(Double potassium) { this.potassium = potassium; return this; }
        public UserResponseBuilder soilPh(Double soilPh) { this.soilPh = soilPh; return this; }
        public UserResponseBuilder soilMoisture(Double soilMoisture) { this.soilMoisture = soilMoisture; return this; }
        public UserResponseBuilder organicCarbon(Double organicCarbon) { this.organicCarbon = organicCarbon; return this; }
        public UserResponseBuilder electricalConductivity(Double electricalConductivity) { this.electricalConductivity = electricalConductivity; return this; }
        public UserResponseBuilder isVerified(Boolean isVerified) { this.isVerified = isVerified; return this; }
        public UserResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public UserResponse build() {
            UserResponse r = new UserResponse();
            r.setUserId(userId);
            r.setName(name);
            r.setEmail(email);
            r.setPhone(phone);
            r.setRole(role);
            r.setDistrict(district);
            r.setState(state);
            r.setDob(dob);
            r.setGender(gender);
            r.setTaluk(taluk);
            r.setVillage(village);
            r.setPincode(pincode);
            r.setLandOwnershipType(landOwnershipType);
            r.setTotalLandholding(totalLandholding);
            r.setFarmerCategory(farmerCategory);
            r.setOwnershipDocumentAvailable(ownershipDocumentAvailable);
            r.setAnnualIncomeRange(annualIncomeRange);
            r.setIncomeCertificateAvailable(incomeCertificateAvailable);
            r.setHasTractor(hasTractor);
            r.setHasMachinery(hasMachinery);
            r.setHasIrrigationEquipment(hasIrrigationEquipment);
            r.setHasPumpSet(hasPumpSet);
            r.setHasStorageFacility(hasStorageFacility);
            r.setHasGreenhouse(hasGreenhouse);
            r.setFarmingType(farmingType);
            r.setYearsFarming(yearsFarming);
            r.setOrganizationMembership(organizationMembership);
            r.setNitrogen(nitrogen);
            r.setPhosphorus(phosphorus);
            r.setPotassium(potassium);
            r.setSoilPh(soilPh);
            r.setSoilMoisture(soilMoisture);
            r.setOrganicCarbon(organicCarbon);
            r.setElectricalConductivity(electricalConductivity);
            r.setIsVerified(isVerified);
            r.setCreatedAt(createdAt);
            return r;
        }
    }
}
