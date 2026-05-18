package com.shopOsaka.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Profile photo URL
    private String profilePhoto;

    // Phone number
    private String phone;

    // Address
    @Column(name = "postal_code")
    private String postalCode;      // 〒 123-4567

    @Column(name = "prefecture")
    private String prefecture;      // 大阪府

    @Column(name = "city")
    private String city;            // 大阪市

    @Column(name = "address_line")
    private String addressLine;     // 具体的な住所

    @Column(name = "address_name")
    private String addressName;     // "Home", "Office"

    // Email verified छ कि छैन
    @Column(nullable = false)
    private Boolean emailVerified = false;

    // OTP code (6 digits)
    private String otpCode;

    // OTP expire time
    private LocalDateTime otpExpiry;

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (role == null) role = Role.CUSTOMER;
        if (emailVerified == null) emailVerified = false;
    }

    public enum Role {
        CUSTOMER,
        ADMIN
    }
}