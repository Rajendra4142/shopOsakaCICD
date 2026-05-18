package com.shopOsaka.service;

import com.shopOsaka.model.Product;
import java.util.List;
import java.util.Optional;

// pruductService interface le Service को contract — के-के काम गर्छ भनेर define गर्छ
//यो केवल “contract” हो

public interface ProductService {

    // सबै products ल्याउने
    List<Product> getAllProducts();

    // ID ले एउटा product ल्याउने
    Optional<Product> getProductById(Long id);

    // नयाँ product save गर्ने
    Product saveProduct(Product product);

    // Product update गर्ने
    Product updateProduct(Long id, Product product);

    // Product delete गर्ने
    void deleteProduct(Long id);

    // Category ले products ल्याउने
    List<Product> getProductsByCategory(String category);

    // Keyword ले search गर्ने
    List<Product> searchProducts(String keyword);
}
