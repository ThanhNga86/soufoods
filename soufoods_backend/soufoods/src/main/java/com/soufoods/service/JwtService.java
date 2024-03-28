package com.soufoods.service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.soufoods.repo.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {
	private final UserRepository userRepository;
	private static final String SECRET_KEY = "ff3f6456b05bf52cff02fb35f9355bf71167212a64158a1a9d768da3212d2f76";

	// trich xuat username
	public String extractUsername(String token) {
		try {
			return extractAllClaims(token, Claims::getSubject);
		} catch (Exception e) {
			return null;
		}
	}

	// trich xuat thong tin Claims (Token info)
	private <T> T extractAllClaims(String token, Function<Claims, T> claimsR) {
		return claimsR.apply(extractAllClaims(token));
	}

	// ky va ma hoa token
	private Claims extractAllClaims(String token) {
		return Jwts
				.parserBuilder()
				.setSigningKey(getSigIngKey())
				.build()
				.parseClaimsJws(token).getBody();
	}

	// tao va ma hoa token
	public String generateToken(UserDetails userDetails) {
		Map<String, Object> extractClaims = new HashMap<>();
		var user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
		extractClaims.put("role", user.getRole());
		extractClaims.put("name", user.getFirstName());
		return Jwts.builder()
				.setClaims(extractClaims)
				.setSubject(userDetails.getUsername())
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 1))
				.signWith(getSigIngKey(), SignatureAlgorithm.HS256).compact();
	}

	// refresh token
	public String generateRefreshToken(UserDetails userDetails) {
		return Jwts.builder()
				.setSubject(userDetails.getUsername())
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24 * 7))
				.signWith(getSigIngKey(), SignatureAlgorithm.HS256).compact();
	}

	// xac thuc token va username
	public boolean isValidToken(String token, UserDetails userDetails) {
		final String username = extractUsername(token);
		return (username.equals(userDetails.getUsername()) && !isValidExpired(token));
	}

	// xac thuc thoi gian het han voi thoi gian hien tai
	public boolean isValidExpired(String token) {
		return extractExpired(token).before(new Date());
	}

	// trich xuat thoi gian het han
	private Date extractExpired(String token) {
		try {
			return extractAllClaims(token, Claims::getExpiration);
		} catch (ExpiredJwtException e) {
			Date expiredAt = e.getClaims().getExpiration();
			return expiredAt;
		}
	}

	// ma hoa token
	private Key getSigIngKey() {
		return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_KEY));
	}
}
