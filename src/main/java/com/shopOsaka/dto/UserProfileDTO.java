package com.shopOsaka.dto;

import lombok.Data;

@Data

public class UserProfileDTO {
    private String fullName;
    private String phone;
    private String profilePhoto;
    // ← Address fields थपियो
    private String postalCode;
    private String prefecture;
    private String city;
    private String addressLine;
}