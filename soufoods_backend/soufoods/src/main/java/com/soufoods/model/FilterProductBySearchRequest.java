package com.soufoods.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilterProductBySearchRequest {
	private String search;
	private Integer quantity;
	private Double discount;
	private Double minPrice;
	private Double maxPrice;
	private Integer pageNumber;
}
