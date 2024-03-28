package com.soufoods.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Product;
import com.soufoods.model.ProductResponse;
import com.soufoods.repo.ProductRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
	private final ProductRepository productRepository;

	@GetMapping("")
	public ResponseEntity<?> products(@RequestParam("page") Optional<Integer> pageNumber) {
		int sizePage = 12;
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		Page<Product> products = productRepository.findAll(page);
		long total = products.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return ResponseEntity.ok(ProductResponse.builder().total(total).totalPage(totalPage).products(products.toList()).build());
	}

	@GetMapping("/similaire")
	public ResponseEntity<?> produitSimilaire(){
		List<Product> products = productRepository.produitSimilaire();
		int sizePage = 25;
		if(products.size() > sizePage) {
			products = products.subList(0, sizePage);
		}
		return ResponseEntity.ok(products);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<?> productById(@PathVariable("id") Optional<Long> id) {
		if (id.isPresent()) {
			Optional<Product> product = productRepository.findAll().stream().filter(p -> p.getId() == id.get()).findFirst();
			if(product.isPresent()) {
				return ResponseEntity.ok(product.get());
			} else {
				return ResponseEntity.badRequest().build();
			}
		} else {
			return ResponseEntity.badRequest().build();
		}
	}
}
