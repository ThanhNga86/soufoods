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

	@Query("from Product u where u.id <> ?1 and u.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by RAND()")
	List<Product> produitSimilaire(Long productId);

	@Query("from Product u where u.categoryDetail = ?1")
	List<Product> findAllByCategory(CategoryDetail categoryD);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd where "
			+ "(:id is null or u.id = :id) and (:name is null or u.name like %:name%) "
			+ "and (:quantity is null or (:quantity = 0 and pd.quantity = 0) or (:quantity = 1 and pd.quantity > 0)) "
			+ "and (:discount is null or (:discount = 0 and pd.discount = 0) or (:discount = 1 and pd.discount > 0)) "
			+ "and (:active is null or u.active = :active) " + "and (:activePd is null or pd.active = :activePd) "
			+ "and (:category is null or u.categoryDetail.category.id = :category) "
			+ "and (:categoryDetail is null or u.categoryDetail.id = :categoryDetail) " + "order by u.id desc")
	Page<Product> filterProduct(@Param("id") Long id, @Param("name") String name, @Param("quantity") Integer quantity,
			@Param("discount") Double discount, @Param("active") Boolean active, @Param("activePd") Boolean activePd,
			@Param("category") Long categoryId, @Param("categoryDetail") Long categoryDetailId, Pageable page);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd "
			+ "where pd.discount > 0 and u.active = true and pd.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> findAllBySaleOff(Pageable page);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd "
			+ "where u.categoryDetail.category.name like %:name and u.active = true and pd.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> findAllProductByCategory(@Param("name") String name, Pageable page);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd "
			+ "where u.categoryDetail.id = :id and u.active = true and pd.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> findAllProductByCategoryId(@Param("id") Long id, Pageable page);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd where " + "pd.discount > 0 "
			+ "and (:quantity is null or (:quantity = 0 and pd.quantity = 0) or (:quantity = 1 and pd.quantity > 0)) "
			+ "and (:discount is null or (:discount = 0 and pd.discount = 0) or (:discount = 1 and pd.discount > 0)) "
			+ "and (pd.price between :minPrice and :maxPrice) "
			+ "and pd.active = true and u.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> filterProductBySaleOff(@Param("quantity") Integer quantity, @Param("discount") Double discount,
			@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable page);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd where "
			+ "(:quantity is null or (:quantity = 0 and pd.quantity = 0) or (:quantity = 1 and pd.quantity > 0)) "
			+ "and (:discount is null or (:discount = 0 and pd.discount = 0) or (:discount = 1 and pd.discount > 0)) "
			+ "and (pd.price between :minPrice and :maxPrice) "
			+ "and pd.active = true and u.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> filterProductByAll(@Param("quantity") Integer quantity, @Param("discount") Double discount,
			@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable page);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd where "
			+ "(:categoryDetailId is null or u.categoryDetail.id = :categoryDetailId) "
			+ "and (:quantity is null or (:quantity = 0 and pd.quantity = 0) or (:quantity = 1 and pd.quantity > 0)) "
			+ "and (:discount is null or (:discount = 0 and pd.discount = 0) or (:discount = 1 and pd.discount > 0)) "
			+ "and (pd.price between :minPrice and :maxPrice) "
			+ "and pd.active = true and u.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> filterProductByCategory(@Param("categoryDetailId") Long categoryDetailId,
			@Param("quantity") Integer quantity, @Param("discount") Double discount, @Param("minPrice") Double minPrice,
			@Param("maxPrice") Double maxPrice, Pageable page);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd where "
			+ "(:search is null or u.name like %:search%) "
			+ "and pd.active = true and u.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> productSearch(@Param("search") String search, Pageable page);

	@Query("select distinct u from Product u LEFT JOIN FETCH u.listProductDetails pd where "
			+ "(:search is null or u.name like %:search%) "
			+ "and (:quantity is null or (:quantity = 0 and pd.quantity = 0) or (:quantity = 1 and pd.quantity > 0)) "
			+ "and (:discount is null or (:discount = 0 and pd.discount = 0) or (:discount = 1 and pd.discount > 0)) "
			+ "and (pd.price between :minPrice and :maxPrice) "
			+ "and pd.active = true and u.active = true and u.categoryDetail.active = true and u.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> filterProductBySearch(@Param("search") String search, @Param("quantity") Integer quantity,
			@Param("discount") Double discount, @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice,
			Pageable page);
	
	@Query("select count(u) from Product u where u.active = false")
	Long staticsByStopSelling();
}
