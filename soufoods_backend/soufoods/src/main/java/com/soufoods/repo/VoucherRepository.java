package com.soufoods.repo;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.Voucher;

public interface VoucherRepository extends JpaRepository<Voucher, Long>{

	public Optional<Voucher> findByDiscountCode(String discountCode);
	
	@Query("from Voucher u where "
			+ "(:id is null or u.id = :id) and (:email is null or u.user.email like %:email%) "
			+ "and (:active is null or u.active = :active) "
			+ "and (:freeShip is null or u.freeShip = :freeShip) "
			+ "and (:expiration is null or (:expiration = 0 and u.expiration <= current_date) or (:expiration = 1 and u.expiration > current_date)) "
			+ "and (:expirationDate is null or u.expiration = :expirationDate) " 
			+ "order by u.id desc")
	Page<Voucher> filterVoucher(@Param("id") Long id, @Param("email") String email, @Param("active") Boolean active, @Param("freeShip") Boolean freeShip,
			@Param("expiration") Integer expiration, @Param("expirationDate") Date expirationDate, Pageable page);
	
	@Query("from Voucher u where "
			+ "u.user.email = ?1 and u.expiration > current_date and u.active = false "
			+ "order by u.expiration")
	Page<Voucher> findAllByUser(String email, Pageable page);
	
	@Query("from Voucher u where "
			+ "u.expiration <= current_date and u.active = false and messageType = 'local' "
			+ "order by u.expiration")
	List<Voucher> findAllByExpiration();
	
	@Query("select count(u) from Voucher u where u.active = true")
	Long staticsByActived();
	
	@Query("select count(u) from Voucher u where u.active = false")
	Long staticsByUnActived();
}
