package com.shopOsaka.service;

import com.shopOsaka.dto.OrderResponseDTO;
import com.shopOsaka.model.*;
import com.shopOsaka.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    // ===== Cart बाट Order बनाउने (Checkout) =====
    @Transactional  // सबै एकैसाथ हुन्छ, एउटा fail भए सबै rollback!
  
    public OrderResponseDTO placeOrder(
            String email,
            String shippingAddress,
            List<Long> selectedCartIds) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                new RuntimeException("User not found"));

        // सबै cart items ल्याउँछ
        List<Cart> allCartItems =
            cartRepository.findByUser(user);

        // Selected items मात्र filter गर्छ
        // selectedCartIds null भए सबै लिन्छ
        List<Cart> cartItems = (selectedCartIds != null)
            ? allCartItems.stream()
                .filter(c -> selectedCartIds
                    .contains(c.getId()))
                .collect(Collectors.toList())
            : allCartItems;

        if (cartItems.isEmpty()) {
            throw new RuntimeException(
            		"Selected items not found!");
        }

        // Order बनाउँछ
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);

        // Total calculate
        BigDecimal total = BigDecimal.ZERO;
        for (Cart cart : cartItems) {
            total = total.add(
                cart.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(
                        cart.getQuantity())));
        }
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        // Order items बनाउँछ
        List<OrderItem> orderItemList = new ArrayList<>();
        for (Cart cart : cartItems) {
            Product product = cart.getProduct();

            if (product.getStock() < cart.getQuantity()) {
                throw new RuntimeException(
                    product.getName() + " stock is not sufficient!");
            }

            OrderItem item = new OrderItem();
            item.setOrder(savedOrder);
            item.setProduct(product);
            item.setQuantity(cart.getQuantity());
            item.setPrice(product.getPrice());
            orderItemList.add(item);
            orderItemRepository.save(item);

            // Stock घटाउँछ
            product.setStock(
                product.getStock() - cart.getQuantity());
            productRepository.save(product);
        }

        savedOrder.setOrderItems(orderItemList);

        // Selected items मात्र cart बाट हटाउँछ
        cartRepository.deleteAll(cartItems);

        // Confirmation email
        emailService.sendOrderConfirmation(savedOrder);

        return convertToDTO(savedOrder);
    }

    // ===== User को सबै Orders ल्याउने =====
    public List<OrderResponseDTO> getUserOrders(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository
                .findByUserOrderByOrderedAtDesc(user)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ===== Order Detail हेर्ने =====
    public OrderResponseDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(order);
    }

    // ===== Admin: Order Status Update गर्ने =====
    public OrderResponseDTO updateOrderStatus(Long orderId,
                                              Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        order.setStatus(status);
        return convertToDTO(orderRepository.save(order));
    }

    // ===== Convert Helper =====
    private OrderResponseDTO convertToDTO(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getId());
        dto.setStatus(order.getStatus().toString());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setOrderedAt(order.getOrderedAt());

        // Order items convert गर्छ
        if (order.getOrderItems() != null) {
            List<OrderResponseDTO.OrderItemDTO> itemDTOs =
                order.getOrderItems().stream().map(item -> {
                    OrderResponseDTO.OrderItemDTO itemDTO =
                        new OrderResponseDTO.OrderItemDTO();
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setImageUrl(item.getProduct().getImageUrl());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPrice(item.getPrice());
                    itemDTO.setSubtotal(item.getPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())));
                    return itemDTO;
                }).collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }
        return dto;
    }
}