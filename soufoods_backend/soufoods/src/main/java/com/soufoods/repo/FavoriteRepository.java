package com.soufoods.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.Favorite;
import com.soufoods.entity.Product;
import com.soufoods.entity.User;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

	@Query("from Favorite f where f.product.active = true and f.user = :user order by f.id desc")
	Page<Favorite> findAllByUser(@Param("user") User user, Pageable page);
	
	@Query("from Favorite f where f.product.active = true and f.user = :user order by f.id desc")
	List<Favorite> findAllByUser(@Param("user") User user);
	
	@Query("from Favorite f where f.product = ?1 and f.user = ?2")
	Optional<Favorite> findByProductAndUser(Product product, User user);
	
}
