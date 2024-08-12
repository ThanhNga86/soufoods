package com.soufoods.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
	
	@GetMapping("/{email}")
	public ResponseEntity<?> user(@PathVariable("email") String email) {
		Map<String, Object> map = userService.findByEmail(email);
		return ResponseEntity.ok(map);
	}
	
	@PostMapping("")
	public ResponseEntity<?> register(@RequestBody User user) {
		Map<String, String> map = userService.register(user);
		return ResponseEntity.ok(map);
	}

	@PutMapping("/address")
	public ResponseEntity<?> updatePickAddress(String token,String address) {
		Map<String, String> map = userService.updatePickAddress(token, address);
		return ResponseEntity.ok(map);
	}
	
	@PutMapping("")
	public ResponseEntity<?> updateInfo(UpdateInfoRequest request) {
		Map<String, String> map = userService.updateInfo(request);
		return ResponseEntity.ok(map);
	}
	
	@PostMapping("/change-password")
	public ResponseEntity<?> changePassword(ChangePasswordRequest request) {
		Map<String, String> map = userService.changePassword(request);
		return ResponseEntity.ok(map);
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(ForgotPasswordRequest request) {
		Map<String, Object> map = userService.forgotPassword(request);
		return ResponseEntity.ok(map);
	}

	@PutMapping("/forgot-password")
	public ResponseEntity<?> forgotPasswordCf(ForgotPasswordRequest request) {
		Map<String, String> map = userService.forgotPasswrodConfirm(request);
		return ResponseEntity.ok(map);
	}
	
	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(ForgotPasswordRequest request) {
		Map<String, String> map = userService.resetPassword(request);
		return ResponseEntity.ok(map);
	}

}
