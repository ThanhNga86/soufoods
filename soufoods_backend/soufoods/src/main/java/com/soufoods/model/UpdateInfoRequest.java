package com.soufoods.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateInfoRequest {
	private String token;
	private String firstName;
	private String lastName;
	private String phone;
	private String address;
}
