package com.soufoods.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.User;
import com.soufoods.model.ChangePasswordRequest;
import com.soufoods.model.ForgotPasswordRequest;
import com.soufoods.model.UpdateInfoRequest;
import com.soufoods.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
	private final UserService userService;

	@PostMapping("")
	public ResponseEntity<?> register(User user) {
		Map<String, String> map = userService.register(user);
		if (map.get("status").equals("200")) {
			return ResponseEntity.ok("Đăng ký tài khoản thành công !");
		} else {
			return ResponseEntity.ok(map);
		}
	}
	
	@PutMapping("")
	public ResponseEntity<?> updateInfo(UpdateInfoRequest request) {
		Map<String, String> map = userService.updateInfo(request);
		if (map.get("status").equals("200")) {
			return ResponseEntity.ok("Cập nhật tài khoản thành công !");
		} else {
			return ResponseEntity.ok(map);
		}
	}
	
	@GetMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(ForgotPasswordRequest request) {
		boolean check = userService.forgotPassword(request);
		if (check) {
			return ResponseEntity.ok("");
		} else {
			return ResponseEntity.ok("Email không tồn tại");
		}
	}
	
	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPasswordCf(ForgotPasswordRequest request) {
		Map<String, String> map = userService.forgotPasswrodConfirm(request);
		if (map.get("status").equals("200")) {
			return ResponseEntity.ok("Đổi mật khẩu thành công !");
		} else {
			return ResponseEntity.ok(map);
		}
	}
	
	@PostMapping("/change-password")
	public ResponseEntity<?> changePassword(ChangePasswordRequest request) {
		Map<String, String> map = userService.changePassword(request);
		if (map.get("status").equals("200")) {
			return ResponseEntity.ok("Đổi mật khẩu thành công !");
		} else {
			return ResponseEntity.ok(map);
		}
	}
}
