package com.shopOsaka.repository;

import com.shopOsaka.model.Order;
import com.shopOsaka.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository
        extends JpaRepository<Order, Long> {

    // User को orders — latest first
    List<Order> findByUserOrderByOrderedAtDesc(User user);

    // Status ले filter
    List<Order> findByStatus(Order.OrderStatus status);

    // Total revenue calculate
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) " +
           "FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal calculateTotalRevenue();
}