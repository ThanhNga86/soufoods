package com.soufoods.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilterReviewRequest {
	private Long id;
	private String search;
	private List<Integer> rates;
	private Boolean active;
	private Integer pageNumber;
}
