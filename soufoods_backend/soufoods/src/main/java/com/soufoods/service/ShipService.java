package com.soufoods.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.soufoods.entity.Order;
import com.soufoods.entity.OrderDetail;
import com.soufoods.entity.Role;
import com.soufoods.entity.User;
import com.soufoods.repo.OrderDetailRepository;
import com.soufoods.repo.OrderRepository;
import com.soufoods.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShipService {
	private final UserRepository userRepository;
	private final OrderRepository orderRepository;
	private final OrderDetailRepository orderDetailRepository;
	private final String url = "https://services.giaohangtietkiem.vn";
//	private final String url = "https://khachhang-staging.ghtklab.com";
	private final String token = "45e5d9F3E6c76f038729B00fF63705B43440219c";
	private final RestTemplate restTemplate;
	private HttpHeaders headers;

	public JsonNode shipFee(String address, String province, String district, String ward, Integer weight,
			Integer value) {
		JsonNode jsonNode = null;
		ObjectMapper objectMapper = new ObjectMapper();
		Map<String, Object> mapPickAddress = this.getPickAddress();

		if (mapPickAddress.get("status").equals("200")) {
			try {
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
					objectNode.put("error", jsonNode.get("message") + "");
				}
			} catch (Exception e) {
				ObjectNode objectNode = objectMapper.createObjectNode();
				objectNode.put("status", "401");
				objectNode.put("error", "Lỗi kết nối với api giao hàng! Vui lòng tải lại trang.");
				jsonNode = objectNode;
			}
		} else {
			ObjectNode objectNode = objectMapper.createObjectNode();
			objectNode.put("status", "401");
			objectNode.put("error", "Chưa có địa chỉ hoặc số điện thoại lấy hàng.");
			jsonNode = objectNode;
		}
		return jsonNode;
	}

	public JsonNode updateOrderStatus(Order order) {
		JsonNode jsonNode = null;
		ObjectMapper objectMapper = new ObjectMapper();

		try {
			String endpoint = url + "/services/shipment/v2/partner_id:s" + order.getId();
			this.headers = new HttpHeaders();
			this.headers.set("Token", this.token);
			this.headers.set("Content-Type", "application/json");

			ResponseEntity<JsonNode> response = restTemplate.exchange(endpoint, HttpMethod.GET,
					new HttpEntity<>(headers), JsonNode.class);
			jsonNode = response.getBody();
			ObjectNode objectNode = (ObjectNode) jsonNode;
			if (Boolean.parseBoolean(jsonNode.get("success") + "")) {
				JsonNode orderReponse = jsonNode.get("order");
				Integer status = Integer.parseInt(orderReponse.get("status") + "");
				if (status != -1) {
					// status đc lấy từ bảng tham số trạng thái ghtk
					if (status == 3 || status == 4 || status == 123) {
						order.setStatus("Đang giao");
						orderRepository.saveAndFlush(order);
					}
					else if (status == 5 || status == 6 || status == 45) {
						order.setStatus("Đã giao");
						orderRepository.saveAndFlush(order);
					}
					else if (status == 13 || status == 20 || status == 21) {
						order.setStatus("Trả hàng");
						orderRepository.saveAndFlush(order);
					}
					
					objectNode.put("status", "200");
				}
			} else {
				objectNode.put("status", "401");
				objectNode.put("error", jsonNode.get("message") + "");
			}
		} catch (Exception e) {
			try {
				int index1 = e.getMessage().indexOf("{");
				int index2 = e.getMessage().lastIndexOf("}") + 1;
				String response = e.getMessage().substring(index1, index2);
				jsonNode = objectMapper.readTree(response);
				ObjectNode objectNode = (ObjectNode) jsonNode;
				objectNode.put("status", "401");
				objectNode.put("error", jsonNode.get("message") + "");
			} catch (JsonProcessingException e1) {
				ObjectNode objectNode = objectMapper.createObjectNode();
				objectNode.put("status", "401");
				objectNode.put("error", "Lỗi kết nối với api giao hàng !");
				jsonNode = objectNode;
			}
		}
		return jsonNode;
	}

	public JsonNode orderApply(Long orderId) {
		JsonNode jsonNode = null;
		Map<String, Object> mapPickAddress = this.getPickAddress();
		ObjectMapper objectMapper = new ObjectMapper();

		if (mapPickAddress.get("status").equals("200")) {
			Optional<Order> order = orderRepository.findById(orderId);
			if (order.isPresent() && order.get().getStatus().equals("Chờ xử lý")) {
				try {
					String endpoint = url + "/services/shipment/order/?ver=1.5";
					this.headers = new HttpHeaders();
					this.headers.set("Token", this.token);
					this.headers.set("Content-Type", "application/json");
					Map<String, Object> formData = new HashMap<>();
					List<Map<String, Object>> listProducts = new ArrayList<>();
					int pick_money = 0;
					int value = 0;
					
					for (OrderDetail orderDetail : orderDetailRepository.findAllByOrder(order.get().getId())) {
						Map<String, Object> product = new HashMap<>();
						String name = orderDetail.getProductDetail().getProduct().getName()
								.equals(orderDetail.getProductDetail().getSize())
										? orderDetail.getProductDetail().getProduct().getName()
										: orderDetail.getProductDetail().getProduct().getName() + " - loại "
												+ orderDetail.getProductDetail().getSize();
						product.put("name", name);
						product.put("price", (orderDetail.getPrice() * (100 - orderDetail.getDiscount()) / 100));
						product.put("weight", 0.2);
						product.put("quantity", orderDetail.getQuantity());
						product.put("product_code", orderDetail.getProductDetail().getProduct().getId());
						listProducts.add(product);

						pick_money += (orderDetail.getPrice() * (100 - orderDetail.getDiscount()) / 100)
								* orderDetail.getQuantity();
						
						value += (orderDetail.getPrice() * (100 - orderDetail.getDiscount()) / 100)
								* orderDetail.getQuantity();
					}

					if (order.get().getVoucher() != null) {
						pick_money -= (order.get().getVoucher().isDiscountType())
								? pick_money - (pick_money - order.get().getVoucher().getDiscount())
								: pick_money - (pick_money * (100 - order.get().getVoucher().getDiscount()) / 100);
						
						value -= (order.get().getVoucher().isDiscountType())
								? pick_money - (pick_money - order.get().getVoucher().getDiscount())
										: pick_money - (pick_money * (100 - order.get().getVoucher().getDiscount()) / 100);
					}

					if (!order.get().getPayment().equals("COD")) {
						pick_money = 0;
					}

					Map<String, Object> formOrder = new HashMap<>();
					String[] arrAddress = order.get().getAddress().split("\\|\\|");
					// thông tin lấy hàng
					formOrder.put("id", "s" + order.get().getId());
					formOrder.put("pick_name", mapPickAddress.get("pick_name"));
					formOrder.put("pick_address", mapPickAddress.get("pick_address"));
					formOrder.put("pick_province", mapPickAddress.get("pick_province"));
					formOrder.put("pick_district", mapPickAddress.get("pick_district"));
					formOrder.put("pick_ward", mapPickAddress.get("pick_ward"));
					formOrder.put("pick_tel", mapPickAddress.get("pick_tel"));
					// thông tin người nhận người
					formOrder.put("tel", order.get().getPhone());
					formOrder.put("name", order.get().getFirstName());
					formOrder.put("address", arrAddress[0].trim());
					formOrder.put("province", arrAddress[3].trim());
					formOrder.put("district", arrAddress[2].trim());
					formOrder.put("ward", arrAddress[1].trim());
					formOrder.put("hamlet", arrAddress[0].trim());
					formOrder.put("email", order.get().getEmail());
					formOrder.put("is_freeship", (order.get().getShipFee() == 0) ? "1" : "0");
					formOrder.put("pick_money", pick_money);
					formOrder.put("note", order.get().getNote());
					formOrder.put("value", value);
					formOrder.put("transport", "road");
					formOrder.put("deliver_option", "none");
					formOrder.put("note", order.get().getNote());
					formOrder.put("tag", "[7,39]");
					// thông tin đơn hàng trả về
					formOrder.put("return_name", mapPickAddress.get("pick_name"));
					formOrder.put("return_address", mapPickAddress.get("pick_address"));
					formOrder.put("return_province", mapPickAddress.get("pick_province"));
					formOrder.put("return_district", mapPickAddress.get("pick_district"));
					formOrder.put("return_ward", mapPickAddress.get("pick_ward"));
					formOrder.put("return_tel", mapPickAddress.get("pick_tel"));
					formOrder.put("return_email", mapPickAddress.get("pick_email"));

					formData.put("products", listProducts);
					formData.put("order", formOrder);
					ResponseEntity<JsonNode> response = restTemplate.exchange(endpoint, HttpMethod.POST,
							new HttpEntity<>(formData, headers), JsonNode.class);
					jsonNode = response.getBody();
					ObjectNode objectNode = (ObjectNode) jsonNode;
					if (Boolean.parseBoolean(jsonNode.get("success") + "")) {
						objectNode.put("status", "200");
						order.get().setStatus("Đã xử lý");
						orderRepository.saveAndFlush(order.get());
					} else {
						objectNode.put("status", "401");
						objectNode.put("error", jsonNode.get("message") + "");
					}
				} catch (Exception e) {
					try {
						int index1 = e.getMessage().indexOf("{");
						int index2 = e.getMessage().lastIndexOf("}") + 1;
						String response = e.getMessage().substring(index1, index2);
						jsonNode = objectMapper.readTree(response);
						ObjectNode objectNode = (ObjectNode) jsonNode;
						objectNode.put("status", "401");
						objectNode.put("error", jsonNode.get("message") + "");
					} catch (JsonProcessingException e1) {
						ObjectNode objectNode = objectMapper.createObjectNode();
						objectNode.put("status", "401");
						objectNode.put("error", "Lỗi kết nối với api giao hàng !");
						jsonNode = objectNode;
					}
				}
			} else {
				ObjectNode objectNode = objectMapper.createObjectNode();
				objectNode.put("status", "401");
				objectNode.put("error", "Không tìm thấy hoặc đã duyệt đơn hàng này.");
				jsonNode = objectNode;
			}
		} else {
			ObjectNode objectNode = objectMapper.createObjectNode();
			objectNode.put("status", "401");
			objectNode.put("error", "Chưa có địa chỉ hoặc số điện thoại lấy hàng.");
			jsonNode = objectNode;
		}
		return jsonNode;
	}
	
	public JsonNode orderCancel(Long orderId) {
		JsonNode jsonNode = null;
		ObjectMapper objectMapper = new ObjectMapper();
		Optional<Order> order = orderRepository.findById(orderId);
		if (order.isPresent()
				&& (order.get().getStatus().equals("Chờ xử lý") || order.get().getStatus().equals("Đã xử lý"))) {
			try {
				String endpoint = url + "/services/shipment/cancel/partner_id:s" + order.get().getId();
				this.headers = new HttpHeaders();
				this.headers.set("Token", this.token);
				this.headers.set("Content-Type", "application/json");

				ResponseEntity<JsonNode> response = restTemplate.exchange(endpoint, HttpMethod.POST,
						new HttpEntity<>(headers), JsonNode.class);
				jsonNode = response.getBody();
				ObjectNode objectNode = (ObjectNode) jsonNode;
				if (Boolean.parseBoolean(jsonNode.get("success") + "")) {
					objectNode.put("status", "200");
					order.get().setStatus("Đã hủy");
					orderRepository.saveAndFlush(order.get());
				} else {
					objectNode.put("status", "401");
					objectNode.put("error", jsonNode.get("message") + "");
				}
			} catch (Exception e) {
				try {
					int index1 = e.getMessage().indexOf("{");
					int index2 = e.getMessage().lastIndexOf("}") + 1;
					String response = e.getMessage().substring(index1, index2);
					jsonNode = objectMapper.readTree(response);
					ObjectNode objectNode = (ObjectNode) jsonNode;
					objectNode.put("status", "401");
					objectNode.put("error", jsonNode.get("message") + "");
				} catch (JsonProcessingException e1) {
					ObjectNode objectNode = objectMapper.createObjectNode();
					objectNode.put("status", "401");
					objectNode.put("error", "Lỗi kết nối với api giao hàng !");
					jsonNode = objectNode;
				}
			}
		} else {
			ObjectNode objectNode = objectMapper.createObjectNode();
			objectNode.put("status", "401");
			objectNode.put("error", "Không tìm thấy hoặc đã duyệt đơn hàng này.");
			jsonNode = objectNode;
		}
		return jsonNode;
	}

	private Map<String, Object> getPickAddress() {
		Map<String, Object> map = new HashMap<>();
		Optional<User> user = userRepository.findAll().stream().filter(u -> u.getRole().equals(Role.ROLE_ADMIN))
				.findFirst();
		if (user.isPresent()) {
			if (!user.get().getAddress().isEmpty() && !user.get().getPhone().isEmpty()) {
				map.put("status", "200");
				String[] arrAddress = user.get().getAddress().split("\\|\\|");
				map.put("pick_name", user.get().getLastName() + " " + user.get().getFirstName());
				map.put("pick_address", arrAddress[0].trim());
				map.put("pick_province", arrAddress[3].trim());
				map.put("pick_district", arrAddress[2].trim());
				map.put("pick_ward", arrAddress[1].trim());
				map.put("pick_tel", user.get().getPhone());
				map.put("pick_email", user.get().getEmail());
			} else {
				map.put("status", "401");
			}
		} else {
			map.put("status", "401");
		}
		return map;
	}
}
