package com.soufoods.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soufoods.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

}
