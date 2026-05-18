package com.shopOsaka.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    // Upload path — project बाहिर permanent folder मा
    // C:/ShopOsakaUploads/ मा save हुन्छ
    private static final String UPLOAD_BASE =
        System.getProperty("user.home") + "/ShopOsakaUploads/";

    @PostMapping("/photo")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "general")
                String category) {
        try {
            // Category अनुसार folder बनाउँछ
            // profiles/, products/, etc.
            String categoryFolder = UPLOAD_BASE + category + "/";
            Files.createDirectories(
                Paths.get(categoryFolder));

            // Unique filename — duplicate हुँदैन
            String ext = getExtension(
                file.getOriginalFilename());
            String fileName = UUID.randomUUID() + ext;

            // File save गर्छ
            Path savePath = Paths.get(
                categoryFolder + fileName);
            Files.write(savePath, file.getBytes());

            // URL — frontend ले access गर्न सक्ने
            String url = "/api/upload/files/"
                + category + "/" + fileName;

            return ResponseEntity.ok(Map.of(
                "url", url,
                "fileName", fileName,
                "message", "Upload successful! ✅"
            ));

        } catch (IOException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message",
                    "Upload failed: " + e.getMessage()));
        }
    }

    // Upload भएको file serve गर्छ
    @GetMapping("/files/{category}/{filename}")
    public ResponseEntity<byte[]> serveFile(
            @PathVariable String category,
            @PathVariable String filename) {
        try {
            Path filePath = Paths.get(
                UPLOAD_BASE + category + "/" + filename);
            byte[] fileBytes = Files.readAllBytes(filePath);

            // File type detect गर्छ
            String contentType = detectContentType(filename);

            return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(fileBytes);

        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot) : ".jpg";
    }

    private String detectContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        return "image/jpeg"; // default
    }
}