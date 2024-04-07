package com.soufoods.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	private final JwtAuthenticationFilter authenticationFilter;
	private final AuthenticationProvider authenticationProvider;

	@SuppressWarnings("removal")
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(
			configurer -> configurer
			.requestMatchers("/api/authentication/**").permitAll()
			.requestMatchers("/api/images/**").permitAll()
			.requestMatchers(HttpMethod.POST, "/api/user").permitAll()
			.requestMatchers(HttpMethod.PUT, "/api/user").authenticated()
			.requestMatchers("/api/user/change-password").authenticated()
			.requestMatchers("/api/categories/**").permitAll()
			.requestMatchers("/api/products/**").permitAll()
			.requestMatchers("/api/favorites/**").authenticated()
			.requestMatchers("/api/user/forgot-password").permitAll()
			.requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
			.anyRequest().authenticated()
			).sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			.and()
			.authenticationProvider(authenticationProvider)
			.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);
		http.rememberMe().tokenValiditySeconds(60 * 60 * 24 * 7);
		http.csrf(csrf -> csrf.disable());
		return http.build();
	}
}
