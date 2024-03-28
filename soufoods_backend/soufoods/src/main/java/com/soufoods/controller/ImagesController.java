package com.soufoods.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Product;
import com.soufoods.entity.Review;
import com.soufoods.service.ImagesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImagesController {
	private final ImagesService imagesService;

	@GetMapping("/product/{id}")
	public ResponseEntity<?> findAllByProduct(Product product) {
		return ResponseEntity.ok(imagesService.findAllByProduct(product));
	}
	
	@GetMapping("/review/{id}")
	public ResponseEntity<?> findAllByReview(Review review) {
		return ResponseEntity.ok(imagesService.findAllByReview(review));
	}
}
