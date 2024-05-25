package com.soufoods.controller;

import java.text.DecimalFormat;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.soufoods.entity.Images;
import com.soufoods.entity.Review;
import com.soufoods.model.ReviewResponse;
import com.soufoods.repo.ImagesRepository;
import com.soufoods.repo.ReviewRepository;
import com.soufoods.service.AwsS3Service;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {
	private final ReviewRepository reviewRepository;
	private final AwsS3Service awsS3Service;
	private final ImagesRepository imagesRepository;

	@GetMapping("")
	public ResponseEntity<?> findAll(@RequestParam("pageNumber") Optional<Integer> pageNumber,
			@RequestParam("productId") Long id) {
		int sizePage = 10;
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		Page<Review> reviews = reviewRepository.findAllByProduct(id, page);
		long total = reviews.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		
		DecimalFormat df = new DecimalFormat("#.#");
		List<Double> listRate = new ArrayList<>();
		double rate = 0, countR1 = 0, countR2 = 0, countR3 = 0, countR4 = 0, countR5 = 0;
		for (Review review : reviewRepository.findAllByProduct(id)) {
			if (review.getRate() == 5) {
				countR5++;
			}
			if (review.getRate() == 4) {
				countR4++;
			}
			if (review.getRate() == 3) {
				countR3++;
			}
			if (review.getRate() == 2) {
				countR2++;
			}
			if (review.getRate() == 1) {
				countR1++;
			}
		}
		
		if(total > 0) {
			rate = (countR5 * 5 + countR4 * 4 + countR3 * 3 + countR2 * 2 + countR1 * 1)
					/ (countR5 + countR4 + countR3 + countR2 + countR1);
			listRate.add(countR5);
			listRate.add(countR4);
			listRate.add(countR3);
			listRate.add(countR2);
			listRate.add(countR1);
		}
		return ResponseEntity
				.ok(ReviewResponse.builder().total(total).totalPage(totalPage).reviews(reviews.toList()).rate(Double.parseDouble(df.format(rate))).rates(listRate).build());
	}

	@PostMapping("")
	public ResponseEntity<?> review(Review review, @RequestParam("fileImages") Optional<MultipartFile[]> fileImages) {
		Map<String, Object> map = new HashMap<>();
		boolean check = true;
		if (review.getRate() == 0) {
			map.put("rate", "Vui lòng chọn đánh giá từ 1 đến 5 sao");
			check = false;
		}
		
		if (review.getContent() == null || review.getContent().isEmpty()) {
			map.put("content", "Vui lòng nhập nội dung đánh giá");
			check = false;
		}
		
		if (review.getName() == null || review.getName().isEmpty()) {
			map.put("name", "Vui lòng nhập tên của bạn");
			check = false;
		}

		if (check) {
			review.setActive(true);
			reviewRepository.save(review);
			map.put("status", "200");
			if (fileImages.isPresent()) {
				for (MultipartFile file : fileImages.get()) {
					String fileName = awsS3Service.uploadFileS3(file);
					imagesRepository.save(new Images(null, fileName, null, null, review));
				}
			}
		} else {
			map.put("status", "401");
		}
		return ResponseEntity.ok(map);
	}
}
