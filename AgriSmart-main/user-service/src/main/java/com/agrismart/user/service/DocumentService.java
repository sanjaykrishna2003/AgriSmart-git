package com.agrismart.user.service;

import com.agrismart.user.dto.DocumentResponse;
import com.agrismart.user.entity.UserDocument;
import com.agrismart.user.exception.BadRequestException;
import com.agrismart.user.exception.ResourceNotFoundException;
import com.agrismart.user.entity.User;
import com.agrismart.user.repository.UserDocumentRepository;
import com.agrismart.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final UserDocumentRepository documentRepository;
    private final UserRepository userRepository;

    public DocumentService(UserDocumentRepository documentRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Value("${app.upload.path:./uploads/documents}")
    private String uploadBasePath;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
            "Aadhaar Card", "Bank Passbook", "Land Records",
            "Soil Health Card", "Sowing Certificate",
            "PAN Card", "Caste Certificate", "Income Certificate", "Other"
    );

    private static final List<String> ALLOWED_MIME = Arrays.asList(
            "application/pdf", "image/jpeg", "image/png", "image/jpg"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public DocumentResponse uploadDocument(Long userId, String documentType, MultipartFile file) {
        // Validate document type
        if (!ALLOWED_TYPES.contains(documentType)) {
            throw new BadRequestException("Invalid document type: " + documentType);
        }
        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("File must not be empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds the 10MB limit.");
        }
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME.contains(mimeType)) {
            throw new BadRequestException("Only PDF, JPEG, and PNG files are allowed.");
        }

        // Build user-specific upload directory
        Path userDir = Paths.get(uploadBasePath, String.valueOf(userId));
        try {
            Files.createDirectories(userDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory.", e);
        }

        // Generate unique filename to avoid collisions
        String ext = "";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.'));
        }
        String storedFilename = UUID.randomUUID() + ext;
        Path targetPath = userDir.resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }

        // Save metadata to DB
        UserDocument doc = UserDocument.builder()
                .userId(userId)
                .documentType(documentType)
                .originalFilename(originalName)
                .storagePath(targetPath.toAbsolutePath().toString())
                .fileSize(file.getSize())
                .mimeType(mimeType)
                .verificationStatus("PENDING")
                .build();

        UserDocument saved = documentRepository.save(doc);
        return toResponse(saved);
    }

    public List<DocumentResponse> getDocumentsByUserId(Long userId) {
        return documentRepository.findByUserIdOrderByUploadedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Resource downloadDocument(Long documentId, Long requestingUserId, String requestingRole) {
        UserDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        // Farmers can only download their own; Officers/Admins can download any
        if (!"OFFICER".equals(requestingRole) && !"ADMIN".equals(requestingRole)) {
            if (!doc.getUserId().equals(requestingUserId)) {
                throw new BadRequestException("Access denied to this document.");
            }
        }

        Path filePath = Paths.get(doc.getStoragePath());
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new ResourceNotFoundException("File not found on server: " + documentId);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Malformed file path.", e);
        }
    }

    public DocumentResponse verifyDocument(Long documentId, Long officerId, String status, String remarks) {
        if (!Arrays.asList("VERIFIED", "REJECTED").contains(status)) {
            throw new BadRequestException("Status must be VERIFIED or REJECTED.");
        }
        UserDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        doc.setVerificationStatus(status);
        doc.setVerifiedByOfficerId(officerId);
        doc.setVerifiedAt(LocalDateTime.now());
        if ("REJECTED".equals(status) && remarks != null) {
            doc.setRejectionRemarks(remarks);
        }

        return toResponse(documentRepository.save(doc));
    }

    public void deleteDocument(Long documentId, Long userId) {
        UserDocument doc = documentRepository.findByDocumentIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found or access denied."));

        // Delete file from disk
        try {
            Path filePath = Paths.get(doc.getStoragePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail — remove record anyway
            System.err.println("Could not delete file from disk: " + e.getMessage());
        }

        documentRepository.delete(doc);
    }

    public String getMimeType(Long documentId) {
        return documentRepository.findById(documentId)
                .map(UserDocument::getMimeType)
                .orElse("application/octet-stream");
    }

    public String getOriginalFilename(Long documentId) {
        return documentRepository.findById(documentId)
                .map(UserDocument::getOriginalFilename)
                .orElse("document");
    }

    private DocumentResponse toResponse(UserDocument doc) {
        String uName = null;
        String uEmail = null;
        if (doc.getUserId() != null) {
            User u = userRepository.findById(doc.getUserId()).orElse(null);
            if (u != null) {
                uName = u.getName();
                uEmail = u.getEmail();
            }
        }

        return DocumentResponse.builder()
                .documentId(doc.getDocumentId())
                .userId(doc.getUserId())
                .userName(uName)
                .userEmail(uEmail)
                .documentType(doc.getDocumentType())
                .originalFilename(doc.getOriginalFilename())
                .fileSize(doc.getFileSize())
                .mimeType(doc.getMimeType())
                .verificationStatus(doc.getVerificationStatus())
                .verifiedByOfficerId(doc.getVerifiedByOfficerId())
                .verifiedAt(doc.getVerifiedAt())
                .rejectionRemarks(doc.getRejectionRemarks())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
