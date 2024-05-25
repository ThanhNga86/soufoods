package com.soufoods.repo;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.soufoods.entity.ForgotPassword;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, Long> {

	@Query("from ForgotPassword f WHERE f.expiration < ?1")
    public List<ForgotPassword> findAllByExpired(Date currentDate);
	
	public Optional<ForgotPassword> findByIdAndValidCode(Long id, String validCode);
}
