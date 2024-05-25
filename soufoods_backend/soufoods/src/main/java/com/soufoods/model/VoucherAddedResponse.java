package com.soufoods.model;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VoucherAddedResponse {
	private Long id;
	private String discountCode;
	private Integer discount;
	private Double priceMin;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private Date expiration;
	private boolean freeShip;
	private boolean discountType;
	private boolean active;
	private String email;
}
