package com.soufoods.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

	@Query("from Review u where " 
			+ "(:id is null or u.id = :id) " 
			+ "and (:search is null or u.content like %:search%) "
			+ "and (:rates is null or u.rate in (:rates)) " 
			+ "and (:active is null or u.active = :active) "
			+ "order by u.id desc")
	Page<Review> filter(@Param("id") Long id, @Param("search") String search,
			@Param("rates") List<Integer> rates, @Param("active") Boolean active, Pageable page);
	
	@Query("from Review u where "
			+ "u.product.id = ?1 and u.active = true order by u.createDate desc")
	Page<Review> findAllByProduct(Long productId, Pageable page);
	
	@Query("from Review u where "
			+ "u.product.id = ?1 and u.active = true order by u.createDate desc")
	List<Review> findAllByProduct(Long productId);
	
	@Query("select count(u) from Review u where (:rate = true and u.rate >= 4) or (:rate = false and u.rate < 4)")
	Long staticsByRate(boolean rate);
}
