package com.soufoods.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soufoods.entity.Voucher;

public interface VoucherRepository extends JpaRepository<Voucher, Long>{

}
