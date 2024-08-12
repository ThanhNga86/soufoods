package com.soufoods.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soufoods.entity.Product;
import com.soufoods.entity.ProductDetail;

public interface ProductDetailRepository extends JpaRepository<ProductDetail, Long> {

	@Query("from ProductDetail u where u.product = ?1 order by u.size")
	List<ProductDetail> findAllByProduct(Product product);
	
	@Query("select max(u.price) from ProductDetail u where "
			+ "u.discount > 0 and u.active = true and u.product.active = true and u.product.categoryDetail.active = true and u.product.categoryDetail.category.active = true")
	Double maxPriceBySaleOff(Long id);
	
	@Query("select max(u.price) from ProductDetail u where "
			+ "u.active = true and u.product.active = true and u.product.categoryDetail.active = true and u.product.categoryDetail.category.active = true")
	Double maxPriceByAll(Long id);

	@Query("select max(u.price) from ProductDetail u where " 
			+ "u.product.categoryDetail.id = ?1 and u.active = true and u.product.active = true and u.product.categoryDetail.active = true and u.product.categoryDetail.category.active = true")
	Double maxPriceByCategory(Long id);
	
	@Query("select max(u.price) from ProductDetail u where "
			+ "u.product.name like %?1% and u.active = true and u.product.active = true and u.product.categoryDetail.active = true and u.product.categoryDetail.category.active = true")
	Double maxPriceBySearch(String search);
	
	@Query("select count(u) from ProductDetail u where u.quantity > 0 and u.active = true")
	Long staticsByOnSale();
	
	@Query("select count(u) from ProductDetail u where u.active = false")
	Long staticsByStopSelling();
	
	@Query("select count(u) from ProductDetail u where u.quantity = 0")
	Long staticsByOutStock();
}
