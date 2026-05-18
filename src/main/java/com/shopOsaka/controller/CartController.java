package com.shopOsaka.controller;

import com.shopOsaka.dto.CartDTO;
import com.shopOsaka.dto.CartResponseDTO;
import com.shopOsaka.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // POST /api/cart/add?email=ram@gmail.com
    // Cart मा product add गर्ने
    @PostMapping("/add")
    
    public ResponseEntity<?> addToCart(
            @RequestParam String email,
            @RequestBody CartDTO cartDTO) {
        try {
            CartResponseDTO res =
                cartService.addToCart(email, cartDTO);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/cart?email=ram@gmail.com
    // Cart items हेर्ने
    @GetMapping
    public ResponseEntity<?> getCart(
            @RequestParam String email) {
        try {
            return ResponseEntity.ok(
                cartService.getCartItems(email));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE /api/cart/1?email=ram@gmail.com
    // Cart बाट हटाउने
    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long cartId,
            @RequestParam String email) {
        try {
            cartService.removeFromCart(email, cartId);
            return ResponseEntity.ok(
                Map.of("message", "Removed! ✅"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /api/cart/1?email=ram@gmail.com&quantity=3
    // Quantity update गर्ने
    @PutMapping("/{cartId}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Long cartId,
            @RequestParam String email,
            @RequestParam Integer quantity) {
        try {
            CartResponseDTO res =
                cartService.updateQuantity(
                    email, cartId, quantity);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/cart/total?email=ram@gmail.com
    // Total price हेर्ने
    @GetMapping("/total")
    public ResponseEntity<?> getTotal(
            @RequestParam String email) {
        try {
            BigDecimal total =
                cartService.getCartTotal(email);
            return ResponseEntity.ok(
                Map.of("total", total));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }
}