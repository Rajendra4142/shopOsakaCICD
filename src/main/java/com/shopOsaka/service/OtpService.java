package com.shopOsaka.service;

import com.shopOsaka.model.User;
import com.shopOsaka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    
    // .env बाट email address लिन्छ
    @Value("${spring.mail.username}")
    private String fromEmail;
    

    // 6 digit OTP generate गर्छ
    private String generateOtp() {
        return String.valueOf(
            100000 + new Random().nextInt(900000)
        );
    }

    // OTP Email पठाउँछ
    public void sendOtpEmail(String toEmail) {
        User user = userRepository.findByEmail(toEmail)
            .orElseThrow(() ->
                new RuntimeException("User not found!"));

        // OTP generate गर्छ
        String otp = generateOtp();

        // 10 minutes पछि expire हुन्छ
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Email पठाउँछ
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("ShopOsaka - Email Verification");

            // Amazon जस्तो HTML email
            helper.setText(buildEmailHtml(
                user.getFullName(), otp), true);

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email!");
        }
    }

    // OTP verify गर्छ
    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                new RuntimeException("User not found!"));

        // OTP सही छ र expire भएको छैन
        if (user.getOtpCode() != null
                && user.getOtpCode().equals(otp)
                && user.getOtpExpiry().isAfter(
                    LocalDateTime.now())) {

            // Email verified mark गर्छ
            user.setEmailVerified(true);
            user.setOtpCode(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    // Amazon जस्तो HTML Email Template
    private String buildEmailHtml(String name, String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(
                            135deg, #667eea, #764ba2);
                        padding: 30px;
                        text-align: center;
                        color: white;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                    }
                    .body {
                        padding: 40px;
                        text-align: center;
                    }
                    .otp-box {
                        background: #f8f9fa;
                        border: 2px dashed #667eea;
                        border-radius: 12px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .otp-code {
                        font-size: 40px;
                        font-weight: bold;
                        color: #667eea;
                        letter-spacing: 8px;
                    }
                    .footer {
                        background: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        color: #999;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header with Logo -->
                    <div class="header">
                        <h1>🛒 ShopOsaka</h1>
                        <p style="margin:5px 0 0 0; opacity:0.9;">
                            Email Verification
                        </p>
                    </div>

                    <!-- Body -->
                    <div class="body">
                        <h2>Hello, %s! 👋</h2>
                        <p style="color:#666; font-size:16px;">
                            Use the OTP code below to verify your ShopOsaka account:
                        </p>

                        <!-- OTP Box -->
                        <div class="otp-box">
                            <p style="color:#999; margin:0 0 10px 0;">
                                Verification Code
                            </p>
                            <div class="otp-code">%s</div>
                            <p style="color:#999; margin:10px 0 0 0;
                                      font-size:13px;">
                                ⏰ Expires in 10 minutes
                            </p>
                        </div>

                        <p style="color:#999; font-size:13px;">
                            If you did not request this email, please ignore it.
                        </p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>© 2024 ShopOsaka. All rights reserved.</p>
                        <p>Osaka, Japan 🇯🇵</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, otp);
    }
}