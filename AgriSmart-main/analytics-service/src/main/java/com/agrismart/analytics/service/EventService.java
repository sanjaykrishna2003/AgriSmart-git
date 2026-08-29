package com.agrismart.analytics.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.context.event.EventListener;
import org.springframework.context.event.ContextRefreshedEvent;

import java.util.List;
import java.util.Map;

@Service
public class EventService {

    private final JdbcTemplate jdbcTemplate;

    public EventService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void createTables() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS events (" +
            "event_id BIGINT AUTO_INCREMENT PRIMARY KEY," +
            "title VARCHAR(255) NOT NULL," +
            "description TEXT," +
            "event_date VARCHAR(50) NOT NULL," +
            "location VARCHAR(255)," +
            "category VARCHAR(50) DEFAULT 'WORKSHOP'," +
            "created_by VARCHAR(100)," +
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
        ")");

        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS event_registrations (" +
            "registration_id BIGINT AUTO_INCREMENT PRIMARY KEY," +
            "event_id BIGINT NOT NULL," +
            "user_id BIGINT NOT NULL," +
            "farmer_name VARCHAR(255)," +
            "phone_number VARCHAR(50)," +
            "attendees_count INT DEFAULT 1," +
            "remarks TEXT," +
            "registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "UNIQUE KEY unique_user_event (event_id, user_id)" +
        ")");

        // Seed default sample events if empty
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM events", Integer.class);
        if (count == 0) {
            createEvent("Soil Testing & Nutrient Management Camp", "Free soil sample analysis and fertilizer consultation for local farmers.", "2026-09-15", "District Agri Office, Pollachi", "SOIL_TEST", "Admin");
            createEvent("PM-KISAN Scheme Enrollment Drive", "Guidance and spot registration for eligible farmers for Central Scheme benefits.", "2026-09-28", "Community Hall, Coimbatore North", "SCHEME_DRIVE", "Admin");
            createEvent("Modern Drip Irrigation Tech Workshop", "Live demonstration of automated micro-irrigation systems.", "2026-10-10", "Agri University Farm Ground", "WORKSHOP", "Admin");
        }
    }

    public Map<String, Object> createEvent(String title, String description, String eventDate, String location, String category, String createdBy) {
        jdbcTemplate.update(
            "INSERT INTO events (title, description, event_date, location, category, created_by) VALUES (?, ?, ?, ?, ?, ?)",
            title, description, eventDate, location, category, createdBy
        );
        return jdbcTemplate.queryForMap("SELECT * FROM events ORDER BY event_id DESC LIMIT 1");
    }

    public List<Map<String, Object>> getAllEvents() {
        return jdbcTemplate.queryForList("SELECT * FROM events ORDER BY event_id DESC");
    }

    public void deleteEvent(Long id) {
        jdbcTemplate.update("DELETE FROM event_registrations WHERE event_id = ?", id);
        jdbcTemplate.update("DELETE FROM events WHERE event_id = ?", id);
    }

    public Map<String, Object> registerForEvent(Long eventId, Long userId, String farmerName, String phoneNumber, Integer attendeesCount, String remarks) {
        jdbcTemplate.update(
            "INSERT INTO event_registrations (event_id, user_id, farmer_name, phone_number, attendees_count, remarks) " +
            "VALUES (?, ?, ?, ?, ?, ?) " +
            "ON DUPLICATE KEY UPDATE farmer_name = VALUES(farmer_name), phone_number = VALUES(phone_number), attendees_count = VALUES(attendees_count), remarks = VALUES(remarks)",
            eventId, userId, farmerName, phoneNumber, attendeesCount != null ? attendeesCount : 1, remarks
        );
        return jdbcTemplate.queryForMap("SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?", eventId, userId);
    }

    public List<Map<String, Object>> getEventRegistrations(Long eventId) {
        return jdbcTemplate.queryForList("SELECT * FROM event_registrations WHERE event_id = ? ORDER BY registered_at DESC", eventId);
    }

    public List<Map<String, Object>> getFarmerRegistrations(Long userId) {
        return jdbcTemplate.queryForList("SELECT * FROM event_registrations WHERE user_id = ?", userId);
    }
}
