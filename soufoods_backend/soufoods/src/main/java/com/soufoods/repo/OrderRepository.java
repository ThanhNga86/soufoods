package com.soufoods.repo;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.Order;
import com.soufoods.entity.User;

public interface OrderRepository extends JpaRepository<Order, Long>{

	@Query("from Order u where u.status = 'Chờ xử lý' order by u.id desc")
	Page<Order> findAllByApply(Pageable page);
	
	@Query("from Order u where u.status <> 'Chờ xử lý' order by u.id desc")
	Page<Order> findAll(Pageable page);
	
	@Query("from Order u where u.status <> 'Chờ xử lý' and u.status <> 'Đã hủy' and u.status <> 'Trả hàng'")
	List<Order> findAllByUpdateStatus();
	
	@Query("from Order u where u.status = ?1 and u.user = ?2 order by u.id desc")
	Page<Order> findAllByStatus(String status, User user, Pageable page);
	
	@Query("from Order u where u.user = ?1 order by u.id desc")
	List<Order> findAllByStatus(User user);
	
	@Query("from Order u where "
			+ "(:id is null or u.id = :id) and (:search is null or u.email like %:search%) "
			+ "and (:orderDate is null or DATE(u.createDate) = :orderDate) "
			+ "and (:status is null or u.status = :status) and u.status <> 'Chờ xử lý' "
			+ "order by u.id desc")
	Page<Order> filter(@Param("id") Long id, @Param("search") String search, @Param("orderDate") Date orderDate,
			@Param("status") String status, Pageable page);
	
	@Query("from Order u where "
			+ "(:id is null or u.id = :id) and (:search is null or u.email like %:search%) "
			+ "and (:orderDate is null or DATE(u.createDate) = :orderDate) "
			+ "and (:status is null or u.status = :status) and u.status = 'Chờ xử lý' "
			+ "order by u.id desc")
	Page<Order> filterByWaitStatus(@Param("id") Long id, @Param("search") String search, @Param("orderDate") Date orderDate,
			@Param("status") String status, Pageable page);
	
	@Query("select count(u) from Order u where u.status = ?1")
	Long staticsByStatus(String status);
}
