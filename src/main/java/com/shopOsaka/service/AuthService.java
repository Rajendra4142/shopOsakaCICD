package com.shopOsaka.service;

import com.shopOsaka.dto.AuthResponseDTO;
import com.shopOsaka.dto.LoginDTO;
import com.shopOsaka.dto.RegisterDTO;
import com.shopOsaka.model.User;
import com.shopOsaka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    // ===== Register =====
    public AuthResponseDTO register(RegisterDTO dto) {

        // Email already छ कि check
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException(
                "Email already registered!");
        }

        // User बनाउँछ
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(
            passwordEncoder.encode(dto.getPassword()));

        userRepository.save(user);

        // OTP Email पठाउँछ
        otpService.sendOtpEmail(user.getEmail());

        return new AuthResponseDTO(
        		"Registration successful. OTP sent to your email.",
            user.getRole().toString(),
            user.getEmail(),
            user.getFullName(),
            false // email verified छैन
        );
    }

    // ===== Login =====
    public AuthResponseDTO login(LoginDTO dto) {

        User user = userRepository.findByEmail(dto.getEmail())
            .orElseThrow(() ->
                new RuntimeException("Email not found"));

        if (!passwordEncoder.matches(
                dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }

        // Email verified छैन भने OTP पठाउँछ
        if (!user.getEmailVerified()) {
            otpService.sendOtpEmail(dto.getEmail());
            throw new RuntimeException(
                "EMAIL_NOT_VERIFIED");
        }

        return new AuthResponseDTO(
            "Login successful! 🎉",
            user.getRole().toString(),
            user.getEmail(),
            user.getFullName(),
            true
        );
    }
}