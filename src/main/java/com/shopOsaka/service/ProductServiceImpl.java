package com.shopOsaka.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import com.shopOsaka.model.Product;
import com.shopOsaka.repository.ProductRepository;
import lombok.RequiredArgsConstructor;

@Service //yo chai service ho vnera banxa  yasle chai exact service dinxa
@RequiredArgsConstructor// lombok:Constructor automatically banauxa 
public class ProductServiceImpl implements ProductService{
	//ProductServiceImpl class le interface ProductService  lae  implements gareko xa  yasko garda ke hunxa vane म यो interface का सबै method पूरा गर्छु” vanne hunxa natara error hunxa
	
	//तिमीले manually object create गर्न पर्दैन yati matra lekhesi spring boot le object banauxa final लेख्दा Spring ले value एकचोटि राख्छ र पछि change गर्न पाइँदैन, त्यसैले code safe हुन्छ।
	private final ProductRepository productRepository;
	
	// Spring internally बनाउँछ (proxy class)
	//ProductRepository productRepository = new ProductRepositoryImpl();
	
	
	//👉 @Override मतलब यो method parent interface वा class बाट आएको हो र हामीले यहाँ implement गरेका हौँ
	
	
	// yasle sabe product productRepository bata leraaauxa ani return pani garxa
	@Override //interface  ko method implement garinxa raw use garna pani override lekhna parxa ani body dinaparxa (almost always) lekhnae parxa tara class le class extend garera  parenetko method chage garna khojda matra override lekhinxa
	//यो method ProductService interface बाट आएको हो
	public List<Product>getAllProducts(){
		return productRepository.findByActiveTrue();
		
	}
	
	//id bata product leraune 
	@Override
	public Optional<Product>getProductById(Long id){
		return productRepository.findById(id);
	}
	
	
	//product lae database ma save garne
	@Override
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
	
	// ===== Product Update गर्ने =====
    @Override
    public Product updateProduct(Long id, Product updatedProduct) {
        // पहिले पुरानो product खोज्छ
        Product existingProduct = productRepository.findById(id)
                                                   .orElseThrow(() -> new RuntimeException("Product Not Found"));

        // नयाँ data set गर्छ
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStock(updatedProduct.getStock());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        existingProduct.setCategory(updatedProduct.getCategory());

        // Updated product save गर्छ
        return productRepository.save(existingProduct);
    }
    
    
 // ===== Product Delete गर्ने =====
    @Override
    public void deleteProduct(Long id) {
        // Permanently delete नगरी active = false गर्छ
        // (Soft Delete — real companies यही गर्छन्!)
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(false);           // Hide गर्छ
        productRepository.save(product);    // Save गर्छ
    }

    // ===== Category ले Products ल्याउने =====
    @Override
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category);
    }

    // ===== Search गर्ने =====
    @Override
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword);
    }

}
