package com.soufoods.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.soufoods.entity.Review;
import com.soufoods.model.AdminReviewResponse;
import com.soufoods.model.FilterReviewRequest;
import com.soufoods.repo.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminReviewService {
	private final ReviewRepository reviewRepository;

	public Map<String, Object> findById(Long id) {
		Map<String, Object> map = new HashMap<>();
		Optional<Review> review = reviewRepository.findById(id);
		if (review.isPresent()) {
			map.put("review", review.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
		}
		return map;
	}

	public AdminReviewResponse findAll(Optional<Integer> pageNumber, Optional<Integer> sizePage1) {
		int sizePage = sizePage1.orElse(10);
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage, Sort.by("id").reverse());
		Page<Review> reviews = reviewRepository.findAll(page);
		long total = reviews.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminReviewResponse.builder().total(total).totalPage(totalPage).reviews(reviews.toList()).build();
	}

	public AdminReviewResponse filter(FilterReviewRequest request) {
		if(request.getRates().size() == 0) {
			request.setRates(null);
		}
		
		int sizePage = 10;
		Pageable page = PageRequest.of(request.getPageNumber() - 1, sizePage);
		Page<Review> reviews = null;

		if (request.getSearch() == null) {
			reviews = reviewRepository.filter(null, null, request.getRates(), request.getActive(), page);
		} else {
			try {
				Long id = Long.parseLong(request.getSearch());
				reviews = reviewRepository.filter(id, null, request.getRates(), request.getActive(), page);
			} catch (NumberFormatException e) {
				reviews = reviewRepository.filter(null, request.getSearch(), request.getRates(), request.getActive(), page);
			}
		}

		long total = reviews.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		return AdminReviewResponse.builder().total(total).totalPage(totalPage).reviews(reviews.toList()).build();
	}
	
	public Map<String, Object> hiddenAndShowReview(Review review) {
		Map<String, Object> map = new HashMap<>();
		Optional<Review> reviewId = reviewRepository.findById(review.getId());
		
		if(reviewId.isPresent()) {
			reviewId.get().setActive(review.isActive());
			reviewRepository.saveAndFlush(reviewId.get());
			map.put("status", "200");
		} else {
			map.put("status", "401");
			map.put("error", "Không tìm thấy id này");
		}
		return map;
	}

//	public Map<String, String> addReview(Review review, Optional<MultipartFile[]> fileImages) {
//		Map<String, String> map = new HashMap<>();
//		boolean check = true;
//		if (review.getContent().isEmpty() || review.getContent() == null) {
//			map.put("content", "Vui lòng nhập nội dung đánh giá");
//			check = false;
//		}
//
//		if (review.getRate() == null) {
//			map.put("rate", "Vui lòng chọn đánh giá từ 1 đến 5 sao");
//			check = false;
//		}
//
//		if (check) {
//			review.setActive(true);
//			reviewRepository.save(review);
//			map.put("status", "200");
//
//			if (fileImages.isPresent()) {
//				for (MultipartFile file : fileImages.get()) {
//					String fileName = awsS3Service.uploadFileS3(file);
//					imagesRepository.save(new Images(null, fileName, null, null, review));
//				}
//			}
//		} else {
//			map.put("status", "401");
//		}
//		return map;
//	}
//
//	public Map<String, String> updateReview(Review review, Optional<MultipartFile[]> fileImages,
//			Optional<List<String>> oldImages) {
//		boolean check = true;
//		Map<String, String> map = new HashMap<>();
//		Optional<Review> reviewId = reviewRepository.findById(review.getId());
//
//		if (review.getId() == null || !reviewId.isPresent()) {
//			map.put("id", "Không tìm thấy id");
//			check = false;
//		}
//
//		if (review.getContent().isEmpty() || review.getContent() == null) {
//			map.put("content", "Vui lòng nhập nội dung đánh giá");
//			check = false;
//		}
//
//		if (review.getRate() == null) {
//			map.put("rate", "Vui lòng chọn đánh giá từ 1 đến 5 sao");
//			check = false;
//		}
//
//		if (check) {
//			reviewId.get().setContent(review.getContent());
//			reviewId.get().setRate(review.getRate());
//			reviewId.get().setCreateDate(new Date());
//			reviewId.get().setActive(review.isActive());
//			reviewRepository.saveAndFlush(reviewId.get());
//			map.put("status", "200");
//
//			// Xóa nhiều hình cũ đi
//			if (oldImages.isPresent()) {
//				for (Images image : reviewId.get().getListImages()) {
//					if (!oldImages.get().contains(image.getName())) {
//						awsS3Service.deleteFileS3(image.getName());
//						imagesRepository.delete(image);
//					}
//				}
//			}
//
//			// Thêm nhiều hình mới vào
//			if (fileImages.isPresent()) {
//				if (fileImages.get()[0].getSize() != 0) {
//					for (MultipartFile file : fileImages.get()) {
//						String fileName = awsS3Service.uploadFileS3(file);
//						imagesRepository.save(new Images(null, fileName, null, null, reviewId.get()));
//					}
//				}
//			}
//		} else {
//			map.put("status", "401");
//		}
//		return map;
//	}
//
//	public Map<String, String> deleteReview(Optional<Long> productId) {
//		Map<String, String> map = new HashMap<>();
//		Optional<Review> review = reviewRepository.findById(productId.get());
//		if (review.isPresent()) {
//			try {
//				reviewRepository.delete(review.get());
//				for (Images image : review.get().getListImages()) {
//					awsS3Service.deleteFileS3(image.getName());
//					imagesRepository.delete(image);
//				}
//				map.put("status", "200");
//			} catch (Exception e) {
//				map.put("status", "401");
//				map.put("error", "Không thể xóa đánh giá này.");
//			}
//		} else {
//			map.put("status", "401");
//			map.put("error", "Không tìm thấy đánh giá này.");
//		}
//		return map;
//	}
}
