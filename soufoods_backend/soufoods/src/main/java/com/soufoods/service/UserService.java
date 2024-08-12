package com.soufoods.service;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.soufoods.entity.Account;
import com.soufoods.entity.ForgotPassword;
import com.soufoods.entity.Role;
import com.soufoods.entity.User;
import com.soufoods.entity.Voucher;
import com.soufoods.model.AuthenticationRequest;
import com.soufoods.model.AuthenticationResponse;
import com.soufoods.model.ChangePasswordRequest;
import com.soufoods.model.ForgotPasswordRequest;
import com.soufoods.model.UpdateInfoRequest;
import com.soufoods.repo.ForgotPasswordRepository;
import com.soufoods.repo.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final UserDetailsService userDetailsService;
	private final EmailService emailService;
	private final ForgotPasswordRepository forgotPasswordRepository;
	private final AdminVoucherService adminVoucherService;
	private final AuthenticationManager authenticationManager;
	private final BCryptPasswordEncoder passwordEncoder;
	private final Object lock = new Object();

	public Map<String, Object> findByEmail(String email) {
		Map<String, Object> map = new HashMap<>();
		Optional<User> user = userRepository.findByEmail(email);
		if (user.isPresent()) {
			map.put("status", "200");
			map.put("user", user.get());
		} else {
			map.put("status", "401");
		}
		return map;
	}

	// login with local
	public AuthenticationResponse login(AuthenticationRequest request) {
		authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword()));
		var user = userRepository.findByEmail(request.getEmail().trim()).orElseThrow();
		var token = jwtService.generateToken(user);
		var refreshToken = jwtService.generateRefreshToken(user);
		return AuthenticationResponse.builder().token(token).refreshToken(refreshToken).build();
	}

	// login with OAhtu2
	public AuthenticationResponse loginWithOAhtu2(AuthenticationRequest request) {
		User user = null;
		Optional<User> userId = userRepository.findByEmail(request.getEmail().trim());
		if (!userId.isPresent()) {
			user = new User();
			if (request.getProvider().equals("GOOGLE")) {
				user.setAccount(Account.Google);
			} else if (request.getProvider().equals("FACEBOOK")) {
				user.setAccount(Account.Facebook);
			}
			user.setEmail(request.getEmail());
			user.setFirstName(request.getFirstName());
			user.setLastName(request.getLastName());
			user.setCreateDate(new Date());
			user.setRole(Role.ROLE_USER);
			user.setActive(true);
			user = userRepository.save(user);
		} else {
			user = userId.get();
		}
		var token = jwtService.generateToken(user);
		var refreshToken = jwtService.generateRefreshToken(user);
		return AuthenticationResponse.builder().token(token).refreshToken(refreshToken).build();
	}

	// refreshToken
	public AuthenticationResponse refreshToken(HttpServletRequest request) {
		final String authHeader = request.getHeader("Authorization");
		final String refreshToken;
		final String token;
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			refreshToken = authHeader.substring(7);
			if (!jwtService.isValidExpired(refreshToken)) {
				String userEmail = jwtService.extractUsername(refreshToken);
				UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
				if (jwtService.isValidToken(refreshToken, userDetails)) {
					token = jwtService.generateToken(userDetails);
					return AuthenticationResponse.builder().token(token).refreshToken(refreshToken).build();
				}
			}
		}
		return null;
	}

	// register
	public Map<String, String> register(User user) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();
		Optional<User> checkUser = userRepository.findByEmail(user.getEmail().trim());

		if (user.getEmail() == null || user.getEmail().isEmpty()) {
			map.put("email", "Vui lòng nhập email");
			check = false;
		} else {
			Pattern p = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
			if (!p.matcher(user.getEmail()).find()) {
				map.put("email", "Email không hợp lệ");
				check = false;
			} else {
				if (checkUser.isPresent()) {
					map.put("email", "Email đã tồn tại. Vui lòng nhập email khác");
					check = false;
				}
			}
		}

		if (user.getPassword() == null || user.getPassword().isEmpty()) {
			map.put("password", "Vui lòng nhập mật khẩu");
			check = false;
		}

		if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
			map.put("firstName", "Vui lòng nhập tên đệm & tên");
			check = false;
		}

		if (user.getLastName() == null || user.getLastName().isEmpty()) {
			map.put("lastName", "Vui lòng nhập họ");
			check = false;
		}

		if (check) {
			map.put("status", "200");
			user.setEmail(user.getEmail().trim());
			user.setActive(true);
			user.setPassword(passwordEncoder.encode(user.getPassword()));
			user.setRole(Role.ROLE_USER);
			user.setAccount(Account.Local);
			user.setCreateDate(new Date());
			userRepository.save(user);

			String discountCode = adminVoucherService.createDiscountCode();
			Calendar calendar = Calendar.getInstance();
			calendar.add(Calendar.MONTH, 1);
			Date expiration = calendar.getTime();
			Voucher voucher = new Voucher(null, discountCode, 5, 890000.0, expiration, true, false, false, "email",
					user, null);
			adminVoucherService.addVoucher(voucher, "email", false);
		} else {
			map.put("status", "401");
		}
		return map;
	}

	// update pick address
	public Map<String, String> updatePickAddress(String token, String address) {
		Map<String, String> map = new HashMap<>();
		boolean check = true;
		Optional<User> user = null;

		if (token == null || token.isEmpty()) {
			check = false;
		} else {
			final String username = jwtService.extractUsername(token);
			user = userRepository.findByEmail(username);
			if (!user.isPresent()) {
				check = false;
			}
		}

		if (address == null || address.isEmpty()) {
			check = false;
		}

		if (check) {
			map.put("status", "200");
			user.get().setAddress(address);
			userRepository.saveAndFlush(user.get());
		} else {
			map.put("status", "401");
		}

		return map;
	}

	// update info
	public Map<String, String> updateInfo(UpdateInfoRequest request) {
		Map<String, String> map = new HashMap<>();
		boolean check = true;
		final String username = jwtService.extractUsername(request.getToken());
		Optional<User> user = userRepository.findByEmail(username);

		if (!user.isPresent() && jwtService.isValidExpired(request.getToken())) {
			map.put("email", "Email không tồn tại");
			check = false;
		}

		if (request.getFirstName() == null || request.getFirstName().isEmpty()) {
			map.put("firstName", "Vui lòng nhập tên đệm & tên");
			check = false;
		}

		if (request.getLastName() == null || request.getLastName().isEmpty()) {
			map.put("lastName", "Vui lòng nhập họ");
			check = false;
		}

		if (request.getPhone() == null || request.getPhone().isEmpty()) {
			map.put("phone", "Vui lòng nhập số điện thoại");
			check = false;
		} else {
			try {
				Long.parseLong(request.getPhone());
			} catch (NumberFormatException e) {
				map.put("phone", "Vui lòng không nhập bằng chữ hoặc ký tự đặc biệt");
				check = false;
			}
		}

		if (request.getAddress() == null || request.getAddress().isEmpty()) {
			map.put("address", "Vui lòng nhập địa chỉ");
			check = false;
		}

		if (check) {
			map.put("status", "200");
			user.get().setFirstName(request.getFirstName());
			user.get().setLastName(request.getLastName());
			user.get().setPhone(request.getPhone());
			user.get().setAddress(request.getAddress());
			userRepository.saveAndFlush(user.get());
		} else {
			map.put("status", "401");
		}
		return map;
	}

	// change password
	public Map<String, String> changePassword(ChangePasswordRequest request) {
		Map<String, String> map = new HashMap<>();
		boolean check = true;
		final String username = jwtService.extractUsername(request.getToken());
		Optional<User> user = userRepository.findByEmail(username);

		if (user.isPresent() && !jwtService.isValidExpired(request.getToken())) {
			if (request.getPasswordOld() == null || request.getPasswordOld().isEmpty()) {
				map.put("passwordOld", "Vui lòng nhập mật khẩu cũ");
				check = false;
			} else {
				if (!passwordEncoder.matches(request.getPasswordOld(), user.get().getPassword())) {
					map.put("passwordOld", "Mật khẩu chưa chính xác");
					check = false;
				}
			}

			if (request.getPasswordNew() == null || request.getPasswordNew().isEmpty()) {
				map.put("passwordNew", "Vui lòng nhập mật khẩu mới");
				check = false;
			}

			if (request.getPasswordNewCf() == null || request.getPasswordNewCf().isEmpty()) {
				map.put("passwordNewCf", "Vui lòng nhập xác nhận mật khẩu mới");
				check = false;
			} else {
				if (!request.getPasswordNew().equals(request.getPasswordNewCf())) {
					map.put("passwordNewCf", "Mật khẩu chưa khớp");
					check = false;
				}
			}
		} else {
			check = false;
		}

		if (check) {
			map.put("status", "200");
			user.get().setPassword(passwordEncoder.encode(request.getPasswordNewCf()));
			userRepository.saveAndFlush(user.get());
		} else {
			map.put("status", "401");
		}

		return map;
	}

	// forgot password
	public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
		Map<String, Object> map = new HashMap<>();
		boolean check = true;
		Optional<User> checkUser = userRepository.findByEmail(request.getEmail());

		if (request.getEmail() == null || request.getEmail().isEmpty()) {
			map.put("email", "Vui lòng nhập email");
			check = false;
		} else {
			if (!checkUser.isPresent()) {
				map.put("email", "Email không hợp lệ hoặc không tìm thấy email này");
				check = false;
			}
		}

		if (check) {
			try {
				ExecutorService executor = Executors.newSingleThreadExecutor();
				executor.execute(() -> {
					synchronized (lock) {
						emailService.forgotPassword(checkUser.get());
						executor.shutdown();
					}
				});
				map.put("status", "200");
			} catch (Exception e) {
				map.put("status", "401");
			}
		} else {
			map.put("status", "401");
		}
		return map;
	}

	// forgot password confirm
	public Map<String, String> forgotPasswrodConfirm(ForgotPasswordRequest request) {
		Map<String, String> map = new HashMap<>();
		Optional<ForgotPassword> forgotPw = forgotPasswordRepository.findByIdAndValidCode(request.getId(),
				request.getValidCode());
		if (forgotPw.isPresent()) {
			if (!forgotPw.get().getExpiration().before(new Date())) {
				map.put("status", "200");
				map.put("email", forgotPw.get().getUser().getEmail());
				map.put("expiration", forgotPw.get().getExpiration() + "");
			} else {
				map.put("status", "401");
				map.put("error", "Thời hạn đặt lại mật khẩu đã hết. Vui lòng thử lại !");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Lỗi đặt lại mật khẩu. Vui lòng thử lại !");
		}
		return map;
	}

	// reset password
	public Map<String, String> resetPassword(ForgotPasswordRequest request) {
		Map<String, String> map = new HashMap<>();
		boolean check = true;
		Optional<ForgotPassword> forgotPw = forgotPasswordRepository.findByIdAndValidCode(request.getId(),
				request.getValidCode());
		if (!forgotPw.isPresent()) {
			map.put("error", "Lỗi đặt lại mật khẩu. Vui lòng thử lại !");
			check = false;
		} else {
			if (forgotPw.get().getExpiration().before(new Date())) {
				map.put("error", "Thời hạn đặt lại mật khẩu đã hết. Vui lòng thử lại !");
				check = false;
			}
		}

		if (request.getPassword() == null || request.getPassword().isEmpty()) {
			map.put("password", "Vui lòng nhập mật khẩu");
			check = false;
		}

		if (request.getPasswordCf() == null || request.getPasswordCf().isEmpty()) {
			map.put("passwordCf", "Vui lòng nhập xác nhận mật khẩu");
			check = false;
		} else {
			if (!request.getPassword().equals(request.getPasswordCf())) {
				map.put("passwordCf", "Mật khẩu chưa khớp");
				check = false;
			}
		}

		if (check) {
			Optional<User> user = userRepository.findByEmail(forgotPw.get().getUser().getEmail());
			user.get().setPassword(passwordEncoder.encode(request.getPasswordCf()));
			userRepository.saveAndFlush(user.get());

			forgotPasswordRepository.delete(forgotPw.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

}