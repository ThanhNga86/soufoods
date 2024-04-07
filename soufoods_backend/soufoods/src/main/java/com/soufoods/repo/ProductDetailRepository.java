package com.soufoods.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soufoods.entity.Product;
import com.soufoods.entity.ProductDetail;

public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {

	@Query("from ProductDetail u where u.product = ?1 order by u.size")
	List<ProductDetail> findAllByProduct(Product product);
}
