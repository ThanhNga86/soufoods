package com.soufoods.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soufoods.entity.Images;
import com.soufoods.entity.Product;
import com.soufoods.entity.Review;

public interface ImagesRepository extends JpaRepository<Images, Long> {
	
	@Query("from Images u where u.product = ?1")
	public List<Images> findAllByProduct(Product product);
	
	@Query("from Images u where u.review = ?1")
	public List<Images> findAllByReview(Review review);
}
