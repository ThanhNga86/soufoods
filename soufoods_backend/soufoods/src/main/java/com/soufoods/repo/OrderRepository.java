package com.soufoods.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soufoods.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long>{

}
