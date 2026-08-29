package com.agrismart.user.dto;

import java.time.LocalDateTime;

public class DocumentResponse {
    private Long documentId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String documentType;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;
    private String verificationStatus;
    private Long verifiedByOfficerId;
    private LocalDateTime verifiedAt;
    private String rejectionRemarks;
    private LocalDateTime uploadedAt;

    public DocumentResponse() {
    }

    public DocumentResponse(Long documentId, Long userId, String userName, String userEmail, String documentType, String originalFilename, Long fileSize, String mimeType, String verificationStatus, Long verifiedByOfficerId, LocalDateTime verifiedAt, String rejectionRemarks, LocalDateTime uploadedAt) {
        this.documentId = documentId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.documentType = documentType;
        this.originalFilename = originalFilename;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.verificationStatus = verificationStatus;
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
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

    public static DocumentResponseBuilder builder() {
        return new DocumentResponseBuilder();
    }

    public static class DocumentResponseBuilder {
        private Long documentId;
        private Long userId;
        private String userName;
        private String userEmail;
        private String documentType;
        private String originalFilename;
        private Long fileSize;
        private String mimeType;
        private String verificationStatus;
        private Long verifiedByOfficerId;
        private LocalDateTime verifiedAt;
        private String rejectionRemarks;
        private LocalDateTime uploadedAt;

        public DocumentResponseBuilder documentId(Long documentId) {
            this.documentId = documentId;
            return this;
        }

        public DocumentResponseBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public DocumentResponseBuilder userName(String userName) {
            this.userName = userName;
            return this;
        }

        public DocumentResponseBuilder userEmail(String userEmail) {
            this.userEmail = userEmail;
            return this;
        }

        public DocumentResponseBuilder documentType(String documentType) {
            this.documentType = documentType;
            return this;
        }

        public DocumentResponseBuilder originalFilename(String originalFilename) {
            this.originalFilename = originalFilename;
            return this;
        }

        public DocumentResponseBuilder fileSize(Long fileSize) {
            this.fileSize = fileSize;
            return this;
        }

        public DocumentResponseBuilder mimeType(String mimeType) {
            this.mimeType = mimeType;
            return this;
        }

        public DocumentResponseBuilder verificationStatus(String verificationStatus) {
            this.verificationStatus = verificationStatus;
            return this;
        }

        public DocumentResponseBuilder verifiedByOfficerId(Long verifiedByOfficerId) {
            this.verifiedByOfficerId = verifiedByOfficerId;
            return this;
        }

        public DocumentResponseBuilder verifiedAt(LocalDateTime verifiedAt) {
            this.verifiedAt = verifiedAt;
            return this;
        }

        public DocumentResponseBuilder rejectionRemarks(String rejectionRemarks) {
            this.rejectionRemarks = rejectionRemarks;
            return this;
        }

        public DocumentResponseBuilder uploadedAt(LocalDateTime uploadedAt) {
            this.uploadedAt = uploadedAt;
            return this;
        }

        public DocumentResponse build() {
            return new DocumentResponse(documentId, userId, userName, userEmail, documentType, originalFilename, fileSize, mimeType, verificationStatus, verifiedByOfficerId, verifiedAt, rejectionRemarks, uploadedAt);
        }
    }
}
