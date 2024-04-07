package com.soufoods.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.soufoods.entity.Images;
import com.soufoods.entity.Product;
import com.soufoods.entity.Review;
import com.soufoods.repo.ImagesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImagesService {
	private final ImagesRepository imagesRepository;
	private final AwsS3Service awsS3Service;

	public List<Images> findAllByProduct(Product product) {
		List<Images> images = imagesRepository.findAllByProduct(product);
		for (Images image : images) {
			image.setUrl(awsS3Service.getFileS3(image.getName()));
		}
		return images;
	}
	
	public List<Images> findAllByReview(Review review) {
		List<Images> images = imagesRepository.findAllByReview(review);
		for (Images image : images) {
			image.setUrl(awsS3Service.getFileS3(image.getName()));
		}
		return images;
	}
}