package com.shopOsaka.controller;

import com.shopOsaka.model.Order;
import com.shopOsaka.model.User;
import com.shopOsaka.repository.OrderRepository;
import com.shopOsaka.repository.ProductRepository;
import com.shopOsaka.repository.UserRepository;
import com.shopOsaka.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    // ===== Dashboard Stats =====
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts",
            productRepository.count());
        stats.put("totalOrders",
            orderRepository.count());
        stats.put("totalUsers",
            userRepository.count());

        // Revenue — cancelled बाहेक
        BigDecimal revenue = orderRepository.findAll()
            .stream()
            .filter(o -> o.getStatus() !=
                Order.OrderStatus.CANCELLED)
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalRevenue", revenue);

        return ResponseEntity.ok(stats);
    }

    // ===== सबै Orders — latest first =====
    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        List<Order> orders = orderRepository.findAll();

        // Latest order पहिले
        orders.sort((a, b) -> {
            if (a.getOrderedAt() == null) return 1;
            if (b.getOrderedAt() == null) return -1;
            return b.getOrderedAt().compareTo(a.getOrderedAt());
        });

        // Safe response बनाउँछ — Lazy loading issue fix
        List<Map<String, Object>> response = new ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("status", o.getStatus().toString());
            map.put("totalAmount", o.getTotalAmount());
            map.put("shippingAddress", o.getShippingAddress());
            map.put("orderedAt", o.getOrderedAt());

            // User info
            if (o.getUser() != null) {
                map.put("user", Map.of(
                    "fullName", o.getUser().getFullName() != null
                        ? o.getUser().getFullName() : "",
                    "email", o.getUser().getEmail() != null
                        ? o.getUser().getEmail() : ""
                ));
            }

            // Order items
            List<Map<String, Object>> items = new ArrayList<>();
            if (o.getOrderItems() != null) {
                for (var item : o.getOrderItems()) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("price", item.getPrice());
                    if (item.getProduct() != null) {
                        itemMap.put("product", Map.of(
                            "name", item.getProduct().getName() != null
                                ? item.getProduct().getName() : "",
                            "imageUrl", item.getProduct().getImageUrl() != null
                                ? item.getProduct().getImageUrl() : ""
                        ));
                    }
                    items.add(itemMap);
                }
            }
            map.put("orderItems", items);
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    // ===== Order Status Update =====
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        try {
            Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Order not found"));

            order.setStatus(status);
            Order saved = orderRepository.save(order);

            // Status update email पठाउँछ
            emailService.sendStatusUpdate(saved);

            return ResponseEntity.ok(
                Map.of("message", "Updated!",
                       "status", status.toString()));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // ===== सबै Users =====
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName() != null
                ? u.getFullName() : "");
            map.put("email", u.getEmail() != null
                ? u.getEmail() : "");
            map.put("role", u.getRole().toString());
            map.put("active", u.getActive());
            map.put("createdAt", u.getCreatedAt());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }
}