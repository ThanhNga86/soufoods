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

import com.soufoods.entity.Voucher;
import com.soufoods.model.FilterVoucherRequest;
import com.soufoods.service.AdminVoucherService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
public class AdminVoucherController {
	private final AdminVoucherService voucherService;

	@GetMapping("/discountCode/{discountCode}")
	public ResponseEntity<?> voucher(@PathVariable("discountCode") String discountCode) {
		Map<String, Object> map = voucherService.findByDiscountCode(discountCode);
		return ResponseEntity.ok(map);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<?> voucher(@PathVariable("id") Long id) {
		Map<String, Object> map = voucherService.findById(id);
		return ResponseEntity.ok(map);
	}
	
	@GetMapping("")
	public ResponseEntity<?> vouchers(@RequestParam("pageNumber") Optional<Integer> pageNumber, @RequestParam("sizePage") Optional<Integer> sizePage) {
		return ResponseEntity.ok(voucherService.findAll(pageNumber, sizePage));
	}
	
	@PostMapping("/filter")
	public ResponseEntity<?> filterCategory(@RequestBody FilterVoucherRequest request) {
		return ResponseEntity.ok(voucherService.filterVoucher(request));
	}
	
	@PostMapping("")
	public ResponseEntity<?> addVoucher(Voucher voucher, @RequestParam("messageType") String messageType, @RequestParam("sendEmailType") boolean sendEmailType) {
		Map<String, Object> map = voucherService.addVoucher(voucher, messageType, sendEmailType);
		return ResponseEntity.ok(map);
	}
	
	@PutMapping("")
	public ResponseEntity<?> updateVoucher(Voucher voucher) {
		Map<String, Object> map = voucherService.updateVoucher(voucher);
		return ResponseEntity.ok(map);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteVoucher(@PathVariable("id") Optional<Long> id) {
		Map<String, Object> map = voucherService.deleteVoucher(id);
		return ResponseEntity.ok(map);
	}
}
