package com.shopOsaka.dto;

import lombok.Data;

@Data
public class CartDTO {

    private Long productId;    // कुन product add गर्ने
    private Integer quantity;  // कति वटा
}