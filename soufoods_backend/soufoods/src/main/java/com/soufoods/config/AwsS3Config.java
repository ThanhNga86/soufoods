package com.soufoods.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;

@Configuration
public class AwsS3Config {
	@Value("${aws.s3.accessKey}")
    private String accessKey;

    @Value("${aws.s3.secretKey}")
    private String secretKey;

    @Value("${aws.s3.region}")
    private String region;
    
    @Bean
    public AmazonS3 amazonS3Client() {
    	BasicAWSCredentials basicAWSCredentials = new BasicAWSCredentials(accessKey, secretKey);
    	return AmazonS3Client.builder()
    			.withCredentials(new AWSStaticCredentialsProvider(basicAWSCredentials))
    			.withRegion(region)
    			.build();
    }
}