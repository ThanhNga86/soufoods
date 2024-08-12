package com.soufoods.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Product;
import com.soufoods.model.AdminProductResponse;
import com.soufoods.model.FilterProductBySearchRequest;
import com.soufoods.repo.ProductDetailRepository;
import com.soufoods.repo.ProductRepository;
import com.soufoods.service.AwsS3Service;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
	private final ProductRepository productRepository;
	private final ProductDetailRepository productDetailRepository;
	private final AwsS3Service awsS3Service;

	@PostMapping("")
	public ResponseEntity<?> productSearch(@RequestBody FilterProductBySearchRequest request) {
		int sizePage = 8;
		Pageable page = PageRequest.of(0, sizePage);
		Page<Product> products = productRepository.productSearch(request.getSearch(), page);
		long total = products.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}

		List<Product> listProduct = products.toList();
		for (Product product : listProduct) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return ResponseEntity
				.ok(AdminProductResponse.builder().total(total).totalPage(totalPage).products(listProduct).build());
	}

	@PostMapping("/filter")
	public ResponseEntity<?> filterProductBySearch(@RequestBody FilterProductBySearchRequest request) {
		int sizePage = 12;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		Page<Product> products = productRepository.filterProductBySearch(request.getSearch(), request.getQuantity(),
				request.getDiscount(), request.getMinPrice(), request.getMaxPrice(), page);
		long total = products.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}

		List<Product> listProduct = products.toList();
		for (Product product : listProduct) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return ResponseEntity
				.ok(AdminProductResponse.builder().total(total).totalPage(totalPage).products(listProduct).build());
	}

	@GetMapping("/maxPrice/{search}")
	public ResponseEntity<?> minAndMaxPrice(@PathVariable("search") Optional<String> search) {
		Map<String, Double> map = new HashMap<>();
		if (search.isPresent()) {
			map.put("maxPrice", productDetailRepository.maxPriceBySearch(search.get()));
		}
		return ResponseEntity.ok(map);
	}
}
