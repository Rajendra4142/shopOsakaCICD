package com.shopOsaka.service;

import com.shopOsaka.dto.CartDTO;
import com.shopOsaka.dto.CartResponseDTO;
import com.shopOsaka.model.Cart;
import com.shopOsaka.model.Product;
import com.shopOsaka.model.User;
import com.shopOsaka.repository.CartRepository;
import com.shopOsaka.repository.ProductRepository;
import com.shopOsaka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // ===== Cart मा Product Add गर्ने =====
    public CartResponseDTO addToCart(String email, CartDTO cartDTO) {

        // User खोज्छ
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Product खोज्छ
        Product product = productRepository.findById(cartDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Stock छ कि छैन check गर्छ
        if (product.getStock() < cartDTO.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        // Already cart मा छ कि छैन check गर्छ
        Cart cart = cartRepository
                .findByUserAndProduct(user, product)
                .orElse(new Cart());  // छैन भने नयाँ बनाउँछ

        // Data set गर्छ
        cart.setUser(user);
        cart.setProduct(product);

        // Already छ भने quantity थप्छ
        if (cart.getId() != null) {
            cart.setQuantity(cart.getQuantity() + cartDTO.getQuantity());
        } else {
            cart.setQuantity(cartDTO.getQuantity());
        }

        Cart savedCart = cartRepository.save(cart);
        return convertToDTO(savedCart);
    }

    // ===== User को सबै Cart Items ल्याउने =====
    public List<CartResponseDTO> getCartItems(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Cart> cartItems = cartRepository.findByUser(user);

        // Cart items लाई DTO मा convert गर्छ
        return cartItems.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ===== Cart बाट Product हटाउने =====
    public void removeFromCart(String email, Long cartId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // आफ्नै cart हो कि होइन check गर्छ
        if (!cart.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied!");
        }

        cartRepository.deleteById(cartId);
    }

    // ===== Quantity Update गर्ने =====
    public CartResponseDTO updateQuantity(String email,
                                          Long cartId,
                                          Integer quantity) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Stock check गर्छ
        if (cart.getProduct().getStock() < quantity) {
            throw new RuntimeException("Stock पुगेन!");
        }

        cart.setQuantity(quantity);
        return convertToDTO(cartRepository.save(cart));
    }

    // ===== Total Price Calculate गर्ने =====
    public BigDecimal getCartTotal(String email) {

        List<CartResponseDTO> items = getCartItems(email);

        // सबै subtotals जोड्छ
        return items.stream()
                .map(CartResponseDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ===== Cart → DTO Convert गर्ने (Helper) =====
    private CartResponseDTO convertToDTO(Cart cart) {
        CartResponseDTO dto = new CartResponseDTO();
        dto.setCartId(cart.getId());
        dto.setProductId(cart.getProduct().getId());
        dto.setProductName(cart.getProduct().getName());
        dto.setImageUrl(cart.getProduct().getImageUrl());
        dto.setPrice(cart.getProduct().getPrice());
        dto.setQuantity(cart.getQuantity());

        // Subtotal = price × quantity
        dto.setSubtotal(cart.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(cart.getQuantity())));
        return dto;
    }
}