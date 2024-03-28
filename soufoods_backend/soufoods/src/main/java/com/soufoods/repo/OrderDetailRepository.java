package com.soufoods.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soufoods.entity.OrderDetail;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

}
