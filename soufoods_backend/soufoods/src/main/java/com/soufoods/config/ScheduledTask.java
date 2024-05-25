package com.soufoods.config;

import java.util.Date;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.soufoods.entity.ForgotPassword;
import com.soufoods.entity.Voucher;
import com.soufoods.repo.ForgotPasswordRepository;
import com.soufoods.repo.VoucherRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ScheduledTask {
	private final VoucherRepository voucherRepository;
	private final ForgotPasswordRepository forgotPasswordRepository;

	@Scheduled(fixedRate = 1000 * 60 * 24)
	private void deleteExpirationVoucher() {
		List<Voucher> vouchers = voucherRepository.findAllByExpiration();
		if (!vouchers.isEmpty()) {
			voucherRepository.deleteAll(vouchers);
		}
	}

	@Scheduled(fixedRate = 1000 * 60 * 24)
	private void deleteExpirationForgotPassword() {
		List<ForgotPassword> listForgotPassword = forgotPasswordRepository.findAllByExpired(new Date());
		if (!listForgotPassword.isEmpty()) {
			forgotPasswordRepository.deleteAll(listForgotPassword);
		}
	}
}
