package com.shopOsaka.repository;

import com.shopOsaka.model.Cart;
import com.shopOsaka.model.User;
import com.shopOsaka.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // User को सबै cart items ल्याउने
    List<Cart> findByUser(User user);

    // User र Product दुवैले खोज्ने
    // (already cart मा छ कि छैन check गर्न)
    Optional<Cart> findByUserAndProduct(User user, Product product);

    // User को सबै cart items delete गर्ने
    // (Checkout पछि cart खाली गर्न)
    void deleteByUser(User user);
}