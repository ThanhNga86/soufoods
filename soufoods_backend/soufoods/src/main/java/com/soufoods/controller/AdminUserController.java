package com.soufoods.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.User;
import com.soufoods.model.FilterUserRequest;
import com.soufoods.service.AdminUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
	private final AdminUserService adminUserService;

	@GetMapping("")
	public ResponseEntity<?> users(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("totalPage") Optional<Integer> totalPage) {
		return ResponseEntity.ok(adminUserService.findAll(pageNumber, totalPage));
	}

	@PostMapping("/filter")
	public ResponseEntity<?> filterUser(@RequestBody FilterUserRequest request) {
		return ResponseEntity.ok(adminUserService.filterUser(request));
	}

	@GetMapping("/{email}")
	public ResponseEntity<?> findByEmail(@PathVariable("email") Optional<String> email) {
		Map<String, Object> map = adminUserService.findByEmail(email.get());
		return ResponseEntity.ok(map);
	}

	@PutMapping("")
	public ResponseEntity<?> updateUser(@RequestBody User user) {
		Map<String, String> map = adminUserService.updateUser(user);
		if (map.get("status").equals("200")) {
			return ResponseEntity.ok(map);
		} else {
			return ResponseEntity.ok(map);
		}
	}

	@DeleteMapping("/{email}")
	public ResponseEntity<?> DeleteUser(@PathVariable("email") Optional<String> email) {
		Map<String, String> map = adminUserService.deleteUser(email);
		if (map.get("status").equals("200")) {
			return ResponseEntity.ok(map);
		} else {
			return ResponseEntity.ok(map);
		}
	}
}
