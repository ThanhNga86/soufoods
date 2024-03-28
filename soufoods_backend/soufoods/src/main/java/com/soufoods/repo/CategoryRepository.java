package com.soufoods.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.Categories;

public interface CategoryRepository extends JpaRepository<Categories, Long> {

	@Query("from Categories u where " + "(:search is null or u.name like %:search%) "
			+ "and (:active is null or u.active = :active) " 
			+ "order by u.id desc")
	Page<Categories> filterCategory(@Param("search") String search,
			 @Param("active") Boolean active, Pageable page);
}
