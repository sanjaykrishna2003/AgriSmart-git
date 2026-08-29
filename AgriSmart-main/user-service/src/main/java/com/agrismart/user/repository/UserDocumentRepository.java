package com.agrismart.user.repository;

import com.agrismart.user.entity.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {

    List<UserDocument> findByUserIdOrderByUploadedAtDesc(Long userId);

    List<UserDocument> findByUserIdAndDocumentTypeOrderByUploadedAtDesc(Long userId, String documentType);

    Optional<UserDocument> findByDocumentIdAndUserId(Long documentId, Long userId);

    long countByUserIdAndVerificationStatus(Long userId, String status);
}
