package com.shopOsaka.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // कुन User ले order गर्यो
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Order का सबै items
    @OneToMany(mappedBy = "order",
               cascade = CascadeType.ALL)  // Order delete भए items पनि delete
    private List<OrderItem> orderItems;

    @Column(nullable = false)
    private BigDecimal totalAmount;     // कुल रकम

    @Enumerated(EnumType.STRING)
    private OrderStatus status;         // Order को अवस्था

    private String shippingAddress;     // पठाउने ठेगाना

    private LocalDateTime orderedAt;    // कहिले order गर्यो
    private LocalDateTime updatedAt;    // कहिले update भयो

    @PrePersist
    public void prePersist() {
        orderedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = OrderStatus.PENDING; // Default status
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Order का सम्भावित अवस्थाहरू
    public enum OrderStatus {
        PENDING,    // Order भयो, confirm भएको छैन
        CONFIRMED,  // Confirm भयो
        SHIPPING,   // पठाइयो
        DELIVERED,  // पुग्यो
        CANCELLED   // Cancel भयो
    }
}