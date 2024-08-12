package com.soufoods.config;

import java.util.Date;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.soufoods.entity.ForgotPassword;
import com.soufoods.entity.Order;
import com.soufoods.entity.Voucher;
import com.soufoods.repo.ForgotPasswordRepository;
import com.soufoods.repo.OrderRepository;
import com.soufoods.repo.VoucherRepository;
import com.soufoods.service.ShipService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ScheduledTask {
	private final VoucherRepository voucherRepository;
	private final ForgotPasswordRepository forgotPasswordRepository;
	private final OrderRepository orderRepository;
	private final ShipService shipService;
	private final Object lock = new Object();

	@Scheduled(fixedRate = 5000)
	private void handleUpdateOrderStatus() {
		try {
			ExecutorService executor = Executors.newSingleThreadExecutor();
			executor.execute(() -> {
				synchronized (lock) {
					List<Order> orders = orderRepository.findAllByUpdateStatus();
					if (!orders.isEmpty()) {
						for (Order order : orderRepository.findAll()) {
							shipService.updateOrderStatus(order);
						}
					}
					executor.shutdown();
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Scheduled(fixedRate = 1000 * 60 * 24)
	private void deleteExpirationVoucher() {
		try {
			ExecutorService executor = Executors.newSingleThreadExecutor();
			executor.execute(() -> {
				synchronized (lock) {
					List<Voucher> vouchers = voucherRepository.findAllByExpiration();
					if (!vouchers.isEmpty()) {
						voucherRepository.deleteAll(vouchers);
					}
					executor.shutdown();
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Scheduled(fixedRate = 1000 * 60 * 24)
	private void deleteExpirationForgotPassword() {
		try {
			ExecutorService executor = Executors.newSingleThreadExecutor();
			executor.execute(() -> {
				synchronized (lock) {
					List<ForgotPassword> listForgotPassword = forgotPasswordRepository.findAllByExpired(new Date());
					if (!listForgotPassword.isEmpty()) {
						forgotPasswordRepository.deleteAll(listForgotPassword);
					}
					executor.shutdown();
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
