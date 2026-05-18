package com.shopOsaka.repository;
import com.shopOsaka.model.Product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;



@Repository//yo repositoy ho vanera springboot lae vanxa
public interface ProductRepository extends JpaRepository<Product,Long> {
	// yaha interfase  productrepository le JpaRepository interface  laae extends gareko xa (matlab “inherit गर्नु / अर्को class को गुण र behavior लिनु”)  JpaRepository pani interface ho(“यस भित्र method हुन्छ तर दुई प्रकारका:”1. Predefined methods (Spring ले दिएको){save(),findAll(),findById(),deleteById(),count()},2. Custom methods (हामी aafai लेख्छौं){  List<Product> findByName(String name);{  List<Product> findByName(String name);})  ले automatically यी सबै methods दिन्छ:  👉 Spring ले automatically SQL बनाइदिन्छ
    // save(), findById(), findAll(), deleteById() etc.
	
	
	/*
	 Java मा inheritance(extend) 2 ठाउँमा हुन्छ: 
	 
	 कहिले extends प्रयोग हुन्छ?
✔️ 1. Code reuse गर्न
✔️extends भनेको एउटा class ले अर्को class को features inherit गर्ने process हो
	 
	  1. Class → Class
	class Dog extends Animal {
	}👉 एक class ले अर्को class बाट features लिन्छ
	
	2. Interface → Interface
	interface A extends B {
	}👉 एक interface ले अर्को interface बाट rules (methods) लिन्छ
	
	
	
	
	1. extends
	👉 inheritance (parent-child relation)
	class → class
	🧑 Class inheritance:
    👉 Father → Son (real features आउँछ)

	interface → interface
	📜 Interface inheritance:
     👉 Rule book → extended rule book
     Interface ले अर्को interface extend गर्दा केवल method rules inherit गर्छ, implementation होइन।
	
	
	2. implements
	👉 interface को rule follow गर्न
	class → interface
	👉 class ले interface को method पूरा गर्नै पर्छ*/
	
	 
	
	// Name ले product खोज्ने
    // "findBy" + "Name" + "Containing" = name मा keyword भएका सबै products
    List<Product> findByNameContaining(String name); //yo method vayo  yasle list object banayara querchlayar database bata date nikalera list ma rakher retrun garxa yakapatak ma 
   
    
    
    
    
    /*
     * 
     * yaslae manully spring boot use naggari lekhna pareko  yasto huntheo
     * 
     * 
     * public List<Product> findByNameContaining(String keyword) throws Exception {

        List<Product> list = new ArrayList<>();

        String sql = "SELECT * FROM products WHERE name LIKE ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, "%" + keyword + "%");

        ResultSet rs = ps.executeQuery();

        while (rs.next()) {
            Product p = new Product();
            p.setId(rs.getLong("id"));
            p.setName(rs.getString("name"));

            list.add(p);
        }

        return list;
    }*/
    
    
    
    
    //Category  le  products  khojne 
    List<Product>findByCategory(String category);
    
    
    
    
 // Active products मात्र देखाउने
    List<Product> findByActiveTrue();

    
    
    // Category र Active दुवै filter गर्ने
    List<Product> findByCategoryAndActiveTrue(String category);
    
    
    
    
    // Search feature को लागि — name वा description मा keyword खोज्ने
    
    //yo  SearchProducts method  ko lagi ho kina vane yo advance query vayko vayara manullay lekhna pareko ho 
    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    
    List<Product>searchProducts(String keyword);
	
}
