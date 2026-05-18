package com.shopOsaka.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration// यो configuration class हो
@EnableWebSecurity// Security enable गर्छ
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {
        http
            // API project भएकाले CSRF disable गर्छौं// 🔥 CSRF disable CSRF security बन्द गर्छ,Postman बाट POST गर्न मिल्छ
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // ===== HTML Pages =====
            		.requestMatchers(
            			    "/", "/login", "/register", "/product",
            			    "/cart", "/orders", "/admin", "/search",
            			    "/profile", "/verify-email"   // ← थपियो
            			).permitAll()

                // ===== Static Files =====
                .requestMatchers(
                    "/css/**", "/js/**", "/images/**",
                    "/favicon.ico"
                ).permitAll()

                // ===== Public APIs =====
                // Auth - सबैले access गर्न सक्छन्
                .requestMatchers("/api/auth/**").permitAll()

                // Products - सबैले हेर्न सक्छन्
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                // ===== सबै अरू APIs =====
                // अहिलेलाई सबै permit गर्छौं
                // JWT थपेपछि secure गर्नेछौं
                .anyRequest().permitAll()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
    	// BCrypt = सबैभन्दा secure password encryption
        return new BCryptPasswordEncoder();
    }
}