package com.soufoods.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soufoods.entity.Categories;
import com.soufoods.entity.CategoryDetail;

public interface CategoryDetailRepository extends JpaRepository<CategoryDetail, Long> {

	@Query("from CategoryDetail u where u.category = ?1")
	List<CategoryDetail> findAllByCategory(Categories categories);
}
