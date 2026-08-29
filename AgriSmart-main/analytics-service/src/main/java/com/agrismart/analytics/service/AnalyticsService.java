package com.agrismart.analytics.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final JdbcTemplate jdbcTemplate;
    public AnalyticsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    public Map<String, Object> getFarmerAnalytics(Long userId) {
        Map<String, Object> data = new HashMap<>();

        // 1. Total Farms
        Integer totalFarms = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM farms WHERE user_id = ?", Integer.class, userId);
        data.put("totalFarms", totalFarms);

        // 2. Total Crops
        Integer totalCrops = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM crops c JOIN farms f ON c.farm_id = f.farm_id WHERE f.user_id = ?",
                Integer.class, userId);
        data.put("totalCrops", totalCrops);

        // 3. Active Crops (ACTIVE)
        Integer activeCrops = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM crops c JOIN farms f ON c.farm_id = f.farm_id WHERE f.user_id = ? AND c.status = 'ACTIVE'",
                Integer.class, userId);
        data.put("activeCrops", activeCrops);

        // 4. Yield History (for Recharts bar charts)
        List<Map<String, Object>> yieldHistory = jdbcTemplate.queryForList(
                "SELECT c.crop_name as cropName, c.yield as yieldValue, DATE_FORMAT(c.planted_date, '%b %Y') as plantedMonth " +
                        "FROM crops c JOIN farms f ON c.farm_id = f.farm_id " +
                        "WHERE f.user_id = ? AND c.status = 'HARVESTED' AND c.yield IS NOT NULL " +
                        "ORDER BY c.planted_date ASC LIMIT 10", userId);
        data.put("yieldHistory", yieldHistory);

        // 5. Recommendation History (list of advisor history)
        List<Map<String, Object>> recommendations = jdbcTemplate.queryForList(
                "SELECT recommendation_id as id, recommendation_type as type, content, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as date " +
                        "FROM recommendations WHERE user_id = ? " +
                        "ORDER BY created_at DESC LIMIT 5", userId);
        data.put("recommendationHistory", recommendations);

        return data;
    }

    public Map<String, Object> getOfficerAnalytics(Long officerUserId) {
        Map<String, Object> data = new HashMap<>();

        String officerDistrict = null;
        String officerState = null;
        if (officerUserId != null) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT district, state FROM users WHERE user_id = ? AND role = 'OFFICER'",
                    officerUserId
                );
                if (!rows.isEmpty()) {
                    officerDistrict = (String) rows.get(0).get("district");
                    officerState = (String) rows.get(0).get("state");
                }
            } catch (Exception e) {
                // fallback to un-scoped
            }
        }

        boolean hasRegion = officerDistrict != null && !officerDistrict.trim().isEmpty();

        // 1. Total Farmers
        Integer totalFarmers;
        if (hasRegion) {
            totalFarmers = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE role = 'FARMER' AND (LOWER(district) = LOWER(?) OR LOWER(state) = LOWER(?))",
                    Integer.class, officerDistrict, officerDistrict);
        } else {
            totalFarmers = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE role = 'FARMER'", Integer.class);
        }
        data.put("totalFarmers", totalFarmers);

        // 2. Crop Distribution (Pie chart data: crop name and count)
        List<Map<String, Object>> cropDistribution;
        if (hasRegion) {
            cropDistribution = jdbcTemplate.queryForList(
                    "SELECT c.crop_name as name, COUNT(*) as value FROM crops c JOIN farms f ON c.farm_id = f.farm_id JOIN users u ON f.user_id = u.user_id WHERE u.role = 'FARMER' AND (LOWER(u.district) = LOWER(?) OR LOWER(u.state) = LOWER(?)) GROUP BY c.crop_name", officerDistrict, officerDistrict);
        } else {
            cropDistribution = jdbcTemplate.queryForList(
                    "SELECT crop_name as name, COUNT(*) as value FROM crops GROUP BY crop_name");
        }
        data.put("cropDistribution", cropDistribution);

        // 3. Risk / Status Statistics
        List<Map<String, Object>> riskStats;
        if (hasRegion) {
            riskStats = jdbcTemplate.queryForList(
                    "SELECT c.status as name, COUNT(*) as value FROM crops c JOIN farms f ON c.farm_id = f.farm_id JOIN users u ON f.user_id = u.user_id WHERE u.role = 'FARMER' AND (LOWER(u.district) = LOWER(?) OR LOWER(u.state) = LOWER(?)) GROUP BY c.status", officerDistrict, officerDistrict);
        } else {
            riskStats = jdbcTemplate.queryForList(
                    "SELECT status as name, COUNT(*) as value FROM crops GROUP BY status");
        }
        data.put("riskStats", riskStats);

        // 4. Total Farms
        Integer totalFarms;
        if (hasRegion) {
            totalFarms = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM farms f JOIN users u ON f.user_id = u.user_id WHERE u.role = 'FARMER' AND (LOWER(u.district) = LOWER(?) OR LOWER(u.state) = LOWER(?))", Integer.class, officerDistrict, officerDistrict);
        } else {
            totalFarms = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM farms", Integer.class);
        }
        data.put("totalFarms", totalFarms);

        // 5. Total Crops
        Integer totalCrops;
        if (hasRegion) {
            totalCrops = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM crops c JOIN farms f ON c.farm_id = f.farm_id JOIN users u ON f.user_id = u.user_id WHERE u.role = 'FARMER' AND (LOWER(u.district) = LOWER(?) OR LOWER(u.state) = LOWER(?))", Integer.class, officerDistrict, officerDistrict);
        } else {
            totalCrops = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM crops", Integer.class);
        }
        data.put("totalCrops", totalCrops);

        // 6. Active Crops
        Integer activeCrops;
        if (hasRegion) {
            activeCrops = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM crops c JOIN farms f ON c.farm_id = f.farm_id JOIN users u ON f.user_id = u.user_id WHERE u.role = 'FARMER' AND c.status='ACTIVE' AND (LOWER(u.district) = LOWER(?) OR LOWER(u.state) = LOWER(?))", Integer.class, officerDistrict, officerDistrict);
        } else {
            activeCrops = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM crops WHERE status='ACTIVE'", Integer.class);
        }
        data.put("activeCrops", activeCrops);

        // 7. Total Cultivated Area
        Double totalCultivatedArea;
        if (hasRegion) {
            totalCultivatedArea = jdbcTemplate.queryForObject("SELECT COALESCE(SUM(f.area), 0) FROM farms f JOIN users u ON f.user_id = u.user_id WHERE u.role = 'FARMER' AND (LOWER(u.district) = LOWER(?) OR LOWER(u.state) = LOWER(?))", Double.class, officerDistrict, officerDistrict);
        } else {
            totalCultivatedArea = jdbcTemplate.queryForObject("SELECT COALESCE(SUM(area), 0) FROM farms", Double.class);
        }
        data.put("totalCultivatedArea", totalCultivatedArea);

        // 8. Soil Distribution
        List<Map<String, Object>> soilDistribution = jdbcTemplate.queryForList(
                "SELECT soil_type as name, COUNT(*) as value FROM farms WHERE soil_type IS NOT NULL GROUP BY soil_type");
        data.put("soilDistribution", soilDistribution);

        // 9. Irrigation Distribution
        List<Map<String, Object>> irrigationDistribution = jdbcTemplate.queryForList(
                "SELECT water_source as name, COUNT(*) as value FROM farms WHERE water_source IS NOT NULL GROUP BY water_source");
        data.put("irrigationDistribution", irrigationDistribution);

        // 10. Crop Yield Data
        List<Map<String, Object>> cropYieldData = jdbcTemplate.queryForList(
                "SELECT crop_name as crop, COUNT(*) as count FROM crops GROUP BY crop_name");
        data.put("cropYieldData", cropYieldData);

        // 11. Monthly Registrations
        List<Map<String, Object>> monthlyRegistrations = jdbcTemplate.queryForList(
                "SELECT DATE_FORMAT(created_at, '%b') as month, COUNT(*) as farmers FROM users WHERE role='FARMER' GROUP BY DATE_FORMAT(created_at, '%Y-%m'), month ORDER BY MIN(created_at)");
        data.put("monthlyRegistrations", monthlyRegistrations);

        // 12. District Overview
        List<Map<String, Object>> districtOverview = jdbcTemplate.queryForList(
                "SELECT district, COUNT(*) as count FROM users WHERE role='FARMER' AND district IS NOT NULL GROUP BY district");
        data.put("districtOverview", districtOverview);

        // 13. Document Verification Statistics (reads farmer_documents from user-service DB — same shared DB)
        try {
            Integer pendingDocs = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM farmer_documents WHERE verification_status = 'PENDING'", Integer.class);
            data.put("pendingDocuments", pendingDocs != null ? pendingDocs : 0);

            Integer verifiedDocs = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM farmer_documents WHERE verification_status = 'VERIFIED'", Integer.class);
            data.put("verifiedDocuments", verifiedDocs != null ? verifiedDocs : 0);

            Integer rejectedDocs = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM farmer_documents WHERE verification_status = 'REJECTED'", Integer.class);
            data.put("rejectedDocuments", rejectedDocs != null ? rejectedDocs : 0);
        } catch (Exception e) {
            // Table not yet created — default to 0
            data.put("pendingDocuments", 0);
            data.put("verifiedDocuments", 0);
            data.put("rejectedDocuments", 0);
        }

        return data;
    }

    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> data = new HashMap<>();

        // 1. Total Users
        Integer totalUsers = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users", Integer.class);
        data.put("totalUsers", totalUsers);

        // 2. Users by Role (Role breakdown)
        List<Map<String, Object>> roleBreakdown = jdbcTemplate.queryForList(
                "SELECT role as name, COUNT(*) as value FROM users GROUP BY role");
        data.put("roleBreakdown", roleBreakdown);

        // 3. Platform Stats
        Map<String, Object> platformStats = new HashMap<>();
        
        Integer totalFarms = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM farms", Integer.class);
        Integer totalCrops = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM crops", Integer.class);
        Integer totalWeatherLogs = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM weather_history", Integer.class);
        Integer totalRecommendations = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM recommendations", Integer.class);

        platformStats.put("totalFarms", totalFarms);
        platformStats.put("totalCrops", totalCrops);
        platformStats.put("weatherLogs", totalWeatherLogs);
        platformStats.put("recommendations", totalRecommendations);

        data.put("platformStats", platformStats);

        return data;
    }
}
