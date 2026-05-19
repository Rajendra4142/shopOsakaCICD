package com.shopOsaka;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.shopOsaka.service.EmailService;


@SpringBootTest(properties = {
	    "spring.datasource.url=jdbc:h2:mem:testdb",
	    "spring.datasource.driver-class-name=org.h2.Driver",
	    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
	    "spring.jpa.hibernate.ddl-auto=create-drop"
	})
class ShopOsakaApplicationTests {
	
	@MockitoBean
	private EmailService emailService;

	@Test
	void contextLoads() {
	}
	

}
