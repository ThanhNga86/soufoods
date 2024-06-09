package com.soufoods.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Order;
import com.soufoods.entity.OrderDetail;
import com.soufoods.entity.User;
import com.soufoods.model.OrderResponse;
import com.soufoods.repo.OrderDetailRepository;
import com.soufoods.repo.OrderRepository;
import com.soufoods.repo.UserRepository;
import com.soufoods.service.AwsS3Service;
import com.soufoods.service.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
	private final OrderRepository orderRepository;
	private final OrderDetailRepository orderDetailRepository;
	private final UserRepository userRepository;
	private final AwsS3Service awsS3Service;
	private final JwtService jwtService;

	@GetMapping("/all")
	public ResponseEntity<?> findAllByUser(@RequestParam("token") Optional<String> token) {
		final String username = jwtService.extractUsername(token.orElse(""));
		Optional<User> user = userRepository.findByEmail(username);
		List<Order> orders = orderRepository.findAllByStatus(user.orElse(null));
		return ResponseEntity.ok(orders);
	}
	
	@PostMapping("")
	public ResponseEntity<?> findAllByStatus(@RequestParam("status") Optional<String> status,
			@RequestParam("token") Optional<String> token, @RequestParam("pageNumber") Optional<Integer> pageNumber) {
		int sizePage = 10;
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		final String username = jwtService.extractUsername(token.orElse(""));
		Optional<User> user = userRepository.findByEmail(username);
		Page<Order> orders = orderRepository.findAllByStatus(status.orElse(null), user.orElse(null), page);
		long total = orders.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return ResponseEntity
				.ok(OrderResponse.builder().total(total).totalPage(totalPage).orders(orders.toList()).build());
	}

	@GetMapping("/findAllByOrder/{id}")
	public ResponseEntity<?> findAllByOrder(@PathVariable("id") Long orderId) {
		List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrder(orderId);
		for (OrderDetail orderDetail : orderDetails) {
			orderDetail.getProductDetail().getProduct()
					.setImageUrl(awsS3Service.getFileS3(orderDetail.getProductDetail().getProduct().getImage()));
		}
		return ResponseEntity.ok(orderDetails);
	}
	
	@GetMapping("/cancel/{id}")
	public ResponseEntity<?> ordersByApply(@PathVariable("id") Long id) {
		Map<String, Object> map = new HashMap<>();
		Optional<Order> order = orderRepository.findById(id);
		if(order.isPresent()) {
			if(order.get().getStatus().equals("Chờ xử lý")) {
				order.get().setStatus("Đã hủy");
				orderRepository.save(order.get());
				map.put("status", "200");
			} else {
				map.put("status", "401");
				map.put("error", "Đơn hàng này đã được duyệt.");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy đơn hàng này.");
		}
		return ResponseEntity.ok(map);
	}
}
