package com.soufoods.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order implements Serializable {
	private static final long serialVersionUID = 1L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String email;
	private String firstName;
	private String lastName;
	private String address;
	private String phone;
	@Column(columnDefinition = "TEXT")
	private String note;
	private boolean freeShip;
	private Date createDate = new Date();
	private String status;
	@ManyToOne
	@JoinColumn(name = "userId")
	private User user;
	@OneToOne(cascade = CascadeType.REMOVE)
	@JoinColumn(name = "voucherId")
	private Voucher voucher;
	@JsonIgnore
	@OneToOne(mappedBy = "order", cascade = CascadeType.REMOVE)
	private Payment payments;
	@JsonIgnore
	@OneToMany(mappedBy = "order", cascade = CascadeType.REMOVE)
	private List<OrderDetail> listOrderDetail;
}
