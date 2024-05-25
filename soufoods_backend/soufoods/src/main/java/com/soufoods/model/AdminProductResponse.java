package com.soufoods.model;


import java.util.List;

import com.soufoods.entity.Product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminProductResponse {
	private int totalPage;
	private Long total;
	private List<Product> products;
}
