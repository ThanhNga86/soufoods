package com.soufoods.controller;

import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.soufoods.entity.Categories;
import com.soufoods.entity.CategoryDetail;
import com.soufoods.entity.Product;
import com.soufoods.model.AdminProductResponse;
import com.soufoods.model.CategoryDetailResponse;
import com.soufoods.model.FilterProducByCategorytRequest;
import com.soufoods.repo.CategoryDetailRepository;
import com.soufoods.repo.CategoryRepository;
import com.soufoods.repo.OrderDetailRepository;
import com.soufoods.repo.ProductDetailRepository;
import com.soufoods.repo.ProductRepository;
import com.soufoods.service.AwsS3Service;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {
	private final CategoryRepository categoryRepository;
	private final CategoryDetailRepository categoryDetailRepository;
	private final ProductRepository productRepository;
	private final ProductDetailRepository productDetailRepository;
	private final OrderDetailRepository orderDetailRepository;
	private final AwsS3Service awsS3Service;

	@GetMapping("")
	public ResponseEntity<?> categories() {
		List<Categories> categories = categoryRepository.findAll().stream().filter(c -> c.isActive()).toList();
		for (Categories category : categories) {
			category.setImageUrl(awsS3Service.getFileS3(category.getImage()));
		}
		return ResponseEntity.ok(categories);
	}

	@GetMapping("/categoryDetails")
	public ResponseEntity<?> categoryDetails() {
		List<CategoryDetailResponse> categoryDetails = new ArrayList<>();
		Integer productSize = 0;

		for (CategoryDetail categoryD : categoryDetailRepository.findAllCategoryDetail()) {
			categoryD.setImageUrl(awsS3Service.getFileS3(categoryD.getImage()));
			categoryDetails.add(new CategoryDetailResponse(categoryD.getId(), categoryD.getSize(), categoryD.getImage(),
					categoryD.getImageUrl(), categoryD.getListProduct().size()));
			productSize += categoryD.getListProduct().size();
		}
		categoryDetails.add(0,
				new CategoryDetailResponse(-2l, "Sản phẩm bán chạy", "best-seller.png",
						awsS3Service.getFileS3("best-seller.png"),
						(int) orderDetailRepository.findAllSellingProducts(PageRequest.of(0, 12)).getTotalElements()));
		categoryDetails.add(0,
				new CategoryDetailResponse(-1l, "Sản phẩm ưu đãi", "sale-off.png",
						awsS3Service.getFileS3("sale-off.png"),
						(int) productRepository.findAllBySaleOff(PageRequest.of(0, 12)).getTotalElements()));
		categoryDetails.add(0, new CategoryDetailResponse(0l, "Tất cả sản phẩm", "tat-ca-san-pham.png",
				awsS3Service.getFileS3("tat-ca-san-pham.png"), productSize));
		return ResponseEntity.ok(categoryDetails);
	}

	@GetMapping("/findAllByCategory/{id}")
	public ResponseEntity<?> findAllByCategory(@PathVariable("id") Categories categories) {
		List<CategoryDetail> categoryDetails = categoryDetailRepository.findAllByCategory(categories).stream()
				.filter(c -> c.isActive()).toList();
		for (CategoryDetail categoryD : categoryDetails) {
			categoryD.setImageUrl(awsS3Service.getFileS3(categoryD.getImage()));
		}
		return ResponseEntity.ok(categoryDetails);
	}

	@PostMapping("/filterProductByCategory")
	public ResponseEntity<?> filterProductsByCategory(@RequestBody FilterProducByCategorytRequest request) {
		long total = 0;
		int sizePage = 16;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		List<Product> listProduct = new ArrayList<>();
		if (request.getCategoryDetailId() == -2l) { // Sản phẩm bán chạy
			Page<Product> products = orderDetailRepository.filterProductBySellingProducts(request.getQuantity(), request.getDiscount(),
					request.getMinPrice(), request.getMaxPrice(), page);
			total = products.getTotalElements();
			listProduct = products.toList();
		} else if (request.getCategoryDetailId() == -1l) { // Sản phẩm ưu đãi
			Page<Product> products = productRepository.filterProductBySaleOff(request.getQuantity(), request.getDiscount(),
					request.getMinPrice(), request.getMaxPrice(), page);
			total = products.getTotalElements();
			listProduct = products.toList();
		} else if (request.getCategoryDetailId() == 0l) { // Tất cả sản phẩm
			Page<Product> products = productRepository.filterProductByAll(request.getQuantity(), request.getDiscount(),
					request.getMinPrice(), request.getMaxPrice(), page);
			total = products.getTotalElements();
			listProduct = products.toList();
		} else { // Sản phẩm theo danh mục
			Page<Product> products = productRepository.filterProductByCategory(request.getCategoryDetailId(),
					request.getQuantity(), request.getDiscount(), request.getMinPrice(), request.getMaxPrice(), page);
			total = products.getTotalElements();
			listProduct = products.toList();
		}

		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}

		for (Product product : listProduct) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return ResponseEntity
				.ok(AdminProductResponse.builder().total(total).totalPage(totalPage).products(listProduct).build());
	}

	@GetMapping("/maxPrice/{categoryDetailId}")
	public ResponseEntity<?> minAndMaxPrice(@PathVariable("categoryDetailId") Optional<Long> id) {
		Map<String, Double> map = new HashMap<>();
		if (id.isPresent()) {
			if (id.get() == -2l) { // Sản phẩm bán chạy
				map.put("maxPrice", orderDetailRepository.maxPriceBySellingProducts(id.get()));
			} else if (id.get() == -1l) { // Sản phẩm ưu đãi
				map.put("maxPrice", productDetailRepository.maxPriceBySaleOff(id.get()));
			} else if (id.get() == 0l) { // Tất cả sản phẩm
				map.put("maxPrice", productDetailRepository.maxPriceByAll(id.get()));
			} else { // Sản phẩm theo danh mục
				map.put("maxPrice", productDetailRepository.maxPriceByCategory(id.get()));
			}
		}
		return ResponseEntity.ok(map);
	}

	@GetMapping("/products/{id}")
	public ResponseEntity<?> productsByCategory(@PathVariable("id") Optional<Long> id,
			@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("sizePage") Optional<Integer> sizePage1) {
		if (id.isPresent()) {
			long total = 0;
			int sizePage = sizePage1.orElse(16);
			Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
			List<Product> listProduct = new ArrayList<>();
			if (id.get() == -2l) { // Sản phẩm bán chạy
				Page<Product> products = orderDetailRepository.findAllSellingProducts(page);
				total = products.getTotalElements();
				listProduct = products.toList();
			} else if (id.get() == -1l) { // Sản phẩm ưu đãi
				Page<Product> products = productRepository.findAllBySaleOff(page);
				total = products.getTotalElements();
				listProduct = products.toList();
			} else if (id.get() == 0l) { // Tất cả sản phẩm
				Page<Product> products = productRepository.findAll(page);
				total = products.getTotalElements();
				listProduct = products.toList();
			} else { // Sản phẩm theo danh mục
				Page<Product> products = productRepository.findAllProductByCategoryId(id.get(), page);
				total = products.getTotalElements();
				listProduct = products.toList();
			}

			int totalPage = (int) (total / sizePage);
			if (total % sizePage != 0) {
				totalPage++;
			}

			for (Product product : listProduct) {
				product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
			}
			return ResponseEntity
					.ok(AdminProductResponse.builder().total(total).totalPage(totalPage).products(listProduct).build());
		} else {
			return ResponseEntity.badRequest().build();
		}
	}
}
