package com.soufoods.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.soufoods.entity.Images;
import com.soufoods.entity.Review;
import com.soufoods.entity.Role;
import com.soufoods.entity.User;
import com.soufoods.model.AdminUserResponse;
import com.soufoods.model.FilterUserRequest;
import com.soufoods.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserService {
	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final AwsS3Service awsS3Service;

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

	public Map<String, Object> findAllByEmail(String email) {
		Map<String, Object> map = new HashMap<>();
		List<User> users = userRepository.findAllByEmail(email);
		if(users.size() > 10) {
			users = users.subList(0, 10);
		}
		map.put("users", users);
		return map;
	}
	
	public List<User> findAll() {
		return userRepository.findAll();
	}

	public AdminUserResponse findAll(Optional<Integer> pageNumber, Optional<Integer> sizePage1) {
		int sizePage = sizePage1.orElse(10);
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		Page<User> users = userRepository.findAll(page);
		long total = users.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminUserResponse.builder().total(total).totalPage(totalPage)
				.users(users.toList().stream().filter(user -> !user.getRole().equals(Role.ROLE_ADMIN)).toList())
				.build();
	}

	public AdminUserResponse filterUser(FilterUserRequest request) {
		int sizePage = 10;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		Page<User> users = userRepository.filterUser(request.getSearch(), request.getActive(), page);
		long total = users.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminUserResponse.builder().total(total).totalPage(totalPage)
				.users(users.toList().stream().filter(user -> !user.getRole().equals(Role.ROLE_ADMIN)).toList())
				.build();
	}

	public Map<String, String> updateUser(User user) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();
		Optional<User> checkUser = userRepository.findByEmail(user.getEmail());

		if (user.getUsername() == null || user.getUsername().isEmpty()) {
			map.put("email", "Vui lòng nhập email");
			check = false;
		} else {
			if (!checkUser.isPresent()) {
				map.put("email", "Email không tồn tại");
				check = false;
			}
		}

		if (user.getPassword() == null || user.getPassword().isEmpty()) {
			map.put("password", "Vui lòng nhập mật khẩu");
			check = false;
		}

		if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
			map.put("firstName", "Vui lòng nhập tên & tên");
			check = false;
		}

		if (user.getLastName() == null || user.getLastName().isEmpty()) {
			map.put("lastName", "Vui lòng nhập họ");
			check = false;
		}

		if (user.getAddress() == null || user.getPhone().isEmpty()) {
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

		if (user.getAddress() == null || user.getAddress().isEmpty()) {
			map.put("address", "Vui lòng nhập địa chỉ");
			check = false;
		}

		if (check) {
			map.put("status", "200");
			if (!checkUser.get().getRole().equals(Role.ROLE_ADMIN)) {
				if (!checkUser.get().getPassword().equals(user.getPassword())) {
					checkUser.get().setPassword(passwordEncoder.encode(user.getPassword()));
				}
				checkUser.get().setFirstName(user.getFirstName());
				checkUser.get().setPhone(user.getPhone());
				checkUser.get().setAddress(user.getAddress());
				checkUser.get().setActive(user.isActive());
				checkUser.get().setRole(Role.ROLE_USER);
				checkUser.get().setAccount(user.getAccount());
				userRepository.saveAndFlush(checkUser.get());
			}
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> deleteUser(Optional<String> username) {
		Map<String, String> map = new HashMap<>();
		if (username.isPresent()) {
			Optional<User> user = userRepository.findByEmail(username.get());
			if (user.isPresent()) {
				if (user.get().getRole().equals(Role.ROLE_ADMIN)) {
					map.put("status", "401");
					map.put("error", "Không thể xóa người dùng này.");
				} else {
					try {
						List<Images> images = new ArrayList<>();
						for (Review review : user.get().getListReview()) {
							for (Images image : review.getListImages()) {
								images.add(image);
							}
						}
						userRepository.delete(user.get());
						if (!images.isEmpty()) {
							for (Images image : images) {
								awsS3Service.deleteFileS3(image.getName());
							}
						}
						map.put("status", "200");
					} catch (Exception e) {
						map.put("status", "401");
						map.put("error", "Không thể xóa người dùng này.");
					}
				}
			} else {
				map.put("status", "401");
				map.put("error", "Không tìm thấy người dùng này.");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy người dùng này.");
		}
		return map;
	}
}