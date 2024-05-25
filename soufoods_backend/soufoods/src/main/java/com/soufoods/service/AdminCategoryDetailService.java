package com.soufoods.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.soufoods.entity.Categories;
import com.soufoods.entity.CategoryDetail;
import com.soufoods.entity.Images;
import com.soufoods.entity.Product;
import com.soufoods.entity.Review;
import com.soufoods.repo.CategoryDetailRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCategoryDetailService {
	private final CategoryDetailRepository categoryDetailRepository;
	private final AwsS3Service awsS3Service;

	public List<CategoryDetail> findAllByCategory(Categories categories) {
		List<CategoryDetail> categoryDetails = categoryDetailRepository.findAllByCategory(categories);
		for (CategoryDetail categoryDetail : categoryDetails) {
			categoryDetail.setImageUrl(awsS3Service.getFileS3(categoryDetail.getImage()));
		}
		return categoryDetails;
	}

	public List<CategoryDetail> findAll() {
		List<CategoryDetail> categoryDetails = categoryDetailRepository.findAll();
		for (CategoryDetail categoryDetail : categoryDetails) {
			categoryDetail.setImageUrl(awsS3Service.getFileS3(categoryDetail.getImage()));
		}
		return categoryDetails;
	}

	public Map<String, String> addCategoryDetail(CategoryDetail categoryD, Optional<MultipartFile> fileImage) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();
		if (categoryD.getSize() == null || categoryD.getSize().isEmpty()) {
			map.put("size", "Vui lòng nhập loại sản phẩm");
			check = false;
		}

		if (!fileImage.isPresent() || fileImage == null) {
			map.put("images", "Vui lòng chọn hình ảnh");
			check = false;
		}

		if (check) {
			categoryD.setImage(awsS3Service.uploadFileS3(fileImage.get()));
			categoryDetailRepository.save(categoryD);
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> updateCategoryDetail(CategoryDetail categoryD,
			Optional<MultipartFile> fileImage) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();

		Optional<CategoryDetail> categoryDetailId = categoryDetailRepository.findById(categoryD.getId());
		if (!categoryDetailId.isPresent()) {
			map.put("error", "Không tìm thấy id");
			check = false;
		}

		if (categoryD.getSize() == null || categoryD.getSize().isEmpty()) {
			map.put("size", "Vui lòng nhập loại sản phẩm");
			check = false;
		}

		if (check) {
			categoryDetailId.get().setSize(categoryD.getSize());
			categoryDetailId.get().setActive(categoryD.isActive());
			if (fileImage.isPresent()) {
				awsS3Service.deleteFileS3(categoryDetailId.get().getImage());
				categoryDetailId.get().setImage(awsS3Service.uploadFileS3(fileImage.get()));
			}
			categoryDetailRepository.saveAndFlush(categoryDetailId.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> deleteCategoryDetail(Optional<Long> categoryDetailId) {
		Map<String, String> map = new HashMap<>();
		Optional<CategoryDetail> category = categoryDetailRepository.findById(categoryDetailId.get());
		if (category.isPresent()) {
			try {
				List<String> images = new ArrayList<>();
				for (Product product : category.get().getListProduct()) {
					images.add(product.getImage());
					for (Images image : product.getListImages()) {
						images.add(image.getName());
					}

					for (Review review : product.getListReview()) {
						for (Images image : review.getListImages()) {
							images.add(image.getName());
						}
					}
				}

				categoryDetailRepository.delete(category.get());
				awsS3Service.deleteFileS3(category.get().getImage());
				
				if (!images.isEmpty()) {
					for (String image : images) {
						awsS3Service.deleteFileS3(image);
					}
				}
				map.put("status", "200");
			} catch (Exception e) {
				map.put("status", "401");
				map.put("error", "Không thể xóa loại sản phẩm này");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy loại sản phẩm này.");
		}
		return map;
	}
}
