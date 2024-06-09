package com.soufoods.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.model.PaymentRequest;
import com.soufoods.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {
	private final PaymentService paymentService;

	@PostMapping("")
	public ResponseEntity<?> payment(PaymentRequest request) {
		return ResponseEntity.ok(paymentService.payment(request));
	}
}
