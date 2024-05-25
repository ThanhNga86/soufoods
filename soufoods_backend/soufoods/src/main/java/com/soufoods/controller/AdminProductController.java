package com.soufoods.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.soufoods.entity.Product;
import com.soufoods.model.FilterProductRequest;
import com.soufoods.service.AdminProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {
	private final AdminProductService productService;

	@GetMapping("")
	public ResponseEntity<?> products(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("sizePage") Optional<Integer> sizePage) {
		return ResponseEntity.ok(productService.findAll(pageNumber, sizePage));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> product(@PathVariable("id") Long id) {
		Map<String, Object> map = productService.findById(id);
		return ResponseEntity.ok(map);
	}

	@PostMapping("/filter")
	public ResponseEntity<?> filterCategory(@RequestBody FilterProductRequest request) {
		return ResponseEntity.ok(productService.filter(request));
	}

	@PostMapping("")
	public ResponseEntity<?> addProduct(Product product, @RequestParam("fileImage") Optional<MultipartFile> fileImage,
			@RequestParam("fileImages") Optional<MultipartFile[]> fileImages) {
		Map<String, String> map = productService.addProduct(product, fileImage, fileImages);
		return ResponseEntity.ok(map);
	}

	@PutMapping("")
	public ResponseEntity<?> update(Product product, @RequestParam("fileImage") Optional<MultipartFile> fileImage, @RequestParam("fileImages") Optional<MultipartFile[]> fileImages,
			@RequestParam("oldImages") Optional<List<String>> oldImages) {
		Map<String, String> map = productService.updateProduct(product, fileImage, fileImages, oldImages);
		return ResponseEntity.ok(map);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteProduct(@PathVariable("id") Optional<Long> productId) {
		Map<String, String> map = productService.deleteProduct(productId);
		return ResponseEntity.ok(map);
	}
}
