package com.soufoods.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordRequest {
	private String token;
	private String passwordOld;
	private String passwordNew;
	private String passwordNewCf;
}
