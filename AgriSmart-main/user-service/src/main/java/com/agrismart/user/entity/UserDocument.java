package com.agrismart.user.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmer_documents")
public class UserDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "document_type", nullable = false, length = 100)
    private String documentType;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus = "PENDING";

    @Column(name = "verified_by_officer_id")
    private Long verifiedByOfficerId;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejection_remarks", length = 500)
    private String rejectionRemarks;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    public UserDocument() {
    }

    public UserDocument(Long documentId, Long userId, String documentType, String originalFilename, String storagePath, Long fileSize, String mimeType, String verificationStatus, Long verifiedByOfficerId, LocalDateTime verifiedAt, String rejectionRemarks, LocalDateTime uploadedAt) {
        this.documentId = documentId;
        this.userId = userId;
        this.documentType = documentType;
        this.originalFilename = originalFilename;
        this.storagePath = storagePath;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.verificationStatus = verificationStatus != null ? verificationStatus : "PENDING";
        this.verifiedByOfficerId = verifiedByOfficerId;
        this.verifiedAt = verifiedAt;
        this.rejectionRemarks = rejectionRemarks;
        this.uploadedAt = uploadedAt;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Long getVerifiedByOfficerId() {
        return verifiedByOfficerId;
    }

    public void setVerifiedByOfficerId(Long verifiedByOfficerId) {
        this.verifiedByOfficerId = verifiedByOfficerId;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getRejectionRemarks() {
        return rejectionRemarks;
    }

    public void setRejectionRemarks(String rejectionRemarks) {
        this.rejectionRemarks = rejectionRemarks;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (verificationStatus == null) verificationStatus = "PENDING";
    }

    public static UserDocumentBuilder builder() {
        return new UserDocumentBuilder();
    }

    public static class UserDocumentBuilder {
        private Long documentId;
        private Long userId;
        private String documentType;
        private String originalFilename;
        private String storagePath;
        private Long fileSize;
        private String mimeType;
        private String verificationStatus = "PENDING";
        private Long verifiedByOfficerId;
        private LocalDateTime verifiedAt;
        private String rejectionRemarks;
        private LocalDateTime uploadedAt;

        public UserDocumentBuilder documentId(Long documentId) {
            this.documentId = documentId;
            return this;
        }

        public UserDocumentBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public UserDocumentBuilder documentType(String documentType) {
            this.documentType = documentType;
            return this;
        }

        public UserDocumentBuilder originalFilename(String originalFilename) {
            this.originalFilename = originalFilename;
            return this;
        }

        public UserDocumentBuilder storagePath(String storagePath) {
            this.storagePath = storagePath;
            return this;
        }

        public UserDocumentBuilder fileSize(Long fileSize) {
            this.fileSize = fileSize;
            return this;
        }

        public UserDocumentBuilder mimeType(String mimeType) {
            this.mimeType = mimeType;
            return this;
        }

        public UserDocumentBuilder verificationStatus(String verificationStatus) {
            this.verificationStatus = verificationStatus;
            return this;
        }

        public UserDocumentBuilder verifiedByOfficerId(Long verifiedByOfficerId) {
            this.verifiedByOfficerId = verifiedByOfficerId;
            return this;
        }

        public UserDocumentBuilder verifiedAt(LocalDateTime verifiedAt) {
            this.verifiedAt = verifiedAt;
            return this;
        }

        public UserDocumentBuilder rejectionRemarks(String rejectionRemarks) {
            this.rejectionRemarks = rejectionRemarks;
            return this;
        }

        public UserDocumentBuilder uploadedAt(LocalDateTime uploadedAt) {
            this.uploadedAt = uploadedAt;
            return this;
        }

        public UserDocument build() {
            return new UserDocument(documentId, userId, documentType, originalFilename, storagePath, fileSize, mimeType, verificationStatus, verifiedByOfficerId, verifiedAt, rejectionRemarks, uploadedAt);
        }
    }
}

