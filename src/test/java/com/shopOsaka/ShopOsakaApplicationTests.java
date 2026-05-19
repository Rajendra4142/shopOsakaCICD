package com.shopOsaka;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.test.context.bean.override.mockito.MockitoBean;


import com.shopOsaka.service.OtpService;


@SpringBootTest(properties = {
	    "spring.datasource.url=jdbc:h2:mem:testdb",
	    "spring.datasource.driver-class-name=org.h2.Driver",
	    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
	    "spring.jpa.hibernate.ddl-auto=create-drop"
	})
class ShopOsakaApplicationTests {
	
	@MockitoBean
	private OtpService otpService;

	@Test
	void contextLoads() {
	}
	

}
