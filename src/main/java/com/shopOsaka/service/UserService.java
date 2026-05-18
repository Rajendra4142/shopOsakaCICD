package com.shopOsaka.service;

import com.shopOsaka.dto.UserProfileDTO;
import com.shopOsaka.model.User;
import com.shopOsaka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Profile ल्याउँछ
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() ->
                new RuntimeException("User not found!"));
    }

    // Profile update गर्छ
    public User updateProfile(String email, UserProfileDTO dto) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                new RuntimeException("User not found!"));

        if (dto.getFullName() != null)
            user.setFullName(dto.getFullName());
        if (dto.getPhone() != null)
            user.setPhone(dto.getPhone());
        if (dto.getProfilePhoto() != null)
            user.setProfilePhoto(dto.getProfilePhoto());
        // ← Address fields थपियो
        if (dto.getPostalCode() != null)
            user.setPostalCode(dto.getPostalCode());
        if (dto.getPrefecture() != null)
            user.setPrefecture(dto.getPrefecture());
        if (dto.getCity() != null)
            user.setCity(dto.getCity());
        if (dto.getAddressLine() != null)
            user.setAddressLine(dto.getAddressLine());

        return userRepository.save(user);
    }
}