package com.agrismart.analytics.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SchemeService {

    private final JdbcTemplate jdbcTemplate;

    public SchemeService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @org.springframework.context.event.EventListener(org.springframework.context.event.ContextRefreshedEvent.class)
    public void seedSchemesIfNecessary() {
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS schemes (" +
                "    scheme_id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                "    scheme_name VARCHAR(255) NOT NULL," +
                "    category VARCHAR(100) NOT NULL," +
                "    description TEXT," +
                "    benefits VARCHAR(255)," +
                "    eligibility_criteria TEXT," +
                "    required_documents TEXT," +
                "    official_link VARCHAR(255)," +
                "    state VARCHAR(100)," +
                "    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                ")");

            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS scheme_applications (" +
                "application_id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                "user_id BIGINT NOT NULL," +
                "scheme_id BIGINT NOT NULL," +
                "status VARCHAR(20) DEFAULT 'APPLIED'," +
                "applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")");

            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM schemes", Integer.class);
            if (count == null || count < 5) {
                jdbcTemplate.execute("TRUNCATE TABLE schemes");
                
                String insertQuery = "INSERT INTO schemes (scheme_id, scheme_name, category, description, benefits, eligibility_criteria, required_documents, official_link, state) VALUES " +
                    "(1, 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)', 'Financial Assistance', 'Income support scheme providing financial benefit to all landholding farmer families across India to buy agriculture inputs.', '₹6,000 per year in 3 equal installments', 'All landholding farmer families with cultivable land in their name.', 'Aadhaar Card, Land Records, Bank Account Details', 'https://pmkisan.gov.in', 'All States')," +
                    "(2, 'Kisan Credit Card (KCC)', 'Loans', 'Provides farmers with timely access to short-term credit loans for cultivation, crop production, and post-harvest maintenance expenses.', 'Short-term credit up to ₹3 Lakhs at low interest rate (4%)', 'All farmers, tenant farmers, and sharecroppers.', 'Aadhaar Card, Land Possession Certificate, Bank Account Details', 'https://pmkisan.gov.in/Documents/KCC.pdf', 'All States')," +
                    "(3, 'PMFBY (Pradhan Mantri Fasal Bima Yojana)', 'Insurance', 'Crop insurance scheme offering financial security to farmers against crop failure or damages caused by natural disasters, pests, or disease.', 'Comprehensive crop insurance coverage with low premium (1.5% to 5%)', 'All farmers growing notified crops in notified areas.', 'Aadhaar Card, Sowing Certificate, Land Records, Bank Passbook', 'https://pmfby.gov.in', 'All States')," +
                    "(4, 'Tamil Nadu Free Agricultural Power Scheme', 'Subsidies', 'State government initiative providing free agricultural electricity to farmers to operate pump sets for crop irrigation.', '100% free electricity supply for agricultural irrigation pumps', 'Tamil Nadu resident landholding farmers owning agricultural pump sets.', 'Aadhaar Card, Land Ownership Documents (Patta/Chitta), Pump Set details', 'https://www.tangedco.org', 'Tamil Nadu')," +
                    "(5, 'PM Kisan Maan-Dhan Yojana (PM-KMY)', 'Financial Assistance', 'A voluntary and contributory pension scheme for old age protection and social security of Small and Marginal Farmers (SMFs) owning cultivable land.', 'Minimum assured pension of ₹3,000 per month after reaching 60 years of age', 'Small and marginal farmers aged between 18 to 40 years with cultivable land up to 2 hectares.', 'Aadhaar Card, Savings Bank Account, Aadhaar-linked Mobile Number', 'https://pmkmy.gov.in', 'All States')," +
                    "(6, 'PMKSY - Per Drop More Crop (PDMC)', 'Subsidies', 'Focuses on water use efficiency at farm level through micro-irrigation technologies like drip and sprinkler irrigation systems.', 'Up to 55% subsidy for small and marginal farmers, and 45% for other farmers for micro-irrigation installation', 'All landholding farmers with access to water sources.', 'Aadhaar Card, Land Records, Electricity Bill, Drip design installation plan', 'https://pmksy.gov.in', 'All States')," +
                    "(7, 'Paramparagat Krishi Vikas Yojana (PKVY)', 'Subsidies', 'Promotes organic farming through a cluster approach and PGS certification. Supports organic farming practices and marketing.', 'Financial assistance of ₹50,000 per hectare over 3 years, with 62% provided as subsidy for organic inputs', 'Farmers formed in clusters of 20 hectares (minimum 50 farmers).', 'Aadhaar Card, Land Records, PGS Cluster Registration', 'https://pgsindia-ncof.gov.in', 'All States')," +
                    "(8, 'Soil Health Card Scheme', 'Financial Assistance', 'Assists state governments to issue soil health cards to all farmers. Provides nutrient status of soil and recommendation of fertilizers.', 'Free soil testing and customized fertilizer recommendation card every 2 years', 'All farmers owning cultivable lands in India.', 'Aadhaar Card, Soil Sample Collection Slip, Land Records', 'https://soilhealth.dac.gov.in', 'All States')," +
                    "(9, 'National Agriculture Market (e-NAM)', 'Financial Assistance', 'Pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.', 'Direct online selling of produce to buyers across India without middlemen, getting competitive prices', 'All individual farmers, FPOs, and traders.', 'Aadhaar Card, Bank Account Details, Mobile Number', 'https://enam.gov.in', 'All States')," +
                    "(10, 'SMAM (Sub-Mission on Agricultural Mechanization)', 'Subsidies', 'Promotes agricultural mechanization by providing subsidies for buying modern agricultural machinery like tractors, rotavators, power tillers.', '40% to 50% subsidy on purchase of verified agricultural machinery', 'All landholding farmers, special preference to women and SC/ST farmers.', 'Aadhaar Card, Land Records (Patta), Bank Account Details, Machinery quotation', 'https://agrimachinery.nic.in', 'All States')," +
                    "(11, 'Punjab Free Power Scheme for Agriculture', 'Subsidies', 'State government initiative providing free electricity supply to agricultural tube wells to support irrigation for farmers in Punjab.', '100% free electricity supply for agricultural tubewells', 'Punjab resident landholding farmers owning agricultural electric pump tube wells.', 'Aadhaar Card, Electricity Connection Details, Land Ownership Certificate', 'https://www.pspcl.in', 'Punjab')," +
                    "(12, 'Haryana Bhavantar Bharpayee Yojana (BBY)', 'Financial Assistance', 'State scheme compensating farmers for price deficit of horticultural crops (vegetables & fruits) when market prices fall below floor prices.', 'Price compensation difference deposited directly to bank accounts', 'Haryana resident farmers registered on Meri Fasal Mera Byora (MFMB) portal cultivating notified crops.', 'Aadhaar Card, Meri Fasal Mera Byora Registration Slip, Bank Account', 'https://ekharid.haryana.gov.in', 'Haryana')";
                jdbcTemplate.execute(insertQuery);
            }
        } catch (Exception e) {
            System.err.println("Failed to seed schemes: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> getAllSchemes() {
        return jdbcTemplate.queryForList("SELECT * FROM schemes ORDER BY last_updated DESC");
    }

    public List<Map<String, Object>> getRecommendedSchemes(Long userId) {
        Map<String, Object> user;
        try {
            user = jdbcTemplate.queryForMap(
                "SELECT state, district, role FROM users WHERE user_id = ?", userId);
        } catch (Exception e) {
            return new ArrayList<>();
        }

        String userState = user.get("state") != null ? ((String) user.get("state")).trim() : "";
        
        Double totalArea = 0.0;
        List<Double> areas = jdbcTemplate.queryForList(
                "SELECT area FROM farms WHERE user_id = ?", Double.class, userId);
        for (Double area : areas) {
            if (area != null) totalArea += area;
        }

        List<String> activeCrops = jdbcTemplate.queryForList(
                "SELECT DISTINCT c.crop_name FROM crops c JOIN farms f ON c.farm_id = f.farm_id " +
                "WHERE f.user_id = ? AND c.status = 'ACTIVE'", String.class, userId);

        List<Map<String, Object>> allSchemes = jdbcTemplate.queryForList("SELECT * FROM schemes");
        List<Map<String, Object>> recommended = new ArrayList<>();

        for (Map<String, Object> scheme : allSchemes) {
            String schemeState = scheme.get("state") != null ? (String) scheme.get("state") : "All States";
            String criteria = scheme.get("eligibility_criteria") != null ? (String) scheme.get("eligibility_criteria") : "";

            boolean isStateEligible = "All States".equalsIgnoreCase(schemeState) || 
                                      userState.equalsIgnoreCase(schemeState);

            if (!isStateEligible) {
                continue;
            }

            int matchPercent = 70;

            if (!"All States".equalsIgnoreCase(schemeState) && userState.equalsIgnoreCase(schemeState)) {
                matchPercent += 15;
            }

            boolean cropMatches = false;
            for (String crop : activeCrops) {
                if (criteria.toLowerCase().contains(crop.toLowerCase())) {
                    cropMatches = true;
                    break;
                }
            }
            if (cropMatches) {
                matchPercent += 10;
            }

            if (criteria.toLowerCase().contains("landholding") || criteria.toLowerCase().contains("acres")) {
                if (totalArea > 0 && totalArea <= 5.0) {
                    matchPercent += 5;
                } else if (totalArea > 5.0) {
                    matchPercent -= 10;
                }
            }

            matchPercent = Math.min(100, Math.max(0, matchPercent));

            Map<String, Object> item = new HashMap<>(scheme);
            item.put("eligibilityMatch", matchPercent);
            recommended.add(item);
        }

        recommended.sort((a, b) -> ((Integer) b.get("eligibilityMatch")).compareTo((Integer) a.get("eligibilityMatch")));
        return recommended;
    }

    public Map<String, Object> applyToScheme(Long userId, Long schemeId) {
        List<Map<String, Object>> existing = jdbcTemplate.queryForList(
            "SELECT * FROM scheme_applications WHERE user_id = ? AND scheme_id = ?", userId, schemeId);
        if (!existing.isEmpty()) {
            throw new RuntimeException("Already applied to this scheme");
        }

        jdbcTemplate.update(
            "INSERT INTO scheme_applications (user_id, scheme_id) VALUES (?, ?)",
            userId, schemeId
        );
        
        return jdbcTemplate.queryForMap(
            "SELECT * FROM scheme_applications WHERE user_id = ? AND scheme_id = ? ORDER BY applied_at DESC LIMIT 1",
            userId, schemeId
        );
    }

    public void withdrawApplication(Long userId, Long schemeId) {
        jdbcTemplate.update(
            "DELETE FROM scheme_applications WHERE user_id = ? AND scheme_id = ?",
            userId, schemeId
        );
    }

    public List<Map<String, Object>> getUserApplications(Long userId) {
        return jdbcTemplate.queryForList(
            "SELECT a.*, s.scheme_name, s.category, s.benefits, s.official_link " +
            "FROM scheme_applications a " +
            "JOIN schemes s ON a.scheme_id = s.scheme_id " +
            "WHERE a.user_id = ? ORDER BY a.applied_at DESC", 
            userId
        );
    }

    public List<Map<String, Object>> getAllApplications() {
        return jdbcTemplate.queryForList(
            "SELECT a.*, s.scheme_name, s.category, u.name as user_name, u.email as user_email " +
            "FROM scheme_applications a " +
            "JOIN schemes s ON a.scheme_id = s.scheme_id " +
            "JOIN users u ON a.user_id = u.user_id " +
            "ORDER BY a.applied_at DESC"
        );
    }

    public Map<String, Object> getSchemeStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Integer totalSchemes = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM schemes", Integer.class);
        Integer totalApplications = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM scheme_applications", Integer.class);
        
        List<Map<String, Object>> byStatus = jdbcTemplate.queryForList(
            "SELECT status, COUNT(*) as count FROM scheme_applications GROUP BY status"
        );
        
        stats.put("totalSchemes", totalSchemes);
        stats.put("totalApplications", totalApplications);
        stats.put("applicationsByStatus", byStatus);
        
        return stats;
    }

    public void updateApplicationStatus(Long applicationId, String status) {
        jdbcTemplate.update(
            "UPDATE scheme_applications SET status = ? WHERE application_id = ?",
            status, applicationId
        );
    }

    private void logAudit(String action, Long actorId, String actorName, String targetType, String targetId, String details) {
        try {
            jdbcTemplate.update(
                "INSERT INTO audit_logs (action, actor_id, actor_name, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)",
                action, actorId != null ? actorId : 1L, actorName != null ? actorName : "Admin", targetType, targetId, details
            );
        } catch (Exception e) {
            System.err.println("Failed to insert audit log: " + e.getMessage());
        }
    }

    public Map<String, Object> createScheme(Map<String, Object> payload, Long adminUserId, String adminName) {
        String name = (String) payload.get("scheme_name");
        if (name == null || name.isBlank()) name = (String) payload.get("schemeName");
        String category = (String) payload.getOrDefault("category", "General");
        String description = (String) payload.getOrDefault("description", "");
        String benefits = (String) payload.getOrDefault("benefits", "");
        String criteria = (String) payload.get("eligibility_criteria");
        if (criteria == null) criteria = (String) payload.getOrDefault("eligibilityCriteria", "");
        String documents = (String) payload.get("required_documents");
        if (documents == null) documents = (String) payload.getOrDefault("requiredDocuments", "");
        String link = (String) payload.get("official_link");
        if (link == null) link = (String) payload.getOrDefault("officialLink", "");
        String state = (String) payload.getOrDefault("state", "All States");

        jdbcTemplate.update(
            "INSERT INTO schemes (scheme_name, category, description, benefits, eligibility_criteria, required_documents, official_link, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            name, category, description, benefits, criteria, documents, link, state
        );

        Map<String, Object> created = jdbcTemplate.queryForMap(
            "SELECT * FROM schemes ORDER BY scheme_id DESC LIMIT 1"
        );
        
        Long newId = ((Number) created.get("scheme_id")).longValue();
        logAudit("SCHEME_CREATED", adminUserId, adminName, "SCHEME", String.valueOf(newId), "Created scheme '" + name + "' in category '" + category + "'");

        return created;
    }

    public Map<String, Object> updateScheme(Long schemeId, Map<String, Object> payload, Long adminUserId, String adminName) {
        String name = (String) payload.get("scheme_name");
        if (name == null || name.isBlank()) name = (String) payload.get("schemeName");
        String category = (String) payload.getOrDefault("category", "General");
        String description = (String) payload.getOrDefault("description", "");
        String benefits = (String) payload.getOrDefault("benefits", "");
        String criteria = (String) payload.get("eligibility_criteria");
        if (criteria == null) criteria = (String) payload.getOrDefault("eligibilityCriteria", "");
        String documents = (String) payload.get("required_documents");
        if (documents == null) documents = (String) payload.getOrDefault("requiredDocuments", "");
        String link = (String) payload.get("official_link");
        if (link == null) link = (String) payload.getOrDefault("officialLink", "");
        String state = (String) payload.getOrDefault("state", "All States");

        jdbcTemplate.update(
            "UPDATE schemes SET scheme_name = ?, category = ?, description = ?, benefits = ?, eligibility_criteria = ?, required_documents = ?, official_link = ?, state = ? WHERE scheme_id = ?",
            name, category, description, benefits, criteria, documents, link, state, schemeId
        );

        Map<String, Object> updated = jdbcTemplate.queryForMap(
            "SELECT * FROM schemes WHERE scheme_id = ?", schemeId
        );

        logAudit("SCHEME_UPDATED", adminUserId, adminName, "SCHEME", String.valueOf(schemeId), "Updated scheme '" + name + "'");

        return updated;
    }

    public void deleteScheme(Long schemeId, Long adminUserId, String adminName) {
        Integer appCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM scheme_applications WHERE scheme_id = ?", Integer.class, schemeId
        );
        String action;
        String details;
        if (appCount != null && appCount > 0) {
            jdbcTemplate.update("UPDATE schemes SET scheme_name = CONCAT(scheme_name, ' [ARCHIVED]') WHERE scheme_id = ? AND scheme_name NOT LIKE '%[ARCHIVED]%'", schemeId);
            action = "SCHEME_ARCHIVED";
            details = "Archived scheme ID " + schemeId + " (preserved " + appCount + " historical applications)";
        } else {
            jdbcTemplate.update("DELETE FROM schemes WHERE scheme_id = ?", schemeId);
            action = "SCHEME_DELETED";
            details = "Deleted scheme ID " + schemeId;
        }

        logAudit(action, adminUserId, adminName, "SCHEME", String.valueOf(schemeId), details);
    }
}
