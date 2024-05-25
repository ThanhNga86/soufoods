package com.soufoods.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Product;
import com.soufoods.entity.ProductDetail;
import com.soufoods.repo.ProductDetailRepository;
import com.soufoods.repo.ProductRepository;
import com.soufoods.service.AwsS3Service;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/product")
public class ProductController {
	private final ProductRepository productRepository;
	private final ProductDetailRepository productDetailRepository;
	private final AwsS3Service awsS3Service;

	@GetMapping("/similaire")
	public ResponseEntity<?> produitSimilaire(@RequestParam("productId") Long productId){
		List<Product> products = productRepository.produitSimilaire(productId);
		int sizePage = 36;
		if(products.size() > sizePage) {
			products = products.subList(0, sizePage);
		}
		
		for (Product product : products) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return ResponseEntity.ok(products);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<?> productById(@PathVariable("id") Long id) {
		Map<String, Object> map = new HashMap<>();
		Optional<Product> product = productRepository.findById(id);
		if (product.isPresent()) {
			product.get().setImageUrl(awsS3Service.getFileS3(product.get().getImage()));
			map.put("product", product.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy mã sản phẩm này");
		}
		return ResponseEntity.ok(map);
	}
	
	@GetMapping("/detail/{id}")
	public ResponseEntity<?> productDetailById(@PathVariable("id") Long id) {
		Map<String, Object> map = new HashMap<>();
		Optional<ProductDetail> productDetail = productDetailRepository.findById(id);
		if (productDetail.isPresent()) {
			map.put("productDetail", productDetail.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy mã sản phẩm chi tiết này");
		}
		return ResponseEntity.ok(map);
	}
}
