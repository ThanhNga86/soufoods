package com.soufoods.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.service.ShipService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shipment")
@RequiredArgsConstructor
public class ShipController {
	private final ShipService shipService;

	@GetMapping("/fee")
	public ResponseEntity<?> shipFee(@RequestParam("address") String address, @RequestParam("province") String province,
			@RequestParam("district") String district, @RequestParam("ward") String ward,
			@RequestParam("weight") Integer weight, @RequestParam("value") Integer value) {
		return ResponseEntity.ok(shipService.shipFee(address, province, district, ward, weight, value));
	}
	
	@GetMapping("/apply-order/{id}")
	public ResponseEntity<?> orderApply(@PathVariable("id") Long orderId) {
		return ResponseEntity.ok(shipService.orderApply(orderId));
	}
	
	@GetMapping("/cancel-order/{id}")
	public ResponseEntity<?> orderCancel(@PathVariable("id") Long orderId) {
		return ResponseEntity.ok(shipService.orderCancel(orderId));
	}
}
