package com.soufoods.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.stereotype.Service;

import com.soufoods.entity.Order;
import com.soufoods.entity.OrderDetail;
import com.soufoods.entity.ProductDetail;
import com.soufoods.entity.User;
import com.soufoods.model.PaymentRequest;
import com.soufoods.repo.OrderDetailRepository;
import com.soufoods.repo.OrderRepository;
import com.soufoods.repo.ProductDetailRepository;
import com.soufoods.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {
	private final OrderRepository orderRepository;
	private final OrderDetailRepository orderDetailRepository;
	private final UserRepository userRepository;
	private final ProductDetailRepository productDetailRepository;
	private final JwtService jwtService;
	private final EmailService emailService;
	private final Object lock = new Object();

	public Map<String, Object> payment(PaymentRequest request) {
		Map<String, Object> map = new HashMap<>();
		if (request.getPayment().equals("COD")) {
			map = this.paymentByCOD(request);
		} else if (request.getPayment().equals("BANK")) {

		} else {
			map.put("status", "401");
			map.put("error", "Lỗi thanh toán không xác định !");
		}
		return map;
	}

	public Map<String, Object> paymentByCOD(PaymentRequest request) {
		Map<String, Object> map = new HashMap<>();
		if (this.validatedForm(request)) {
			final String username = jwtService.extractUsername(request.getToken());
			User user = userRepository.findByEmail(username).get();

			if(request.getVoucher() != null) {
				request.getVoucher().setActive(true);
			}
			Order order = orderRepository.save(new Order(null, request.getEmail(), request.getLastName(), request.getFirstName(),
					request.getAddress(),request.getPhone(), request.getNote(), false, request.getShipFee(), request.getPayment(), null, new Date(),
					"Chờ xử lý", user, request.getVoucher(), new ArrayList<>()));
			
			
			boolean checkProductDetail = true;
			for (int i = 0; i < request.getProductDetailId().size(); i++) {
				Optional<ProductDetail> productDetail = productDetailRepository
						.findById(request.getProductDetailId().get(i));
				if(productDetail.isPresent()) {
					if(productDetail.get().getProduct().getName().equals(productDetail.get().getSize())) {
						orderDetailRepository.save(new OrderDetail(null, productDetail.get().getProduct().getName(), null, productDetail.get().getPrice(), request.getQuantity().get(i), productDetail.get().getDiscount(), productDetail.get(), order));
						
						Integer quantity = productDetail.get().getQuantity() - request.getQuantity().get(i);
						productDetail.get().setQuantity(quantity);
						productDetailRepository.saveAndFlush(productDetail.get());
					} else {
						orderDetailRepository.save(new OrderDetail(null, productDetail.get().getProduct().getName(), productDetail.get().getSize(), productDetail.get().getPrice(), request.getQuantity().get(i), productDetail.get().getDiscount(), productDetail.get(), order));
						
						Integer quantity = productDetail.get().getQuantity() - request.getQuantity().get(i);
						productDetail.get().setQuantity(quantity);
						productDetailRepository.saveAndFlush(productDetail.get());
					}
				} else {
					checkProductDetail = false;
				}
			}
			
			if(checkProductDetail) {
				map.put("status", "200");
				map.put("orderId", order.getId());
				user.setPhone(request.getPhone());
				user.setAddress(request.getAddress());
				userRepository.saveAndFlush(user);
				try {
					ExecutorService executor = Executors.newSingleThreadExecutor();
					executor.execute(() -> {
						synchronized (lock) {
							emailService.orderInfo(order);
							executor.shutdown();
						}
					});
				} catch (Exception e) {
					map.put("messageType", "Gửi email không thành công.");
					map.put("status", "401");
				}
			} else {
				map.put("status", "401");
				map.put("error", "Lỗi tạo đơn hàng! Vui lòng tải lại trang");
				orderRepository.delete(order);
			}
		} else {
			map.put("status", "401");
			map.put("error", "Vui lòng nhập đầy đủ thông tin đơn hàng !");
		}
		return map;
	}

	private boolean validatedForm(PaymentRequest request) {
		boolean check = true;
		if (request.getToken() == null || request.getToken().isEmpty()) {
			check = false;
		} else {
			final String username = jwtService.extractUsername(request.getToken());
			Optional<User> user = userRepository.findByEmail(username);
			if (!user.isPresent()) {
				check = false;
			}
		}

		if (request.getLastName() == null || request.getLastName().isEmpty()) {
			check = false;
		}

		if (request.getFirstName() == null || request.getFirstName().isEmpty()) {
			check = false;
		}

		if (request.getEmail() == null || request.getEmail().isEmpty()) {
			check = false;
		}

		if (request.getPhone() == null || request.getPhone().isEmpty()) {
			check = false;
		}

		if (request.getAddress() == null || request.getAddress().isEmpty()) {
			check = false;
		}

		if (request.getPayment() == null || request.getPayment().isEmpty()) {
			check = false;
		}

		if (request.getShipFee() == null) {
			check = false;
		}

		if (request.getProductDetailId() == null || request.getQuantity() == null) {
			check = false;
		}
		
		return check;
	}
}
