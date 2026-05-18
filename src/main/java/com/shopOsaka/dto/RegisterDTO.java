package com.shopOsaka.dto;

import lombok.Data;

@Data
public class RegisterDTO {

    private String fullName;   // नाम
    private String email;      // Email
    private String password;   // Password
}