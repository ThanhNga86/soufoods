package com.soufoods.controller;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.service.AdminStaticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/statics")
@RequiredArgsConstructor
public class AdminStaticsController {
	private final AdminStaticsService adminStaticsService;

	// Thống kê chỉ số
	@GetMapping("/users")
	public ResponseEntity<?> staticsByUser() {
		return ResponseEntity.ok(adminStaticsService.staticsByUser());
	}

	@GetMapping("/categories")
	public ResponseEntity<?> staticsByCategory() {
		return ResponseEntity.ok(adminStaticsService.staticsByCategory());
	}

	@GetMapping("/products")
	public ResponseEntity<?> staticsByProduct() {
		return ResponseEntity.ok(adminStaticsService.staticsByProduct());
	}

	@GetMapping("/vouchers")
	public ResponseEntity<?> staticsByVoucher() {
		return ResponseEntity.ok(adminStaticsService.staticsByVoucher());
	}

	@GetMapping("/orders")
	public ResponseEntity<?> staticsByOrder() {
		return ResponseEntity.ok(adminStaticsService.staticsByOrder());
	}

	@GetMapping("/reviews")
	public ResponseEntity<?> staticsByReview() {
		return ResponseEntity.ok(adminStaticsService.staticsByReview());
	}

	// Thống kê doanh thu
	@GetMapping("/yesterday")
	public ResponseEntity<?> staticsByYesterday() {
		return ResponseEntity.ok(adminStaticsService.staticsByYesterday());
	}

	@GetMapping("/today")
	public ResponseEntity<?> staticsByToday() {
		return ResponseEntity.ok(adminStaticsService.staticsByToday());
	}

	@GetMapping("/week")
	public ResponseEntity<?> staticsByWeek() {
		return ResponseEntity.ok(adminStaticsService.staticsByWeek());
	}

	@GetMapping("/month")
	public ResponseEntity<?> staticsByMonth() {
		return ResponseEntity.ok(adminStaticsService.staticsByMonth());
	}

	@GetMapping("/total")
	public ResponseEntity<?> staticsByTotal(@RequestParam("fromDate") String fromDate,
			@RequestParam("toDate") String toDate) {
		return ResponseEntity.ok(adminStaticsService.staticsByTotal(fromDate, toDate));
	}
	
	// Thống kê sản phẩm chạy bán và người mua nhiều nhất
	@GetMapping("/sellingProducts")
	public ResponseEntity<?> staticsBySellingProducts(@RequestParam("pageNumber") Optional<Integer> pageNumber) {
		return ResponseEntity.ok(adminStaticsService.staticsBySellingProducts(pageNumber));
	}
	
	@GetMapping("/biggestBuyer")
	public ResponseEntity<?> staticsByBiggestBuyer(@RequestParam("pageNumber") Optional<Integer> pageNumber) {
		return ResponseEntity.ok(adminStaticsService.staticsByBiggestBuyer(pageNumber));
	}
}
