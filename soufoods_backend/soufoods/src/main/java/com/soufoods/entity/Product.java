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
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Products")
public class Product implements Serializable {
	private static final long serialVersionUID = 1L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String name;
	private String image;
	@Transient
	private String imageUrl;
	private String type;
	@Column(columnDefinition = "TEXT")
	private String describes;
	private Date createDate = new Date();
	private boolean active;
	@ManyToOne
	@JoinColumn(name = "categoryDetailId")
	private CategoryDetail categoryDetail;
	@JsonIgnore
	@OneToMany(mappedBy = "product", cascade = CascadeType.REMOVE)
	private List<Favorite> listFavorite;
	@JsonIgnore
	@OneToMany(mappedBy = "product", cascade = CascadeType.REMOVE)
	private List<Review> listReview;
	@JsonIgnore
	@OneToMany(mappedBy = "product", cascade = CascadeType.REMOVE)
	private List<Images> listImages;
	@JsonIgnore
	@OneToMany(mappedBy = "product", cascade = CascadeType.REMOVE)
	private List<ProductDetail> listProductDetails;
}
