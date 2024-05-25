package com.soufoods.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ForgotPasswordRequest {
	private Long id;
	private String email;
	private String validCode;
	private String password;
	private String passwordCf;
}
