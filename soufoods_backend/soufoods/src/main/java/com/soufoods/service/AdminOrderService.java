package com.soufoods.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.soufoods.entity.Order;
import com.soufoods.model.AdminOrderResponse;
import com.soufoods.model.FilterOrderRequest;
import com.soufoods.repo.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminOrderService {
	private final OrderRepository orderRepository;
	
	public Map<String, Object> orderCancel(Long orderId) {
		Map<String, Object> map = new HashMap<>();
		Optional<Order> order = orderRepository.findById(orderId);
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
		return map;
	}

	public AdminOrderResponse findAllByApply(Optional<Integer> pageNumber, Optional<Integer> sizePage1) {
		int sizePage = sizePage1.orElse(10);
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		Page<Order> orders = orderRepository.findAllByApply(page);
		long total = orders.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminOrderResponse.builder().total(total).totalPage(totalPage).orders(orders.toList()).build();
	}
	
	public AdminOrderResponse findAll(Optional<Integer> pageNumber, Optional<Integer> sizePage1) {
		int sizePage = sizePage1.orElse(10);
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		Page<Order> orders = orderRepository.findAll(page);
		long total = orders.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminOrderResponse.builder().total(total).totalPage(totalPage).orders(orders.toList()).build();
	}

	public AdminOrderResponse filter(FilterOrderRequest request) {
		int sizePage = 10;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		Page<Order> orders = null;
		
		if (request.getSearch() == null) {
			orders = orderRepository.filter(null, null, request.getOrderDate(), request.getStatus(), page);
		} else {
			try {
				Long id = Long.parseLong(request.getSearch());
				orders = orderRepository.filter(id, null, request.getOrderDate(), request.getStatus(), page);
			} catch (NumberFormatException e) {
				orders = orderRepository.filter(null, request.getSearch(), request.getOrderDate(), request.getStatus(),
						page);
			}
		}

		long total = orders.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminOrderResponse.builder().total(total).totalPage(totalPage).orders(orders.toList()).build();
	}
	
	public AdminOrderResponse filterByWaitStatus(FilterOrderRequest request) {
		int sizePage = 10;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		Page<Order> orders = null;
		
		if (request.getSearch() == null) {
			orders = orderRepository.filterByWaitStatus(null, null, request.getOrderDate(), request.getStatus(), page);
		} else {
			try {
				Long id = Long.parseLong(request.getSearch());
				orders = orderRepository.filterByWaitStatus(id, null, request.getOrderDate(), request.getStatus(), page);
			} catch (NumberFormatException e) {
				orders = orderRepository.filterByWaitStatus(null, request.getSearch(), request.getOrderDate(), request.getStatus(),
						page);
			}
		}
		
		long total = orders.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminOrderResponse.builder().total(total).totalPage(totalPage).orders(orders.toList()).build();
	}
}
