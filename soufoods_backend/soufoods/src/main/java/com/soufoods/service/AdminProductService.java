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

import com.soufoods.entity.Images;
import com.soufoods.entity.Product;
import com.soufoods.entity.Review;
import com.soufoods.model.AdminProductResponse;
import com.soufoods.model.FilterProductRequest;
import com.soufoods.repo.ImagesRepository;
import com.soufoods.repo.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminProductService {
	private final ProductRepository productRepository;
	private final ImagesRepository imagesRepository;
	private final AwsS3Service awsS3Service;

	public Map<String, Object> findById(Long id) {
		Map<String, Object> map = new HashMap<>();
		Optional<Product> product = productRepository.findById(id);
		if (product.isPresent()) {
			product.get().setImageUrl(awsS3Service.getFileS3(product.get().getImage()));
			map.put("product", product.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public AdminProductResponse findAll(Optional<Integer> pageNumber, Optional<Integer> sizePage1) {
		int sizePage = sizePage1.orElse(10);
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage, Sort.by("id").reverse());
		Page<Product> products = productRepository.findAll(page);
		long total = products.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		List<Product> listProduct = products.toList();
		for (Product product : listProduct) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return AdminProductResponse.builder().total(total).totalPage(totalPage).products(listProduct).build();
	}

	public AdminProductResponse filter(FilterProductRequest request) {
		int sizePage = 10;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		Page<Product> products = null;

		if (request.getSearch() == null) {
			products = productRepository.filterProduct(null, null, request.getQuantity(), request.getDiscount(),
					request.getActive(), request.getActivePd(), request.getCategoryId(), request.getCategoryDetailId(), page);
		} else {
			try {
				Long id = Long.parseLong(request.getSearch());
				products = productRepository.filterProduct(id, null, request.getQuantity(), request.getDiscount(),
						request.getActive(), request.getActivePd(), request.getCategoryId(), request.getCategoryDetailId(), page);
			} catch (NumberFormatException e) {
				products = productRepository.filterProduct(null, request.getSearch(), request.getQuantity(),
						request.getDiscount(), request.getActivePd(), request.getActive(), request.getCategoryId(), request.getCategoryDetailId(), page);
			}
		}

		long total = products.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		List<Product> listProduct = products.toList();
		for (Product product : listProduct) {
			product.setImageUrl(awsS3Service.getFileS3(product.getImage()));
		}
		return AdminProductResponse.builder().total(total).totalPage(totalPage).products(listProduct).build();
	}

	public Map<String, String> addProduct(Product product, Optional<MultipartFile> fileImage,
			Optional<MultipartFile[]> fileImages) {
		Map<String, String> map = new HashMap<>();
		boolean check = true;
		if (product.getName().isEmpty() || product.getName() == null) {
			map.put("name", "Vui lòng nhập tên sản phẩm");
			check = false;
		}

		if (!fileImage.isPresent()) {
			map.put("image", "Vui lòng chọn hình ảnh đại diện");
			check = false;
		}

		if (product.getDescribes().isEmpty() || product.getDescribes() == null) {
			map.put("describes", "Vui lòng nhập mô tả sản phẩm");
			check = false;
		}

		if (product.getCategoryDetail() == null) {
			map.put("categoryDetail", "Vui lòng chọn loại sản phẩm chi tiết");
			check = false;
		}

		if (check) {
			if (fileImage.isPresent()) {
				product.setImage(awsS3Service.uploadFileS3(fileImage.get()));
			}
			Product productId = productRepository.save(product);
			map.put("status", "200");
			map.put("productId", String.valueOf(productId.getId()));

			if (fileImages.isPresent()) {
				for (MultipartFile file : fileImages.get()) {
					String fileName = awsS3Service.uploadFileS3(file);
					imagesRepository.save(new Images(null, fileName, null, product, null));
				}
			}
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> updateProduct(Product product, Optional<MultipartFile> fileImage,
			Optional<MultipartFile[]> fileImages, Optional<List<String>> oldImages) {
		boolean check = true;
		Map<String, String> map = new HashMap<>();
		Optional<Product> productId = productRepository.findById(product.getId());

		if (product.getId() == null || !productId.isPresent()) {
			map.put("id", "Không tìm thấy productId");
			check = false;
		}

		if (product.getName().isEmpty() || product.getName() == null) {
			map.put("name", "Vui lòng nhập tên sản phẩm");
			check = false;
		}
		
		if (product.getDescribes().isEmpty()) {
			map.put("describes", "Vui lòng nhập mô tả sản phẩm");
			check = false;
		}

		if (product.getCategoryDetail() == null) {
			map.put("category", "Vui lòng chọn loại sản phẩm");
			check = false;
		}

		if (check) {
			productId.get().setName(product.getName());
			productId.get().setActive(product.isActive());
			productId.get().setDescribes(product.getDescribes());
			productId.get().setCategoryDetail(product.getCategoryDetail());
			if (fileImage.isPresent()) {
				awsS3Service.deleteFileS3(productId.get().getImage());
				productId.get().setImage(awsS3Service.uploadFileS3(fileImage.get()));
			}
			productRepository.saveAndFlush(productId.get());
			map.put("status", "200");
			map.put("productId", String.valueOf(productId.get().getId()));

			// Xóa nhiều hình cũ đi
			if (oldImages.isPresent()) {
				for (Images image : productId.get().getListImages()) {
					if (!oldImages.get().contains(image.getName())) {
						awsS3Service.deleteFileS3(image.getName());
						imagesRepository.delete(image);
					}
				}
			}
			
			// Thêm nhiều hình mới vào
			if (fileImages.isPresent()) {
				if (fileImages.get()[0].getSize() != 0) {
					for (MultipartFile file : fileImages.get()) {
						String fileName = awsS3Service.uploadFileS3(file);
						imagesRepository.save(new Images(null, fileName, null, productId.get(), null));
					}
				}
			}
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public Map<String, String> deleteProduct(Optional<Long> productId) {
		Map<String, String> map = new HashMap<>();
		Optional<Product> product = productRepository.findById(productId.get());
		if (product.isPresent()) {
			try {
				List<Images> images = new ArrayList<>();
				for (Review review : product.get().getListReview()) {
					for (Images image : review.getListImages()) {
						images.add(image);
					}
				}

				productRepository.delete(product.get());
				awsS3Service.deleteFileS3(product.get().getImage());
				for (Images image : product.get().getListImages()) {
					awsS3Service.deleteFileS3(image.getName());
					imagesRepository.delete(image);
				}

				if (!images.isEmpty()) {
					for (Images image : images) {
						awsS3Service.deleteFileS3(image.getName());
					}
				}
				map.put("status", "200");
			} catch (Exception e) {
				map.put("status", "401");
				map.put("error", "Không thể xóa sản phẩm này.");
			}
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy sản phẩm này.");
		}
		return map;
	}
}
