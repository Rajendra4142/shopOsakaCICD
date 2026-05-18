package com.shopOsaka.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/address")
@CrossOrigin(origins = "*")
public class AddressController {

    // Japan postal code API बाट address lookup
    @GetMapping("/lookup/{postalCode}")
    public ResponseEntity<?> lookupAddress(
            @PathVariable String postalCode) {
        try {
            // Japan Post Code API — FREE!
            String url = "https://zipcloud.ibsnet.co.jp/api/search?zipcode=" + postalCode;

            RestTemplate restTemplate = new RestTemplate();
            Map response = restTemplate.getForObject(
                url, Map.class);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message",
                    "Postal code lookup failed!"));
        }
    }
}