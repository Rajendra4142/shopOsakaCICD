package com.shopOsaka.controller;

import com.shopOsaka.dto.*;
import com.shopOsaka.service.AuthService;
import com.shopOsaka.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    // Register
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterDTO dto) {
        try {
            return ResponseEntity.ok(
                authService.register(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginDTO dto) {
        try {
            return ResponseEntity.ok(
                authService.login(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // OTP Verify
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {
        boolean verified = otpService.verifyOtp(email, otp);
        if (verified) {
            return ResponseEntity.ok(
                Map.of("message",
                		"Email verified successfully! Please login."));
        }
        return ResponseEntity.badRequest()
            .body(Map.of("message",
            		"Invalid or expired OTP"));
    }

    // OTP Resend
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(
            @RequestParam String email) {
        otpService.sendOtpEmail(email);
        return ResponseEntity.ok(
            Map.of("message", "OTP has been resent to your email"));
    }
}