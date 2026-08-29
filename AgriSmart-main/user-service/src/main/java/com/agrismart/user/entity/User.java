package com.agrismart.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String state;

    // 1. Personal
    @Column(length = 20)
    private String dob;

    @Column(length = 20)
    private String gender;

    // 2. Location
    @Column(length = 100)
    private String taluk;

    @Column(length = 100)
    private String village;

    @Column(length = 20)
    private String pincode;

    // 3. Land / Farmer Information
    @Column(name = "land_ownership_type", length = 50)
    private String landOwnershipType;

    @Column(name = "total_landholding")
    private Double totalLandholding;

    @Column(name = "farmer_category", length = 100)
    private String farmerCategory;

    @Column(name = "ownership_document_available")
    private Boolean ownershipDocumentAvailable;

    // 4. Financial
    @Column(name = "annual_income_range", length = 50)
    private String annualIncomeRange;

    @Column(name = "income_certificate_available")
    private Boolean incomeCertificateAvailable;

    // 5. Farm Assets
    @Column(name = "has_tractor")
    private Boolean hasTractor = false;

    @Column(name = "has_machinery")
    private Boolean hasMachinery = false;

    @Column(name = "has_irrigation_equipment")
    private Boolean hasIrrigationEquipment = false;

    @Column(name = "has_pump_set")
    private Boolean hasPumpSet = false;

    @Column(name = "has_storage_facility")
    private Boolean hasStorageFacility = false;

    @Column(name = "has_greenhouse")
    private Boolean hasGreenhouse = false;

    // 6. Farming Background
    @Column(name = "farming_type", length = 50)
    private String farmingType;

    @Column(name = "years_farming")
    private Integer yearsFarming;

    @Column(name = "organization_membership", length = 100)
    private String organizationMembership;

    // Soil Health Parameters for AI/ML Recommendation Models
    @Column(name = "nitrogen")
    private Double nitrogen = 60.0;

    @Column(name = "phosphorus")
    private Double phosphorus = 40.0;

    @Column(name = "potassium")
    private Double potassium = 50.0;

    @Column(name = "soil_ph")
    private Double soilPh = 6.5;

    @Column(name = "soil_moisture")
    private Double soilMoisture = 35.0;

    @Column(name = "organic_carbon")
    private Double organicCarbon = 1.0;

    @Column(name = "electrical_conductivity")
    private Double electricalConductivity = 1.0;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public User() {
    }

    public User(Long userId, String name, String phone, String email, String passwordHash, Role role, String district, String state, Double nitrogen, Double phosphorus, Double potassium, Double soilPh, Double soilMoisture, Double organicCarbon, Double electricalConductivity, Boolean isVerified, LocalDateTime createdAt) {
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.district = district;
        this.state = state;
        this.nitrogen = nitrogen != null ? nitrogen : 60.0;
        this.phosphorus = phosphorus != null ? phosphorus : 40.0;
        this.potassium = potassium != null ? potassium : 50.0;
        this.soilPh = soilPh != null ? soilPh : 6.5;
        this.soilMoisture = soilMoisture != null ? soilMoisture : 35.0;
        this.organicCarbon = organicCarbon != null ? organicCarbon : 1.0;
        this.electricalConductivity = electricalConductivity != null ? electricalConductivity : 1.0;
        this.isVerified = isVerified != null ? isVerified : true;
        this.createdAt = createdAt;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long userId;
        private String name;
        private String phone;
        private String email;
        private String passwordHash;
        private Role role;
        private String district;
        private String state;
        private Double nitrogen = 60.0;
        private Double phosphorus = 40.0;
        private Double potassium = 50.0;
        private Double soilPh = 6.5;
        private Double soilMoisture = 35.0;
        private Double organicCarbon = 1.0;
        private Double electricalConductivity = 1.0;
        private Boolean isVerified = true;
        private LocalDateTime createdAt;

        public UserBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public UserBuilder name(String name) {
            this.name = name;
            return this;
        }

        public UserBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserBuilder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public UserBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public UserBuilder district(String district) {
            this.district = district;
            return this;
        }

        public UserBuilder state(String state) {
            this.state = state;
            return this;
        }

        public UserBuilder nitrogen(Double nitrogen) {
            this.nitrogen = nitrogen;
            return this;
        }

        public UserBuilder phosphorus(Double phosphorus) {
            this.phosphorus = phosphorus;
            return this;
        }

        public UserBuilder potassium(Double potassium) {
            this.potassium = potassium;
            return this;
        }

        public UserBuilder soilPh(Double soilPh) {
            this.soilPh = soilPh;
            return this;
        }

        public UserBuilder soilMoisture(Double soilMoisture) {
            this.soilMoisture = soilMoisture;
            return this;
        }

        public UserBuilder organicCarbon(Double organicCarbon) {
            this.organicCarbon = organicCarbon;
            return this;
        }

        public UserBuilder electricalConductivity(Double electricalConductivity) {
            this.electricalConductivity = electricalConductivity;
            return this;
        }

        public UserBuilder isVerified(Boolean isVerified) {
            this.isVerified = isVerified;
            return this;
        }

        public UserBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public User build() {
            return new User(userId, name, phone, email, passwordHash, role, district, state, nitrogen, phosphorus, potassium, soilPh, soilMoisture, organicCarbon, electricalConductivity, isVerified, createdAt);
        }
    }
}
