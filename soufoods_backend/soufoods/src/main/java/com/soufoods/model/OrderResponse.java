package com.soufoods.model;

import java.util.List;

import com.soufoods.entity.Order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
	private int totalPage;
	private Long total;
	private List<Order> orders;
}
