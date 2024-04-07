package com.soufoods.controller;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Categories;
import com.soufoods.entity.Product;
import com.soufoods.repo.CategoryRepository;
import com.soufoods.repo.ProductRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {
	private final CategoryRepository categoryRepository;
	private final ProductRepository productRepository;

	@GetMapping("")
	public ResponseEntity<?> categories() {
		List<Categories> categories = categoryRepository.findAll().stream().filter(c -> c.isActive()).toList();
		Collections.reverse(categories);
		return ResponseEntity.ok(categories);
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> productsByCategory(@PathVariable("id") Optional<Long> id) {
		if (id.isPresent()) {
			List<Product> products = productRepository.findAll().stream()
					.filter(p -> (p.getCategoryDetail().getId() == id.get() && p.getCategoryDetail().isActive()) && (p.getCategoryDetail().getCategory().getId() == id.get() && p.getCategoryDetail().getCategory().isActive())).toList();
			return ResponseEntity.ok(products);
		} else {
			return ResponseEntity.badRequest().build();
		}
	}
}
