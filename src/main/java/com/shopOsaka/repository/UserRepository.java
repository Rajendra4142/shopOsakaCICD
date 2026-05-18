package com.shopOsaka.repository;

import com.shopOsaka.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Email ले user खोज्ने (Login को लागि)
    Optional<User> findByEmail(String email);

    // Email already exist गर्छ कि गर्दैन check गर्ने
    Boolean existsByEmail(String email);
}