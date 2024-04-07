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
public class FilterVoucherRequest {
	private String search;
    private Boolean active;
    private Boolean freeShip;
    private Integer expiration;
    private Date expirationDate;
    private Integer pageNumber;
}
