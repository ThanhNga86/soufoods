package com.soufoods.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Review;
import com.soufoods.model.FilterReviewRequest;
import com.soufoods.service.AdminReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {
	private final AdminReviewService reviewService;

	@GetMapping("")
	public ResponseEntity<?> reviews(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("sizePage") Optional<Integer> sizePage) {
		return ResponseEntity.ok(reviewService.findAll(pageNumber, sizePage));
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> review(@PathVariable("id") Long id) {
		Map<String, Object> map = reviewService.findById(id);
		return ResponseEntity.ok(map);
	}

	@PostMapping("/filter")
	public ResponseEntity<?> filterReview(@RequestBody FilterReviewRequest request) {
		return ResponseEntity.ok(reviewService.filter(request));
	}
	
	@PutMapping("/hiddenAndShow")
	public ResponseEntity<?> hiddenAndShowReview(Review review) {
		return ResponseEntity.ok(reviewService.hiddenAndShowReview(review));
	}

}
