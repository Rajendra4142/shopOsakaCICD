package com.shopOsaka.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartResponseDTO {

    private Long cartId;           // Cart item को ID
    private Long productId;        // Product ID
    private String productName;    // Product को नाम
    private String imageUrl;       // Product को photo
    private BigDecimal price;      // एउटाको price
    private Integer quantity;      // कति वटा
    private BigDecimal subtotal;   // price × quantity
}