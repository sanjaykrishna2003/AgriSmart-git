package com.agrismart.user.controller;

import com.agrismart.user.dto.DocumentResponse;
import com.agrismart.user.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Farmer Documents", description = "Upload, verify and manage farmer identity and scheme documents")
public class DocumentController {

    private final DocumentService documentService;
    public DocumentController(DocumentService documentService) {
    	this.documentService=documentService;
    }
    /* ── Farmer: Upload document ── */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Upload a document", description = "Farmer uploads a document file with its type")
    public ResponseEntity<DocumentResponse> upload(
            Authentication auth,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(documentService.uploadDocument(userId, documentType, file));
    }

    /* ── Farmer: Get own documents ── */
    @GetMapping("/my")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Get my documents", description = "Farmer retrieves all their own uploaded documents")
    public ResponseEntity<List<DocumentResponse>> getMyDocuments(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(documentService.getDocumentsByUserId(userId));
    }

    /* ── Officer/Admin: Get all farmer documents ── */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Get all farmer documents", description = "Officer or Admin retrieves all farmer uploaded documents")
    public ResponseEntity<List<DocumentResponse>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    /* ── Officer/Admin: Get documents for a specific farmer ── */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Get farmer documents", description = "Officer retrieves all documents uploaded by a specific farmer")
    public ResponseEntity<List<DocumentResponse>> getUserDocuments(@PathVariable Long userId) {
        return ResponseEntity.ok(documentService.getDocumentsByUserId(userId));
    }

    /* ── Authenticated: Download document (JWT required) ── */
    @GetMapping("/{documentId}/download")
    @Operation(summary = "Download document", description = "Authenticated download of a document file — JWT required, officer can download any, farmer only own")
    public ResponseEntity<Resource> download(
            @PathVariable Long documentId,
            Authentication auth) {
        Long requestingUserId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("FARMER");

        Resource resource = documentService.downloadDocument(documentId, requestingUserId, role);
        String mimeType = documentService.getMimeType(documentId);
        String filename = documentService.getOriginalFilename(documentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    /* ── Officer/Admin: Verify or Reject a document ── */
    @PutMapping("/{documentId}/verify")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    @Operation(summary = "Verify or reject a document", description = "Officer marks a document as VERIFIED or REJECTED")
    public ResponseEntity<DocumentResponse> verify(
            @PathVariable Long documentId,
            @RequestParam String status,
            @RequestParam(required = false) String remarks,
            Authentication auth) {
        Long officerId = (Long) auth.getCredentials();
        return ResponseEntity.ok(documentService.verifyDocument(documentId, officerId, status, remarks));
    }

    /* ── Farmer: Delete own document ── */
    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('FARMER')")
    @Operation(summary = "Delete a document", description = "Farmer deletes one of their own documents")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long documentId,
            Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        documentService.deleteDocument(documentId, userId);
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully."));
    }
}
