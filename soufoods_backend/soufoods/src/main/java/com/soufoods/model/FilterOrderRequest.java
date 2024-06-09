package com.soufoods.model;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilterOrderRequest {
	private Long id;
	private String search;
	private Date orderDate;
	private String status;
	private Integer pageNumber;
}
