package com.soufoods.model;

import java.util.List;

import com.soufoods.entity.Voucher;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
	private String token;
	private String lastName;
	private String firstName;
	private String email;
	private String phone;
	private String address;
	private Integer shipFee;
	private String payment;
	private Voucher voucher;
	private List<Long> productDetailId;
	private List<Integer> quantity;
	private String note;
}
