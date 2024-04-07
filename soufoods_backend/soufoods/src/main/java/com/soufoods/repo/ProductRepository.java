package com.soufoods.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.CategoryDetail;
import com.soufoods.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

	@Query("from Product order by RAND()")
	List<Product> produitSimilaire();
	
	@Query("from Product u where u.categoryDetail = ?1")
	List<Product> findAllByCategory(CategoryDetail categoryD);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd where "
			+ "(:id is null or u.id = :id) "
			+ "and (:name is null or u.name like %:name%) "
			+ "and (:quantity is null or (:quantity = 0 and pd.quantity = 0) or (:quantity = 1 and pd.quantity > 0)) "
			+ "and (:discount is null or (:discount = 0 and pd.discount = 0) or (:discount = 1 and pd.discount > 0)) "
			+ "and (:active is null or u.active = :active) " 
			+ "and (:activePd is null or pd.active = :activePd) " 
			+ "and (:category is null or u.categoryDetail.category.id = :category) "
			+ "and (:categoryDetail is null or u.categoryDetail.id = :categoryDetail) "
			+ "order by u.id desc")
	Page<Product> filterProduct(@Param("id") Long id, @Param("name") String name, @Param("quantity") Integer quantity, @Param("discount") Double discount , @Param("active") Boolean active,
			@Param("activePd") Boolean activePd, @Param("category") Long categoryId, @Param("categoryDetail") Long categoryDetailId, Pageable page);
	
}
