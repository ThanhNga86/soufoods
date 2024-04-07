package com.soufoods.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.soufoods.entity.Categories;
import com.soufoods.entity.CategoryDetail;
import com.soufoods.entity.Images;
import com.soufoods.entity.Product;
import com.soufoods.entity.Review;
import com.soufoods.model.AdminCategoryResponse;
import com.soufoods.model.FilterCategoryRequest;
import com.soufoods.repo.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCategoryService {
	private final CategoryRepository categoryRepository;
	private final AwsS3Service awsS3Service;

	public Map<String, Object> findById(Long id) {
		Map<String, Object> map = new HashMap<>();
		Optional<Categories> category = categoryRepository.findById(id);
		if (category.isPresent()) {
			category.get().setImageUrl(awsS3Service.getFileS3(category.get().getImage()));
			map.put("status", "200");
			map.put("category", category.get());
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public AdminCategoryResponse findAll(Optional<Integer> pageNumber, Optional<Integer> sizePage1) {
		int sizePage = sizePage1.orElse(10);
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage, Sort.by("id").reverse());
		Page<Categories> categories = categoryRepository.findAll(page);
		long total = categories.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		List<Categories> listCategory = categories.toList();
		for (Categories category : listCategory) {
			category.setImageUrl(awsS3Service.getFileS3(category.getImage()));
		}
		return AdminCategoryResponse.builder().total(total).totalPage(totalPage).categories(listCategory).build();
	}

	public List<Categories> findAll() {
		return categoryRepository.findAll();
	}

	public AdminCategoryResponse filterCategory(FilterCategoryRequest request) {
		int sizePage = 10;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		Page<Categories> categories = categoryRepository.filterCategory(request.getSearch(), request.getActive(), request.getActiveCd(), page);
		long total = categories.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		List<Categories> listCategory = categories.toList();
		for (Categories category : listCategory) {
			category.setImageUrl(awsS3Service.getFileS3(category.getImage()));
		}
		return AdminCategoryResponse.builder().total(total).totalPage(totalPage).categories(categories.toList())
				.build();
	}

	public Map<String, String> addCategory(Categories category, Optional<MultipartFile> fileImage) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();
		if (category.getName().isEmpty()) {
			map.put("name", "Vui lòng nhập tên danh mục");
			check = false;
		}

		if (!fileImage.isPresent()) {
			map.put("image", "Vui lòng chọn hình ảnh danh mục");
			check = false;
		} else {
			if (fileImage.get().getSize() == 0) {
				map.put("image", "Vui lòng chọn hình ảnh danh mục");
				check = false;
			}
		}

		if (check) {
			if (fileImage.isPresent()) {
				category.setImage(awsS3Service.uploadFileS3(fileImage.get()));
			}
			categoryRepository.save(category);
			map.put("status", "200");
			map.put("categoryId", String.valueOf(category.getId()));
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> updateCategory(Categories category, Optional<MultipartFile> fileImage) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();
		if (category.getName().isEmpty()) {
			map.put("name", "Vui lòng nhập tên danh mục");
			check = false;
		}

		Optional<Categories> categoryId = categoryRepository.findById(category.getId());
		if (!categoryId.isPresent()) {
			map.put("error", "Không tìm thấy id");
			check = false;
		}

		if (check) {
			if (fileImage.isPresent()) {
				awsS3Service.deleteFileS3(categoryId.get().getImage());
				categoryId.get().setImage(awsS3Service.uploadFileS3(fileImage.get()));
			}
			categoryId.get().setName(category.getName());
			categoryId.get().setActive(category.isActive());
			categoryRepository.saveAndFlush(categoryId.get());
			map.put("status", "200");
			map.put("categoryId", String.valueOf(categoryId.get().getId()));
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> deleteCategory(Optional<Long> categoryId) {
		Map<String, String> map = new HashMap<>();
		Optional<Categories> category = categoryRepository.findById(categoryId.get());
		if (category.isPresent()) {
			try {
				List<String> images = new ArrayList<>();
				for (CategoryDetail categoryD : category.get().getListCategoryDetail()) {
					images.add(categoryD.getImage());
					for (Product product : categoryD.getListProduct()) {
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
				}

				categoryRepository.delete(category.get());
				awsS3Service.deleteFileS3(category.get().getImage());

				if (!images.isEmpty()) {
					for (String image : images) {
						awsS3Service.deleteFileS3(image);
					}
				}
				map.put("status", "200");
			} catch (Exception e) {
				map.put("status", "401");
				map.put("error", "Không thể xóa danh mục này");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy danh mục này.");
		}
		return map;
	}
}
