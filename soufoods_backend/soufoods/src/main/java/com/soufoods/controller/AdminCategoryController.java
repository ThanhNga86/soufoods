package com.soufoods.controller;

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

import com.soufoods.entity.Categories;
import com.soufoods.model.FilterCategoryRequest;
import com.soufoods.service.AdminCategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {
	private final AdminCategoryService categoryService;

	@GetMapping("/all")
	public ResponseEntity<?> categories() {
		return ResponseEntity.ok(categoryService.findAll());
	}
	
	@GetMapping("")
	public ResponseEntity<?> categories(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("totalPage") Optional<Integer> totalPage) {
		return ResponseEntity.ok(categoryService.findAll(pageNumber, totalPage));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> categories(@PathVariable("id") Long id) {
		Map<String, Object> map = categoryService.findById(id);
		return ResponseEntity.ok(map);
	}
	
	@PostMapping("/filter")
	public ResponseEntity<?> filterCategory(@RequestBody FilterCategoryRequest request) {
		return ResponseEntity.ok(categoryService.filterCategory(request));
	}

	@PostMapping("")
	public ResponseEntity<?> addCategory(Categories category,
			@RequestParam("fileImage") Optional<MultipartFile> fileImage) {
		Map<String, String> map = categoryService.addCategory(category, fileImage);
		return ResponseEntity.ok(map);
	}

	@PutMapping("")
	public ResponseEntity<?> updateCategory(Categories category,
			@RequestParam("fileImage") Optional<MultipartFile> fileImage) {
		Map<String, String> map = categoryService.updateCategory(category, fileImage);
		return ResponseEntity.ok(map);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteCategory(@PathVariable("id") Optional<Long> categoryId) {
		Map<String, String> map = categoryService.deleteCategory(categoryId);
		return ResponseEntity.ok(map);
	}
}
