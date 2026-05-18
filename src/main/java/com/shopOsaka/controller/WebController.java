package com.shopOsaka.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// @Controller — HTML pages serve गर्छ
// @RestController होइन! (त्यो API को लागि थियो)
@Controller
public class WebController {

    // / → index.html
    @GetMapping("/")
    public String home() {
        return "index"; // templates/index.html
    }

    // /login → login.html
    @GetMapping("/login")
    public String login() {
        return "login"; // templates/login.html
    }

    // /register → register.html
    @GetMapping("/register")
    public String register() {
        return "register"; // templates/register.html
    }

    // /cart → cart.html
    @GetMapping("/cart")
    public String cart() {
        return "cart"; // templates/cart.html
    }

    // /orders → orders.html
    @GetMapping("/orders")
    public String orders() {
        return "orders"; // templates/orders.html
    }

    // /product → product.html
    @GetMapping("/product")
    public String product() {
        return "product"; // templates/product.html
    }

    // /admin → admin.html
    @GetMapping("/admin")
    public String admin() {
        return "admin"; // templates/admin.html
    }
    
 // Profile page
    @GetMapping("/profile")
    public String profile() {
        return "profile";
    }

    // OTP Verify page
    @GetMapping("/verify-email")
    public String verifyEmail() {
        return "verify-email";
    }
}