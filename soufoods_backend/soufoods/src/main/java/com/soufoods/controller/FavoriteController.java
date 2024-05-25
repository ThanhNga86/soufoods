package com.soufoods.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
import com.soufoods.service.AwsS3Service;
import com.soufoods.service.JwtService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
	private final UserRepository userRepository;
	private final ProductRepository productRepository;
	private final FavoriteRepository favoriteRepository;
	private final AwsS3Service awsS3Service;
	private final JwtService jwtService;

	@GetMapping("")
	public ResponseEntity<?> favorites(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			FavoriteRequest request) {
		final String username = jwtService.extractUsername(request.getToken());
		Optional<User> user = userRepository.findByEmail(username);
		if (user.isPresent()) {
			int sizePage = 12;
			Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage, Sort.by("id").reverse());
			Page<Favorite> favorites = favoriteRepository.findAllByUser(user.get(), page);
			for (Favorite favorite : favorites.toList()) {
				favorite.getProduct().setImageUrl(awsS3Service.getFileS3(favorite.getProduct().getImage()));
			}
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

	@GetMapping("/all")
	public ResponseEntity<?> favoritesByAll(@RequestParam("token") String token) {
		final String username = jwtService.extractUsername(token);
		Optional<User> user = userRepository.findByEmail(username);
		if (user.isPresent()) {
			List<Favorite> favorites = favoriteRepository.findAllByUser(user.get());
			return ResponseEntity.ok(favorites);
		} else {
			return ResponseEntity.badRequest().build();
		}
	}

	@GetMapping("/findByProduct/{id}")
	public ResponseEntity<?> findByProduct(@PathVariable("id") Long productId) {
		Map<String, Object> map = new HashMap<>();
		Optional<Product> product = productRepository.findById(productId);

		if (product.isPresent()) {
			map.put("status", "200");
			product.get().setImageUrl(awsS3Service.getFileS3(product.get().getImage()));
			map.put("product", product);
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy mã sản phẩm này");
		}
		return ResponseEntity.ok(map);
	}

	@PostMapping("")
	public ResponseEntity<?> checkFavoriteBeforeLogin(@RequestBody FavoriteRequest request) {
		Map<String, Object> map = new HashMap<>();
		final String username = jwtService.extractUsername(request.getToken());
		Optional<User> user = userRepository.findByEmail(username);
		Optional<Product> product = productRepository.findById(request.getProductId());

		if (user.isPresent() && product.isPresent()) {
			Optional<Favorite> favorite = favoriteRepository.findByProductAndUser(product.get(), user.get());
			if (!favorite.isPresent()) {
				favoriteRepository.save(new Favorite(null, user.get(), product.get()));
				map.put("status", "200");
			} else {
				map.put("status", "401");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy người dùng hoặc mã sản phẩm này");
		}
		return ResponseEntity.ok(map);
	}

	@PutMapping("")
	public ResponseEntity<?> likeAndUnlike(@RequestBody FavoriteRequest request) {
		Map<String, Object> map = new HashMap<>();
		final String username = jwtService.extractUsername(request.getToken());
		Optional<User> user = userRepository.findByEmail(username);
		Optional<Product> product = productRepository.findById(request.getProductId());

		if (user.isPresent() && product.isPresent()) {
			Optional<Favorite> favorite = favoriteRepository.findByProductAndUser(product.get(), user.get());
			if (!favorite.isPresent()) {
				favoriteRepository.save(new Favorite(null, user.get(), product.get()));
				map.put("status", "200");
				map.put("favorite", "true");
			} else {
				favoriteRepository.delete(favorite.get());
				map.put("status", "200");
				map.put("favorite", "false");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy người dùng hoặc mã sản phẩm này");
		}
		return ResponseEntity.ok(map);
	}
}
