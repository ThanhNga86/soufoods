package com.soufoods.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.OrderDetail;
import com.soufoods.repo.OrderDetailRepository;
import com.soufoods.service.AwsS3Service;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/orderDetails")
@RequiredArgsConstructor
public class AdminOrderDetailController {
	private final OrderDetailRepository orderDetailRepository;
	private final AwsS3Service awsS3Service;

	@GetMapping("/findAllByOrder/{id}")
	public ResponseEntity<?> findAllByOrder(@PathVariable("id") Long orderId) {
		List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrder(orderId);
		for (OrderDetail orderDetail : orderDetails) {
			orderDetail.getProductDetail().getProduct().setImageUrl(awsS3Service.getFileS3(orderDetail.getProductDetail().getProduct().getImage()));
		}
		return ResponseEntity.ok(orderDetails);
	}
}
