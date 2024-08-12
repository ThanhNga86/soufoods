package com.soufoods.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Product;
import com.soufoods.service.HomeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HomeController {
	private final HomeService homeService;

	@GetMapping("/categoryDetails")
	public ResponseEntity<?> categoryDetails() {
		return ResponseEntity.ok(homeService.findAllCategoryDetail());
	}

	@GetMapping("/promotionProducts")
	public ResponseEntity<?> promotionProducts() {
		return ResponseEntity.ok(homeService.findAllPromotionProduct());
	}

	@GetMapping("/findAllProduct/{name}")
	public ResponseEntity<?> findAllProductByCategory(@PathVariable("name") String name) {
		return ResponseEntity.ok(homeService.findAllProductByCategory(name));
	}

	@GetMapping("/sellingProducts")
	public ResponseEntity<?> sellingProducts() {
		return ResponseEntity.ok(homeService.findALlSellingProducts());
	}

	@GetMapping("/findAllByProduct/{id}")
	public ResponseEntity<?> promotionProducts(@PathVariable("id") Product product) {
		return ResponseEntity.ok(homeService.findAllByProduct(product));
	}

}
