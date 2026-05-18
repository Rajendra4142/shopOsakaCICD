package com.shopOsaka.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String message;
    private String role;
    private String email;
    private String fullName;      // नाम थपियो
    private Boolean emailVerified; // verification status
}