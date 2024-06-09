package com.soufoods.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.model.AuthenticationRequest;
import com.soufoods.model.AuthenticationResponse;
import com.soufoods.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/authentication")
public class AuthenticationController {
	private final UserService userService;
	
	@PostMapping("")
	public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request){
		return ResponseEntity.ok(userService.login(request));
	}
	
	@PostMapping("/oauth2")
	public ResponseEntity<AuthenticationResponse> loginWithOAuth2(@RequestBody AuthenticationRequest request){
		return ResponseEntity.ok(userService.loginWithOAhtu2(request));
	}
	
	@PostMapping("/refresh")
	public ResponseEntity<?> refreshtoken(HttpServletRequest request) {
		AuthenticationResponse newAccessToken = userService.refreshToken(request);
        if (newAccessToken != null) {
            return ResponseEntity.ok(newAccessToken);
        } else {
        	return ResponseEntity.ok("Refresh token không hợp lệ hoặc đã hết hạn !");
        }
	}
	
	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
	    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
	    if (auth != null) {
	        new SecurityContextLogoutHandler().logout(request, response, auth);
	    }
	    return ResponseEntity.ok("logout success !");
	}
}
