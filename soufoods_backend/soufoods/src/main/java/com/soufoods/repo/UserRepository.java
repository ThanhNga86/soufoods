package com.soufoods.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

	@Query("from User u where u.role <> 'ROLE_ADMIN'")
	Page<User> findAll(Pageable page);
	
	Optional<User> findByEmail(String email);

	@Query("from User u where u.email like %:email% and u.role <> 'ROLE_ADMIN'")
	List<User> findAllByEmail(@Param("email") String email);
	
	@Query("from User u where " + "(:search is null or u.email like %:search%) "
			+ "and u.role <> 'ROLE_ADMIN'" 
			+ "and (:active is null or u.active = :active) "
			+ "order by u.id desc")
	Page<User> filterUser(@Param("search") String search, @Param("active") Boolean active, Pageable page);
	
	@Query("select count(u) from User u where u.active = true")
	Long staticsByActived();
	
	@Query("select count(u) from User u where u.active = false")
	Long staticsByUnActived();
}
