package com.soufoods.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.soufoods.entity.Role;
import com.soufoods.entity.User;
import com.soufoods.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShipService {
	private final UserRepository userRepository;
	private final String url = "https://services.giaohangtietkiem.vn";
	private final String token = "45e5d9F3E6c76f038729B00fF63705B43440219c";
	private final RestTemplate restTemplate;
	private HttpHeaders headers;

	public JsonNode shipFee(String address, String province, String district, String ward, Integer weight,
			Integer value) {
		JsonNode jsonNode = null;
		ObjectMapper objectMapper = new ObjectMapper();
		Map<String, Object> mapPickAddress = this.getPickAddress();

		if (mapPickAddress.get("status").equals("200")) {
			StringBuilder params = new StringBuilder();
			params.append("pick_address=" + mapPickAddress.get("pick_province"));
			params.append("&pick_province=" + mapPickAddress.get("pick_province"));
			params.append("&pick_district=" + mapPickAddress.get("pick_district"));
			params.append("&pick_ward=" + mapPickAddress.get("pick_ward"));
			params.append("&address=" + address);
			params.append("&province=" + province);
			params.append("&district=" + district);
			params.append("&ward=" + ward);
			params.append("&ward=" + ward);
			params.append("&weight=" + weight);
			params.append("&value=" + value);
			params.append("&deliver_option=none");
			params.append("&transport=road");

			String endpoint = url + "/services/shipment/fee?" + params.toString();
			this.headers = new HttpHeaders();
			this.headers.set("Token", this.token);
			this.headers.set("Content-Type", "application/json");
			ResponseEntity<JsonNode> response = restTemplate.exchange(endpoint, HttpMethod.GET,
					new HttpEntity<>(headers), JsonNode.class);
			jsonNode = response.getBody();
			ObjectNode objectNode = (ObjectNode) jsonNode;
			if (Boolean.parseBoolean(jsonNode.get("success") + "")) {
				objectNode.put("status", "200");
			} else {
				objectNode.put("status", "401");
			}
		} else {
			ObjectNode objectNode = objectMapper.createObjectNode();
			objectNode.put("status", "401");
			objectNode.put("error", "Chưa tạo tài khoản admin hoặc chưa có địa chỉ lấy hàng.");
			jsonNode = objectNode;
		}
		return jsonNode;
	}

	private Map<String, Object> getPickAddress() {
		Map<String, Object> map = new HashMap<>();
		Optional<User> user = userRepository.findAll().stream().filter(u -> u.getRole().equals(Role.ROLE_ADMIN))
				.findFirst();
		if (user.isPresent()) {
			if (!user.get().getAddress().isEmpty()) {
				map.put("status", "200");
				String[] arrAddress = user.get().getAddress().split("\\|\\|");
				map.put("pick_address", arrAddress[0].trim());
				map.put("pick_province", arrAddress[3].trim());
				map.put("pick_district", arrAddress[2].trim());
				map.put("pick_ward", arrAddress[1].trim());
			} else {
				map.put("status", "401");
			}
		} else {
			map.put("status", "401");
		}
		return map;
	}
}
