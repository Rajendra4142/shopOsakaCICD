package com.shopOsaka.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopOsaka.model.Product;
import com.shopOsaka.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController // yo rest api controller ho vanera chinaune 
@RequestMapping("/api/products")// yasle api ko lagi url mapping gareko sabae rest api /api/products  bata suru huxa vanera vanxa
@CrossOrigin(origins = "*")//yasle frontend bata access garna dinxa
@RequiredArgsConstructor//constructor automatic banauxa
public class ProductController {
	
	// productService lai inject gareo aba spring boot le automatic object banayar productService variable rakhxa 
	private final ProductService productService;

	
	// GET /api/products → सबै products ल्याउने
	@GetMapping
	public ResponseEntity<List<Product>>getAllProducts(){
		List<Product>products= productService.getAllProducts();
		return ResponseEntity.ok(products);//200 ok products
		
	}
	
	// GET /api/products/1 → ID ले एउटा product ल्याउने
	 @GetMapping("/{id}")
	    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
	        return productService.getProductById(id)
	                .map(product -> ResponseEntity.ok(product))  // भेटियो → 200 OK
	                .orElse(ResponseEntity.notFound().build());  // भेटिएन → 404
	    }
	 
	// GET /api/products/search?keyword=shirt → Search
	 @GetMapping("/search")
	    public ResponseEntity<List<Product>> searchProducts(
	            @RequestParam String keyword) {  // URL बाट keyword लिन्छ
	        List<Product> products = productService.searchProducts(keyword);
	        return ResponseEntity.ok(products);
	    }
	 
	 
	// GET /api/products/category/Electronics → Category
	 @GetMapping("/category/{category}")
	 public ResponseEntity<List<Product>> getByCategory(
	            @PathVariable String category) {
	        List<Product> products = productService.getProductsByCategory(category);
	        return ResponseEntity.ok(products);
	    }
	 
	// POST /api/products → नयाँ product बनाउने
	 @PostMapping
	    public ResponseEntity<Product> createProduct(
	            @RequestBody Product product) {  // Request body बाट product लिन्छ
	        Product savedProduct = productService.saveProduct(product);
	        return ResponseEntity.status(HttpStatus.CREATED)  // 201 Created
	                .body(savedProduct);
	    }
	 
	// PUT /api/products/1 → Product update गर्ने
	 @PutMapping("/{id}")
	    public ResponseEntity<Product> updateProduct(
	            @PathVariable Long id,
	            @RequestBody Product product) {
	        Product updatedProduct = productService.updateProduct(id, product);
	        return ResponseEntity.ok(updatedProduct);
	    }
	 
	// DELETE /api/products/1 → Product delete गर्ने
	 @DeleteMapping("/{id}")
	    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
	        productService.deleteProduct(id);
	        return ResponseEntity.noContent().build(); // 204 No Content
	    }
}
