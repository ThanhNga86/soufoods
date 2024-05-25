package com.soufoods.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.PutObjectRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AwsS3Service {
	private final AmazonS3 amazonS3;
	@Value("${aws.s3.bucketName}")
	private String bucketName;

	// day file len AWS S3
	private void uploadFileS3(String bucketName, String fileName, File file) {
		amazonS3.putObject(new PutObjectRequest(bucketName, fileName, file));
	}
	
	// chuyen doi fultipartFile thanh file và luu tam thoi
	private File convertMultiPartToFile(MultipartFile mFile) {
		String strRd = System.currentTimeMillis() + new Random().nextInt(9) + "";
		File file = new File(strRd + "_" + mFile.getOriginalFilename());
		try {
			FileOutputStream fos = new FileOutputStream(file);
			fos.write(mFile.getBytes());
			fos.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return file;
	}
	
	// upload file len AWS S3 va xoa file tam thoi
	public String uploadFileS3(MultipartFile multipartFile) {
		String fileName = "";
		try {
			File file = convertMultiPartToFile(multipartFile);
			fileName = file.getName();
			uploadFileS3(bucketName, fileName, file);
			file.delete();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return fileName;
	}

	// xoa file AWS S3
	public String deleteFileS3(String fileName) {
		try {
			amazonS3.deleteObject(new DeleteObjectRequest(bucketName, fileName));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return fileName;
	}

	// get url image AWS S3
	public String getFileS3(String fileName) {
		try {
			URL url = amazonS3.generatePresignedUrl(
					new GeneratePresignedUrlRequest(bucketName, fileName).withMethod(HttpMethod.GET));
			return url.toString();
		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}
	}
}
