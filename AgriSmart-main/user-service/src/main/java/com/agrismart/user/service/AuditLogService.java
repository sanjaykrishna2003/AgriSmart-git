package com.agrismart.user.service;

import com.agrismart.user.entity.AuditLog;
import com.agrismart.user.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog logAction(String action, Long actorId, String actorName, String targetType, String targetId, String details) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .actorId(actorId)
                .actorName(actorName)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build();
        return auditLogRepository.save(log);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
