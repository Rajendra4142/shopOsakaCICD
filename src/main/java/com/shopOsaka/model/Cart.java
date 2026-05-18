package com.shopOsaka.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // कुन User को cart हो
    @ManyToOne                          // धेरै cart items → एउटा user
    @JoinColumn(name = "user_id",
                nullable = false)
    private User user;

    // कुन Product छ cart मा
    @ManyToOne                          // धेरै cart items → एउटा product
    @JoinColumn(name = "product_id",
                nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;           // कति वटा थपेको छ

    private LocalDateTime addedAt;      // कहिले थपेको

    @PrePersist
    public void prePersist() {
        addedAt = LocalDateTime.now();
    }
}
