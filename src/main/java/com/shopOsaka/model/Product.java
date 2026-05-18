package com.shopOsaka.model;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data//lombok:getter setter  automatic banauxa
@Entity //yasle class ko name bata table banauxa yaha product ko tabale banauxa by deafult but hamle table ko name rakheko  xam so tablae je rakheo aba teo banauxa
@Table(name = "products")//tabale ko name products rakheko manually table rakhnako lagi @table user gareko natra pardina

public class Product {
	@Id//primary key
	@GeneratedValue(strategy = GenerationType.IDENTITY)//id lae auto incrimate ko lagi
	private long id;
	
	@Column(nullable = false)//empty nahus vanna ko lagi
	private  String name;
	
	@Column(length = 1000) //characters length 1000  samma rakh vaneko 
	private String description ;
	
	@Column(nullable=false)
	private BigDecimal price;
	
	@Column(nullable = false)
	private Integer stock;//stock kati ota xa vanna kolagi
	
	private String imageUrl;
	
	private String category;
	
	@Column(nullable = false)
	private boolean active = true;//product availabe xa ki xaena vanna ko lagi
	
	@Column(updatable= false)//creat garda matara time set garna ko lagi
	private LocalDateTime createdAt;//data ko koile  banako ho tesko time set ko lagi
	
	private LocalDateTime updatedAt; //kaele update gareko ho tesko datetime rakhnako lagi
	
	@PrePersist// yo garda save garnu agi Jakarta Persistence API (JPA) le  automatic run hunxa matlab method call garnu pardaina
	/*
	 * 1. tmi save() call गर्छौ 2. JPA ले prePersist() call गर्छ 3. createdAt set
	 * हुन्छ 4. अनि database मा save हुन्छ
	 */
	public void prePersist() {
		createdAt = LocalDateTime.now();//ahile ko time set garna ko lagi
		updatedAt = LocalDateTime.now();//kina yaha  updata nargarda suru ma update time ma curent time rakheko vanda paxi problem naaus vanera  paxiORDER BY updated_at DESC yo garda sorting bigrana sakxa
	}
	
	@PreUpdate                                   
    public void preUpdate() {
        updatedAt = LocalDateTime.now();   //Update time set garna
    }

	
	
	
	
	

}
