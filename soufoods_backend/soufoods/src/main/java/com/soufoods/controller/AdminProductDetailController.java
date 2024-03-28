package com.soufoods.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Product;
import com.soufoods.entity.ProductDetail;
import com.soufoods.service.AdminProductDetailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/productdetail")
@RequiredArgsConstructor
public class AdminProductDetailController {
	private final AdminProductDetailService productDetailService;

	@GetMapping("/{id}")
	public ResponseEntity<?> productDetail(@PathVariable("id") Long id) {
		Map<String, Object> map = productDetailService.findById(id);
		return ResponseEntity.ok(map);
	}
	
	@GetMapping("/all/{id}")
	public ResponseEntity<?> findAllByProduct(Product product) {
		return ResponseEntity.ok(productDetailService.findAllByProduct(product));
	}

	@PostMapping("")
	public ResponseEntity<?> addProductDetail(ProductDetail productDetail) {
		Map<String, String> map = productDetailService.addProductDetail(productDetail);
		return ResponseEntity.ok(map);
	}

	@PutMapping("")
	public ResponseEntity<?> updateProductDetail(ProductDetail productDetail) {
		Map<String, String> map = productDetailService.updateProductDetail(productDetail);
		return ResponseEntity.ok(map);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteProduct(@PathVariable("id") Optional<Long> productDetailId) {
		Map<String, String> map = productDetailService.deleteProductDetail(productDetailId);
		return ResponseEntity.ok(map);
	}
}
