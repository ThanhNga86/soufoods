package com.soufoods.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.soufoods.entity.CategoryDetail;
import com.soufoods.entity.Product;
import com.soufoods.entity.ProductDetail;
import com.soufoods.model.CategoryDetailResponse;
import com.soufoods.repo.CategoryDetailRepository;
import com.soufoods.repo.OrderDetailRepository;
import com.soufoods.repo.ProductDetailRepository;
import com.soufoods.repo.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HomeService {
	private final CategoryDetailRepository categoryDetailRepository;
	private final ProductRepository productRepository;
	private final ProductDetailRepository productDetailRepository;
	private final OrderDetailRepository orderDetailRepository;
	private final AwsS3Service awsS3Service;
	
	public List<CategoryDetailResponse> findAllCategoryDetail() {
		List<CategoryDetailResponse> categoryDetails = new ArrayList<>();
		Integer productSize = 0;
		
		for (CategoryDetail categoryD : categoryDetailRepository.findAllCategoryDetail()) {
			categoryD.setImageUrl(awsS3Service.getFileS3(categoryD.getImage()));
			categoryDetails.add(new CategoryDetailResponse(categoryD.getId(), categoryD.getSize(), categoryD.getImage(), categoryD.getImageUrl(), categoryD.getListProduct().size()));
			productSize += categoryD.getListProduct().size();
		}
		return categoryDetails;
	}
	
	public List<Product> findAllPromotionProduct() {
		int sizePage = 36;
		Pageable page = PageRequest.of(0, sizePage, Sort.by("id").reverse());
		Page<Product> products = productRepository.findAllBySaleOff(page);
		List<Product> listProduct = products.toList();
		for (Product product : listProduct) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return listProduct;
	}
	
	public List<Product> findAllProductByCategory(String name) {
		int sizePage = 12;
		Pageable page = PageRequest.of(0, sizePage, Sort.by("id").reverse());
		Page<Product> products = productRepository.findAllProductByCategory(name, page);
		List<Product> listProduct = products.toList();
		for (Product product : listProduct) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return listProduct;
	}
	
	public List<Product> findALlSellingProducts() {
		int sizePage = 12;
		Pageable page = PageRequest.of(0, sizePage);
		Page<Product> products = orderDetailRepository.findAllSellingProducts(page);
		List<Product> listProduct = products.toList();
		for (Product product : listProduct) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return listProduct;
	}
	
	public List<ProductDetail> findAllByProduct(Product product) {
		List<ProductDetail> productDetails = productDetailRepository.findAllByProduct(product);
		productDetails = productDetails.stream().filter(p -> p.isActive() == true).toList();
		return productDetails;
	}
}
