package com.soufoods.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.regex.Pattern;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.soufoods.entity.Account;
import com.soufoods.entity.Role;
import com.soufoods.entity.User;
import com.soufoods.model.AuthenticationRequest;
import com.soufoods.model.AuthenticationResponse;
import com.soufoods.model.ChangePasswordRequest;
import com.soufoods.model.ForgotPasswordRequest;
import com.soufoods.model.UpdateInfoRequest;
import com.soufoods.repo.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final UserDetailsService userDetailsService;
	private final EmailService emailService;
	private final AuthenticationManager authenticationManager;
	private final BCryptPasswordEncoder passwordEncoder;
	private final HttpSession session;

	// login
	public AuthenticationResponse authentication(AuthenticationRequest request) {
		authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
		var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
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
		Optional<User> checkUser = userRepository.findByEmail(user.getEmail());

		if (user.getEmail() == null) {
			map.put("email", "Vui lòng nhập email");
			check = false;
		} else {
			Pattern p = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
			if (!p.matcher(user.getEmail()).find()) {
				map.put("email", "Email không hợp lệ");
				check = false;
			} else {
				if (checkUser.isPresent()) {
					map.put("email", "Email đã tồn tại");
					check = false;
				}
			}
		}

		if (user.getPassword() == null) {
			map.put("password", "Vui lòng nhập mật khẩu");
			check = false;
		}

		if (user.getFirstName() == null) {
			map.put("firstName", "Vui lòng nhập tên đệm & tên");
			check = false;
		}
		
		if (user.getFirstName() == null) {
			map.put("lastName", "Vui lòng nhập họ");
			check = false;
		}
		
		if (user.getLastName() == null) {
			map.put("lastName", "Vui lòng nhập họ");
			check = false;
		}
		
		if (user.getPhone() == null) {
			map.put("phone", "Vui lòng nhập số điện thoại");
			check = false;
		} else {
			try {
				Integer.parseInt(user.getPhone());
			} catch (NumberFormatException e) {
				map.put("phone", "Vui lòng không nhập bằng chữ hoặc ký tự đặc biệt");
				check = false;
			}
		}

		if (check) {
			map.put("status", "200");
			user.setActive(true);
			user.setPassword(passwordEncoder.encode(user.getPassword()));
			user.setRole(Role.ROLE_USER);
			user.setAccount(Account.Local);
			user.setCreateDate(new Date());
			userRepository.save(user);
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

		if (!user.isPresent()) {
			map.put("email", "Email không tồn tại");
			check = false;
		}

		if (request.getFirstName() == null) {
			map.put("firstName", "Vui lòng nhập tên đệm & tên");
			check = false;
		}
		
		if (request.getLastName() == null) {
			map.put("lastName", "Vui lòng nhập họ");
			check = false;
		}

		if (request.getPhone() == null) {
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

		if (request.getAddress() == null) {
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

		if (user.isPresent()) {
			if (request.getPasswordOld().isEmpty()) {
				map.put("passwordOld", "Vui lòng nhập mật khẩu cũ");
				check = false;
			} else {
				if (!passwordEncoder.matches(request.getPasswordOld(), user.get().getPassword())) {
					map.put("passwordOld", "Mật khẩu chưa chính xác");
					check = false;
				}
			}

			if (request.getPasswordNew().isEmpty()) {
				map.put("passwordNew", "Vui lòng nhập mật khẩu mới");
				check = false;
			}

			if (request.getPasswordNewCf().isEmpty()) {
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
	public boolean forgotPassword(ForgotPasswordRequest request) {
		Optional<User> checkUser = userRepository.findByEmail(request.getEmail());
		if (checkUser.isPresent()) {
			String subject = "Thông tin mã xác thực đặt lại mật khẩu";
			String validCode = "";
			Random rd = new Random();
			for (int i = 0; i < 6; i++) {
				validCode += String.valueOf(rd.nextInt(9) + 0);
			}
			String content = "Chào " + checkUser.get().getFirstName() + ".<br>"
					+ "Chúng tôi nhận được yêu cầu lấy lại mật khẩu của bạn qua email. Để hoàn tất quá trình lấy lại mật khẩu, vui lòng sử dụng mã xác nhận sau đây để đặt lại mật khẩu của bạn:<br>"
					+ "Mã xác nhận: <span style=\"color: skyblue; font-size: 16px; font-weight: bold;\">" + validCode +"</span><br>"
					+ "Vui lòng nhập mã xác nhận này vào trang đặt lại mật khẩu của chúng tôi để tiếp tục quá trình đặt lại mật khẩu của bạn.<br>"
					+ "Đây là email gửi tự động, vui lòng không phản hồi.<br>"
					+ "Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này.<br>";
			emailService.sendEmail(checkUser.get().getEmail(), subject, content);
			session.setAttribute("email", checkUser.get().getEmail());
			session.setAttribute("currentTimeValid", new Date(System.currentTimeMillis() + 1000 * 60));
			session.setAttribute("validCode", validCode);
			return true;
		} else {
			return false;
		}
	}

	// forgot password confirm
	public Map<String, String> forgotPasswrodConfirm(ForgotPasswordRequest request) {
		Map<String, String> map = new HashMap<>();
		boolean check = true;
		final String email = (String) session.getAttribute("email");
		final Date currentTime = (Date) session.getAttribute("currentTimeValid");
		final String validCode = (String) session.getAttribute("validCode");

		if (request.getValidCode().isEmpty()) {
			map.put("validCode", "Vui lòng nhập mã xác nhận");
			check = false;
		} else {
			if (currentTime != null) {
				if (!currentTime.before(new Date())) {
					if (!request.getValidCode().equals(validCode)) {
						map.put("validCode", "Mã xác nhận chưa đúng");
						check = false;
					}
				} else {
					map.put("validCode", "Mã xác nhận chưa đúng");
					session.removeAttribute("currentTimeValid");
					session.removeAttribute("validCode");
					check = false;
				}
			} else {
				map.put("validCode", "Mã xác nhận chưa đúng");
				check = false;
			}
		}

		if (request.getPassword().isEmpty()) {
			map.put("password", "Vui lòng nhập mật khẩu");
			check = false;
		}

		if (request.getPasswordCf().isEmpty()) {
			map.put("passwordCf", "Vui lòng nhập nhập lại mật khẩu");
			check = false;
		} else {
			if (!request.getPassword().equals(request.getPasswordCf())) {
				map.put("passwordCf", "Mật khẩu chưa khớp");
				check = false;
			}
		}

		if (check) {
			Optional<User> user = userRepository.findByEmail(email);
			if (user.isPresent()) {
				map.put("status", "200");
				user.get().setPassword(passwordEncoder.encode(request.getPasswordCf()));
				userRepository.saveAndFlush(user.get());
				session.removeAttribute("email");
				session.removeAttribute("currentTimeValid");
				session.removeAttribute("validCode");
			}
		} else {
			map.put("status", "401");
		}
		return map;
	}
}
