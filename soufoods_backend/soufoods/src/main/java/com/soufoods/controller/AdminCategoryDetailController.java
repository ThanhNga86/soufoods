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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.soufoods.entity.Categories;
import com.soufoods.entity.CategoryDetail;
import com.soufoods.service.AdminCategoryDetailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/categoryDetail")
@RequiredArgsConstructor
public class AdminCategoryDetailController {
	private final AdminCategoryDetailService categoryDetailService;

	@GetMapping("/all/{id}")
	public ResponseEntity<?> categoryDetails(@PathVariable("id") Categories categories) {
		return ResponseEntity.ok(categoryDetailService.findAllByCategory(categories));
	}
	
	@GetMapping("/all")
	public ResponseEntity<?> findAll() {
		return ResponseEntity.ok(categoryDetailService.findAll());
	}

	@PostMapping("")
	public ResponseEntity<?> addCategoryDetail(CategoryDetail categoryD, @RequestParam("fileImage") Optional<MultipartFile> fileImage) {
		Map<String, String> map = categoryDetailService.addCategoryDetail(categoryD, fileImage);
		return ResponseEntity.ok(map);
	}

	@PutMapping("")
	public ResponseEntity<?> updateCategoryDetail(CategoryDetail categoryD, @RequestParam("fileImage") Optional<MultipartFile> fileImage) {
		Map<String, String> map = categoryDetailService.updateCategoryDetail(categoryD, fileImage);
		return ResponseEntity.ok(map);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteCategoryDetail(@PathVariable("id") Optional<Long> categoryDetailId) {
		Map<String, String> map = categoryDetailService.deleteCategoryDetail(categoryDetailId);
		return ResponseEntity.ok(map);
	}
}
