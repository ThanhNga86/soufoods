package com.soufoods.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.model.FilterOrderRequest;
import com.soufoods.service.AdminOrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {
	private final AdminOrderService adminOrderService;

	@GetMapping("/apply")
	public ResponseEntity<?> ordersByApply(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("sizePage") Optional<Integer> sizePage1) {
		return ResponseEntity.ok(adminOrderService.findAllByApply(pageNumber, sizePage1));
	}
	
	@GetMapping("/cancel/{id}")
	public ResponseEntity<?> ordersByApply(@PathVariable("id") Long id) {
		return ResponseEntity.ok(adminOrderService.orderCancel(id));
	}

	@GetMapping("")
	public ResponseEntity<?> orders(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("sizePage") Optional<Integer> sizePage1) {
		return ResponseEntity.ok(adminOrderService.findAll(pageNumber, sizePage1));
	}
	
	@PostMapping("/filter")
	public ResponseEntity<?> filter(@RequestBody FilterOrderRequest request) {
		return ResponseEntity.ok(adminOrderService.filter(request));
	}
	
	@PostMapping("/filterByWaitStatus")
	public ResponseEntity<?> filterByWaitStatus(@RequestBody FilterOrderRequest request) {
		return ResponseEntity.ok(adminOrderService.filterByWaitStatus(request));
	}
	
}
