package com.soufoods.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilterProductRequest {
	private Long id;
	private String search;
	private Integer quantity;
	private Double discount;
	private Boolean active;
	private Boolean activePd;
	private Long categoryId;
	private Integer pageNumber;
}
