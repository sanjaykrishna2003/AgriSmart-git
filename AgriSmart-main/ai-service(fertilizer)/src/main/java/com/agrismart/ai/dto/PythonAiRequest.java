package com.agrismart.ai.dto;

public class PythonAiRequest {

    private String soil_type;
    private Double soil_ph;
    private Double soil_moisture;

    private Double organic_carbon;
    private Double electrical_conductivity;

    private Double nitrogen_level;
    private Double phosphorus_level;
    private Double potassium_level;

    private Double temperature;
    private Double humidity;
    private Double rainfall;

    private Double sunlight_hours;
    private Double wind_speed_kmh;

    private String crop_type;
    private String growth_stage;

    private String season;
    private String irrigation_type;

    private String water_source;

    private Double field_area_hectare;

    private String mulching_used;

    private Double previous_irrigation_mm;

    private String previous_crop;

    private String region;

    public String getSoil_type() {
        return soil_type;
    }

    public void setSoil_type(String soil_type) {
        this.soil_type = soil_type;
    }

    public Double getSoil_ph() {
        return soil_ph;
    }

    public void setSoil_ph(Double soil_ph) {
        this.soil_ph = soil_ph;
    }

    public Double getSoil_moisture() {
        return soil_moisture;
    }

    public void setSoil_moisture(Double soil_moisture) {
        this.soil_moisture = soil_moisture;
    }

    public Double getOrganic_carbon() {
        return organic_carbon;
    }

    public void setOrganic_carbon(Double organic_carbon) {
        this.organic_carbon = organic_carbon;
    }

    public Double getElectrical_conductivity() {
        return electrical_conductivity;
    }

    public void setElectrical_conductivity(Double electrical_conductivity) {
        this.electrical_conductivity = electrical_conductivity;
    }

    public Double getNitrogen_level() {
        return nitrogen_level;
    }

    public void setNitrogen_level(Double nitrogen_level) {
        this.nitrogen_level = nitrogen_level;
    }

    public Double getPhosphorus_level() {
        return phosphorus_level;
    }

    public void setPhosphorus_level(Double phosphorus_level) {
        this.phosphorus_level = phosphorus_level;
    }

    public Double getPotassium_level() {
        return potassium_level;
    }

    public void setPotassium_level(Double potassium_level) {
        this.potassium_level = potassium_level;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public Double getRainfall() {
        return rainfall;
    }

    public void setRainfall(Double rainfall) {
        this.rainfall = rainfall;
    }

    public Double getSunlight_hours() {
        return sunlight_hours;
    }

    public void setSunlight_hours(Double sunlight_hours) {
        this.sunlight_hours = sunlight_hours;
    }

    public Double getWind_speed_kmh() {
        return wind_speed_kmh;
    }

    public void setWind_speed_kmh(Double wind_speed_kmh) {
        this.wind_speed_kmh = wind_speed_kmh;
    }

    public String getCrop_type() {
        return crop_type;
    }

    public void setCrop_type(String crop_type) {
        this.crop_type = crop_type;
    }

    public String getGrowth_stage() {
        return growth_stage;
    }

    public void setGrowth_stage(String growth_stage) {
        this.growth_stage = growth_stage;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public String getIrrigation_type() {
        return irrigation_type;
    }

    public void setIrrigation_type(String irrigation_type) {
        this.irrigation_type = irrigation_type;
    }

    public String getWater_source() {
        return water_source;
    }

    public void setWater_source(String water_source) {
        this.water_source = water_source;
    }

    public Double getField_area_hectare() {
        return field_area_hectare;
    }

    public void setField_area_hectare(Double field_area_hectare) {
        this.field_area_hectare = field_area_hectare;
    }

    public String getMulching_used() {
        return mulching_used;
    }

    public void setMulching_used(String mulching_used) {
        this.mulching_used = mulching_used;
    }

    public Double getPrevious_irrigation_mm() {
        return previous_irrigation_mm;
    }

    public void setPrevious_irrigation_mm(Double previous_irrigation_mm) {
        this.previous_irrigation_mm = previous_irrigation_mm;
    }

    public String getPrevious_crop() {
        return previous_crop;
    }

    public void setPrevious_crop(String previous_crop) {
        this.previous_crop = previous_crop;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }
}