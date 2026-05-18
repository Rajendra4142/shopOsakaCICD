package com.shopOsaka.controller;

import com.shopOsaka.dto.UserProfileDTO;
import com.shopOsaka.model.User;
import com.shopOsaka.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Profile ल्याउने
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @RequestParam String email) {
        try {
            User user = userService.getProfile(email);
            return ResponseEntity.ok(Map.of(
                "fullName",     user.getFullName(),
                "email",        user.getEmail(),
                "phone",        user.getPhone() != null ?
                    user.getPhone() : "",
                "profilePhoto", user.getProfilePhoto() != null ?
                    user.getProfilePhoto() : "",
                "role",         user.getRole().toString(),
                "emailVerified",user.getEmailVerified(),
                // ← Address fields थपियो
                "postalCode",   user.getPostalCode() != null ?
                    user.getPostalCode() : "",
                "prefecture",   user.getPrefecture() != null ?
                    user.getPrefecture() : "",
                "city",         user.getCity() != null ?
                    user.getCity() : "",
                "addressLine",  user.getAddressLine() != null ?
                    user.getAddressLine() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // Profile update गर्ने
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam String email,
            @RequestBody UserProfileDTO dto) {
        try {
            User updated = userService.updateProfile(
                email, dto);
            return ResponseEntity.ok(
                Map.of("message",
                    "Profile updated! ✅",
                    "fullName", updated.getFullName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
}