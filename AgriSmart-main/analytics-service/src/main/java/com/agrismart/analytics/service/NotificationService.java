package com.agrismart.analytics.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.context.event.EventListener;
import org.springframework.context.event.ContextRefreshedEvent;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final JdbcTemplate jdbcTemplate;

    public NotificationService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void createTable() {
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS notifications (" +
            "notification_id BIGINT AUTO_INCREMENT PRIMARY KEY," +
            "title VARCHAR(255) NOT NULL," +
            "message TEXT NOT NULL," +
            "type VARCHAR(50)," +
            "priority VARCHAR(20) DEFAULT 'Normal'," +
            "target_region VARCHAR(100) DEFAULT 'All Farmers'," +
            "sender_id BIGINT," +
            "sender_name VARCHAR(100)," +
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
        ")");
    }

    public Map<String, Object> createNotification(String title, String message, String type, String priority, String targetRegion, Long senderId, String senderName) {
        jdbcTemplate.update(
            "INSERT INTO notifications (title, message, type, priority, target_region, sender_id, sender_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
            title, message, type, priority, targetRegion, senderId, senderName
        );
        return jdbcTemplate.queryForMap("SELECT * FROM notifications ORDER BY notification_id DESC LIMIT 1");
    }

    public List<Map<String, Object>> getAllNotifications() {
        return jdbcTemplate.queryForList("SELECT * FROM notifications ORDER BY created_at DESC");
    }

    public void deleteNotification(Long id) {
        jdbcTemplate.update("DELETE FROM notifications WHERE notification_id = ?", id);
    }

    public Map<String, Object> getNotificationStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM notifications", Integer.class);
        stats.put("total", total);
        
        List<Map<String, Object>> byType = jdbcTemplate.queryForList("SELECT type, COUNT(*) as count FROM notifications GROUP BY type");
        stats.put("byType", byType);
        
        List<Map<String, Object>> byPriority = jdbcTemplate.queryForList("SELECT priority, COUNT(*) as count FROM notifications GROUP BY priority");
        stats.put("byPriority", byPriority);
        
        return stats;
    }
}
