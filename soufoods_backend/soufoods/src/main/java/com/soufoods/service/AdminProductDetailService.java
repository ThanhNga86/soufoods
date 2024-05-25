package com.soufoods.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.soufoods.entity.Product;
import com.soufoods.entity.ProductDetail;
import com.soufoods.repo.ProductDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminProductDetailService {
	private final ProductDetailRepository productDetailRepository;

	public List<ProductDetail> findAllByProduct(Product product) {
		List<ProductDetail> productDetails = productDetailRepository.findAllByProduct(product);
		return productDetails;
	}

	public Map<String, String> addProductDetail(ProductDetail productD) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();

		if (productD.getSize().isEmpty() || productD.getSize() == null) {
			map.put("size", "Vui lòng nhập size sản phẩm");
			check = false;
		}

		if (productD.getPrice() == null) {
			map.put("price", "Vui lòng nhập giá sản phẩm");
			check = false;
		} else if (productD.getPrice() < 0) {
			map.put("price", "Giá sản phẩm phải lớn hơn 0");
			check = false;
		}

		if (productD.getDiscount() == null) {
			map.put("discount", "Vui lòng nhập khuyến mãi");
			check = false;
		} else if (productD.getDiscount() < 0) {
			map.put("discount", "Giá trị Khuyến mãi phải lớn hơn 0");
			check = false;
		}

		if (productD.getQuantity() == null) {
			map.put("quantity", "Vui lòng nhập số lượng sản phẩm");
			check = false;
		} else if (productD.getQuantity() < 0) {
			map.put("quantity", "Số lượng sản phẩm phải lớn hơn 0");
			check = false;
		}

		if (productD.getProduct() == null) {
			map.put("quantity", "Vui lòng chọn id sản phẩm chính");
			check = false;
		}

		if (check) {
			productDetailRepository.save(productD);
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> updateProductDetail(ProductDetail productD) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();
		Optional<ProductDetail> productDetail = productDetailRepository.findById(productD.getId());

		if (productD.getId() == null || !productDetail.isPresent()) {
			map.put("id", "Không tìm thấy productId");
			check = false;
		}

		if (productD.getSize().isEmpty() || productD.getSize() == null) {
			map.put("size", "Vui lòng nhập size sản phẩm");
			check = false;
		}

		if (productD.getPrice() == null) {
			map.put("price", "Vui lòng nhập giá sản phẩm");
			check = false;
		} else if (productD.getPrice() < 0) {
			map.put("price", "Giá sản phẩm phải lớn hơn 0");
			check = false;
		}

		if (productD.getDiscount() == null) {
			map.put("discount", "Vui lòng nhập khuyến mãi");
			check = false;
		} else if (productD.getDiscount() < 0) {
			map.put("discount", "Giá trị Khuyến mãi phải lớn hơn 0");
			check = false;
		}

		if (productD.getQuantity() == null) {
			map.put("quantity", "Vui lòng nhập số lượng sản phẩm");
			check = false;
		} else if (productD.getQuantity() < 0) {
			map.put("quantity", "Số lượng sản phẩm phải lớn hơn 0");
			check = false;
		}

		if (productD.getProduct() == null) {
			map.put("quantity", "Vui lòng chọn id sản phẩm chính");
			check = false;
		}

		if (check) {
			map.put("status", "200");
			productDetail.get().setSize(productD.getSize());
			productDetail.get().setPrice(productD.getPrice());
			productDetail.get().setQuantity(productD.getQuantity());
			productDetail.get().setDiscount(productD.getDiscount());
			productDetail.get().setProduct(productD.getProduct());
			productDetail.get().setActive(productD.isActive());
			productDetailRepository.save(productD);
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> deleteProductDetail(Optional<Long> productDetailId) {
		Map<String, String> map = new HashMap<>();
		Optional<ProductDetail> productDetail = productDetailRepository.findById(productDetailId.get());
		if (productDetail.isPresent()) {
			try {
				productDetailRepository.delete(productDetail.get());
				map.put("status", "200");
			} catch (Exception e) {
				map.put("status", "401");
				map.put("error", "Không thể xóa sản phẩm chi tiết này.");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy sản phẩm chi tiết này.");
		}
		return map;
	}
}
