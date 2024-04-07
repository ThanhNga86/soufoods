package com.soufoods.controller;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Favorite;
import com.soufoods.entity.Product;
import com.soufoods.entity.User;
import com.soufoods.model.FavoriteRequest;
import com.soufoods.model.FavoriteResponse;
import com.soufoods.repo.FavoriteRepository;
import com.soufoods.repo.ProductRepository;
import com.soufoods.repo.UserRepository;
import com.soufoods.service.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
	private final UserRepository userRepository;
	private final ProductRepository productRepository;
	private final FavoriteRepository favoriteRepository;
	private final JwtService jwtService;

	@GetMapping("")
	public ResponseEntity<?> favorites(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			FavoriteRequest request) {
		final String username = jwtService.extractUsername(request.getToken());
		Optional<User> user = userRepository.findByEmail(username);
		if (user.isPresent()) {
			int sizePage = 12;
			Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
			Page<Favorite> favorites = favoriteRepository.findAllByEmail(user.get(), page);
			long total = favorites.getTotalElements();
			int totalPage = (int) (total / sizePage);
			if (total % sizePage != 0) {
				totalPage++;
			}
			return ResponseEntity.ok(
					FavoriteResponse.builder().total(total).totalPage(totalPage).favorites(favorites.toList()).build());
		} else {
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> favoriteById(@PathVariable("id") Optional<Long> id) {
		if (id.isPresent()) {
			Optional<Product> product = favoriteRepository.findAll().stream().map(Favorite::getProduct)
					.filter(p -> p.getId() == id.get()).findFirst();
			if (product.isPresent()) {
				return ResponseEntity.ok(product.get());
			} else {
				return ResponseEntity.badRequest().build();
			}
		} else {
			return ResponseEntity.badRequest().build();
		}
	}

	@PostMapping("")
	public ResponseEntity<?> likeAndUnlike(FavoriteRequest request) {
		final String username = jwtService.extractUsername(request.getToken());
		Optional<User> user = userRepository.findByEmail(username);
		Optional<Product> product = productRepository.findById(request.getProductId());

		if (user.isPresent() && product.isPresent()) {
			Optional<Favorite> favorite = favoriteRepository.findByProductAndUser(product.get(), user.get());
			if (!favorite.isPresent()) {
				favoriteRepository.save(new Favorite(null, user.get(), product.get()));
				return ResponseEntity.ok("Like");
			} else {
				favoriteRepository.delete(favorite.get());
				return ResponseEntity.ok("Unlike");
			}
		} else {
			return ResponseEntity.ok("Không tìm thấy username hoặc product");
		}
	}
}
