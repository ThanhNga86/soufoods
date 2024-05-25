package com.soufoods.service;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.soufoods.entity.User;
import com.soufoods.entity.Voucher;
import com.soufoods.model.AdminVoucherResponse;
import com.soufoods.model.FilterVoucherRequest;
import com.soufoods.model.VoucherAddedResponse;
import com.soufoods.repo.UserRepository;
import com.soufoods.repo.VoucherRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminVoucherService {
	private final VoucherRepository voucherRepository;
	private final UserRepository userRepository;
	private final EmailService emailService;
	private final Object lock = new Object();

	public Map<String, Object> findById(Long id) {
		Map<String, Object> map = new HashMap<>();
		Optional<Voucher> voucher = voucherRepository.findById(id);
		if (voucher.isPresent()) {
			Calendar currentCalendar = Calendar.getInstance();
			currentCalendar.setTime(voucher.get().getExpiration());
			currentCalendar.add(Calendar.MINUTE, 1);
			voucher.get().setExpiration(new java.sql.Date(currentCalendar.getTimeInMillis()));
			map.put("voucher", voucher.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, Object> findByDiscountCode(String discountCode) {
		Map<String, Object> map = new HashMap<>();
		Optional<Voucher> voucher = voucherRepository.findByDiscountCode(discountCode);
		if (voucher.isPresent()) {
			map.put("voucher", voucher.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public AdminVoucherResponse findAll(Optional<Integer> pageNumber, Optional<Integer> sizePage1) {
		int sizePage = sizePage1.orElse(10);
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage, Sort.by("id").reverse());
		Page<Voucher> vouchers = voucherRepository.findAll(page);
		long total = vouchers.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminVoucherResponse.builder().total(total).totalPage(totalPage).vouchers(vouchers.toList()).build();
	}

	public AdminVoucherResponse filterVoucher(FilterVoucherRequest request) {
		SimpleDateFormat simpDate = new SimpleDateFormat("yyyy-MM-dd");
		Date expirationDate = request.getExpirationDate() != null
				? java.sql.Date.valueOf(simpDate.format(request.getExpirationDate()))
				: null;
		int sizePage = 10;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		if (request.getSearch() == null) {
			Page<Voucher> vouchers = voucherRepository.filterVoucher(null, null, request.getActive(),
					request.getFreeShip(), request.getExpiration(), expirationDate, page);
			long total = vouchers.getTotalElements();
			int totalPage = (int) (total / sizePage);
			if (total % sizePage != 0) {
				totalPage++;
			}
			return AdminVoucherResponse.builder().total(total).totalPage(totalPage).vouchers(vouchers.toList()).build();
		} else {
			List<Voucher> listVoucher = null;
			Long total = 0l;
			int totalPage = 0;
			try {
				Long id = Long.parseLong(request.getSearch());
				Page<Voucher> vouchers = voucherRepository.filterVoucher(id, null, request.getActive(),
						request.getFreeShip(), request.getExpiration(), expirationDate, page);
				total = vouchers.getTotalElements();
				totalPage = (int) (total / sizePage);
				if (total % sizePage != 0) {
					totalPage++;
				}
				listVoucher = vouchers.toList();
			} catch (NumberFormatException e) {
				Page<Voucher> vouchers = voucherRepository.filterVoucher(null, request.getSearch(), request.getActive(),
						request.getFreeShip(), request.getExpiration(), expirationDate, page);
				total = vouchers.getTotalElements();
				totalPage = (int) (total / sizePage);
				if (total % sizePage != 0) {
					totalPage++;
				}
				listVoucher = vouchers.toList();
			}
			return AdminVoucherResponse.builder().total(total).totalPage(totalPage).vouchers(listVoucher).build();
		}
	}

	public String createDiscountCode() {
		String rdCode = "QWERTYUIOPAS1234567890DFGHJKLZXCVBNM";
		String discountCode = null;
		do {
			discountCode = "";
			for (int i = 0; i < 10; i++) {
				discountCode += rdCode.charAt(new Random().nextInt(rdCode.length()));
			}

			Optional<Voucher> voucher = voucherRepository.findByDiscountCode(discountCode);
			if (!voucher.isPresent()) {
				break;
			}
		} while (true);
		return discountCode;
	}

	public Map<String, Object> addVoucher(Voucher voucher, String messageType, boolean sendEmailType) {
		Map<String, Object> map = new HashMap<>();
		boolean check = true;

		Calendar calendar = Calendar.getInstance();
		calendar.set(2000, 0, 1);
		if (voucher.getExpiration().before(calendar.getTime())) {
			map.put("expiration", "Vui lòng nhập thời hạn giảm giá");
			check = false;
		} else {
			if (voucher.getExpiration().before(new Date())) {
				map.put("expiration", "Thời hạn giảm giá phải sau ngày hiện tại");
				check = false;
			}
		}

		if (voucher.getDiscount() == null) {
			map.put("discount", "Vui lòng nhập giá trị giảm giá");
			check = false;
		} else if (voucher.getDiscount() < 0) {
			map.put("discount", "Giá trị giảm giá phải lớn hơn hoặc bằng 0");
			check = false;
		}

		if (voucher.getPriceMin() == null) {
			map.put("priceMin", "Vui lòng nhập giá trị tối thiểu");
			check = false;
		} else if (voucher.getPriceMin() < 0) {
			map.put("priceMin", "Giá trị tối thiểu phải lớn hơn hoặc bằng 0");
			check = false;
		}

		if (sendEmailType) { // gửi cho tất cả người dùng
			if (check) {
				ExecutorService executor = Executors.newSingleThreadExecutor();
				List<User> users = userRepository.findAll();
				map.put("time", users.size() * 9);
				map.put("status", "200");
				
				executor.execute(() -> {
					synchronized (lock) {
						for (int i = 0; i < users.size(); i++) {
							String discountCode = this.createDiscountCode();
							voucher.setId(null);
							voucher.setDiscountCode(discountCode);
							voucher.setUser(users.get(i));
							voucherRepository.save(voucher);
							
							if (i == users.size() - 1) {
								executor.shutdown();
							}
						}
					}
				});
			} else {
				map.put("status", "401");
			}
		} else { // gửi từng người dùng
			if (voucher.getUser() == null) {
				map.put("email", "Vui lòng thêm địa chỉ email");
				check = false;
			}

			if (check) {
				String discountCode = this.createDiscountCode();
				voucher.setDiscountCode(discountCode);
				voucherRepository.save(voucher);
				map.put("status", "200");

				if (messageType.equals("email")) {
					try {
						ExecutorService executor = Executors.newSingleThreadExecutor();
						executor.execute(() -> {
							synchronized (lock) {
								emailService.sendVoucher(new VoucherAddedResponse(voucher.getId(),
										voucher.getDiscountCode(), voucher.getDiscount(), voucher.getPriceMin(),
										voucher.getExpiration(), voucher.isFreeShip(), voucher.isDiscountType(),
										voucher.isActive(), voucher.getUser().getEmail()));
								executor.shutdown();
							}
						});
					} catch (Exception e) {
						map.put("messageType", "Gửi email không thành công.");
						map.put("status", "401");
					}
				}
			} else {
				map.put("status", "401");
			}
		}
		return map;
	}

	public Map<String, Object> updateVoucher(Voucher voucher) {
		boolean check = true;
		Map<String, Object> map = new HashMap<>();

		Optional<Voucher> voucherId = voucherRepository.findById(voucher.getId());
		if (!voucherId.isPresent()) {
			map.put("error", "Không tìm thấy id");
			check = false;
		}

		if (!voucherId.get().isActive()) {
			if (voucherId.get().getMessageType().equals("local")) {
				Calendar calendar = Calendar.getInstance();
				calendar.set(2000, 0, 1);
				if (voucher.getExpiration().before(calendar.getTime())) {
					map.put("expiration", "Vui lòng nhập thời hạn giảm giá");
					check = false;
				} else {
					if (voucher.getExpiration().before(new Date())) {
						map.put("expiration", "Thời hạn giảm giá phải sau ngày hiện tại");
						check = false;
					}
				}

				if (voucher.getDiscount() == null) {
					map.put("discount", "Vui lòng nhập giá trị giảm giá");
					check = false;
				} else if (voucher.getDiscount() < 0) {
					map.put("discount", "Giá trị giảm giá phải lớn hơn hoặc bằng 0");
					check = false;
				}

				if (voucher.getPriceMin() == null) {
					map.put("priceMin", "Vui lòng nhập giá trị tối thiểu");
					check = false;
				} else if (voucher.getPriceMin() < 0) {
					map.put("priceMin", "Giá trị tối thiểu phải lớn hơn hoặc bằng 0");
					check = false;
				}
			}
		} else {
			map.put("error", "Không thể cập nhật mã giảm giá này");
			check = false;
		}

		if (check) {
			if (voucherId.get().getMessageType().equals("local")) {
				voucherId.get().setExpiration(voucher.getExpiration());
				voucherId.get().setDiscount(voucher.getDiscount());
				voucherId.get().setDiscountType(voucher.isDiscountType());
				voucherId.get().setPriceMin(voucher.getPriceMin());
				voucherId.get().setFreeShip(voucher.isFreeShip());
				voucherId.get().setMessageType(voucher.getMessageType());
			}
			voucherId.get().setActive(voucher.isActive());
			voucherRepository.saveAndFlush(voucherId.get());

			if (voucher.getMessageType().equals("email")) {
				try {
					ExecutorService executor = Executors.newSingleThreadExecutor();
					executor.execute(() -> {
						synchronized (lock) {
							emailService.sendVoucher(new VoucherAddedResponse(voucherId.get().getId(),
									voucherId.get().getDiscountCode(), voucherId.get().getDiscount(),
									voucherId.get().getPriceMin(), voucherId.get().getExpiration(),
									voucherId.get().isFreeShip(), voucherId.get().isDiscountType(),
									voucherId.get().isActive(), voucherId.get().getUser().getEmail()));
							executor.shutdown();
						}
					});
				} catch (Exception e) {
					map.put("messageType", "Gửi email không thành công.");
					map.put("status", "401");
				}
			}
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, Object> deleteVoucher(Optional<Long> voucherId) {
		Map<String, Object> map = new HashMap<>();
		Optional<Voucher> voucher = voucherRepository.findById(voucherId.get());
		if (voucher.isPresent()) {
			if (voucher.get().getMessageType().equals("local")) {
				if (!voucher.get().isActive()) {
					try {
						voucherRepository.delete(voucher.get());
						map.put("status", "200");
					} catch (Exception e) {
						map.put("status", "401");
						map.put("error", "Không thể xóa mã giảm giá này");
					}
				} else {
					map.put("status", "401");
					map.put("error", "Không thể xóa mã giảm giá này");
				}
			} else {
				map.put("status", "401");
				map.put("error", "Chỉ xóa được loại mã thông báo local");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy mã giảm giá này.");
		}
		return map;
	}
}
