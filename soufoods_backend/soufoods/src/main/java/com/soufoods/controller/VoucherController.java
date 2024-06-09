package com.soufoods.controller;

import java.text.NumberFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.User;
import com.soufoods.entity.Voucher;
import com.soufoods.model.VoucherRequest;
import com.soufoods.model.VoucherResponse;
import com.soufoods.repo.UserRepository;
import com.soufoods.repo.VoucherRepository;
import com.soufoods.service.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/voucher")
public class VoucherController {
	private final VoucherRepository voucherRepository;
	private final JwtService jwtService;
	private final UserRepository userRepository;

	@GetMapping("")
	public ResponseEntity<?> findAll(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("email") String email) {
		int sizePage = 6;
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		Page<Voucher> vouchers = voucherRepository.findAllByUser(email, page);
		long total = vouchers.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return ResponseEntity
				.ok(VoucherResponse.builder().total(total).totalPage(totalPage).vouchers(vouchers.toList()).build());
	}

	@PostMapping("")
	public ResponseEntity<?> applyVoucher(@RequestBody VoucherRequest request) {
		Map<String, Object> map = new HashMap<>();
		NumberFormat numb = NumberFormat.getInstance(new Locale("vi", "VN"));
		boolean check = true;
		Optional<Voucher> voucher = voucherRepository.findByDiscountCode(request.getDiscountCode());

		if (request.getDiscountCode() == null || request.getDiscountCode().isEmpty()) {
			map.put("error", "Vui lòng nhập mã giảm giá");
			check = false;
		} else {
			final String username = jwtService.extractUsername(request.getToken());
			Optional<User> user = userRepository.findByEmail(username);
			if (user.isPresent()) {
				if (voucher.isPresent()) {
					if (voucher.get().getUser().getEmail().equals(user.get().getEmail())) {
						Date currentDate = new Date();
						Date now = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));
						if (voucher.get().isActive() == true) {
							map.put("error", "Mã giảm giá này đã được sử dụng");
							check = false;
						} else if (voucher.get().getExpiration().before(now)) {
							map.put("error", "Mã giảm giá này đã hết hạn");
							check = false;
						} else if (voucher.get().getPriceMin() > request.getProvisional()) {
							map.put("error", "Mã giảm giá này chỉ áp dụng cho đơn hàng trên "
									+ numb.format(voucher.get().getPriceMin()) + " đ");
							check = false;
						}
					} else {
						map.put("error",
								"Mã giảm giá này chỉ áp dụng cho khách hàng " + voucher.get().getUser().getEmail());
						check = false;
					}
				} else {
					map.put("error", "Không tìm thấy mã giảm giá này");
					check = false;
				}
			} else {
				map.put("error", "Vui lòng đăng nhập để sử dụng mã giảm giá");
				check = false;
			}
		}

		if (check) {
			map.put("status", "200");
			map.put("voucher", voucher.get());
		} else {
			map.put("status", "401");
		}
		return ResponseEntity.ok(map);
	}
}
