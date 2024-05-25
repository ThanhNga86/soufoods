package com.soufoods.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soufoods.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

}
