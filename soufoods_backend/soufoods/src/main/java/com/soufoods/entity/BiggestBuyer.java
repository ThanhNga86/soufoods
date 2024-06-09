package com.soufoods.entity;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table
public class BiggestBuyer implements Serializable {
	private static final long serialVersionUID = 1L;
	@Id
	private Long id;
	private User user;
	private Double price;
	private Long quantity;
}
