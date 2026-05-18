package com.shopOsaka.controller;

import com.shopOsaka.dto.OrderResponseDTO;
import com.shopOsaka.model.Order;
import com.shopOsaka.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // POST /api/orders/place?email=ram@gmail.com
    // Checkout — Order place गर्ने
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(
            @RequestParam String email,
            @RequestParam String shippingAddress,
            // Selected cart IDs — optional
            @RequestParam(required = false) String cartIds) {
        try {
            // cartIds parse गर्छ
            List<Long> selectedIds = null;
            if (cartIds != null && !cartIds.isEmpty()) {
                selectedIds = Arrays.stream(
                    cartIds.split(","))
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
            }

            OrderResponseDTO res = orderService.placeOrder(
                email, shippingAddress, selectedIds);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/orders?email=ram@gmail.com
    // आफ्नो orders हेर्ने
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(
            @RequestParam String email) {
        List<OrderResponseDTO> orders = orderService
                .getUserOrders(email);
        return ResponseEntity.ok(orders);
    }

    // GET /api/orders/1
    // एउटा order को detail हेर्ने
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrder(
            @PathVariable Long orderId) {
        OrderResponseDTO order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    // PUT /api/orders/1/status?status=CONFIRMED (Admin)
    // Order status update गर्ने
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(
            @PathVariable Long orderId,
            @RequestParam Order.OrderStatus status) {
        OrderResponseDTO response = orderService
                .updateOrderStatus(orderId, status);
        return ResponseEntity.ok(response);
    }
}