package com.shopOsaka.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {

    private Long orderId;
    private String status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private LocalDateTime orderedAt;
    private List<OrderItemDTO> items;   // Order का items

    @Data
    public static class OrderItemDTO {
        private String productName;
        private String imageUrl;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal subtotal;
    }
}