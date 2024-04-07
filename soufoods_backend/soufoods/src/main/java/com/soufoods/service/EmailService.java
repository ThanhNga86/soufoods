package com.soufoods.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
	private final JavaMailSender sender;

	public String sendEmail(String sendEmail, String subject, String content) {
		String status = "";
		try {
			MimeMessage message = sender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");
			helper.setFrom("soufoods6@gmail.com");
			helper.setTo(sendEmail);
			helper.setSubject(subject);
			helper.setText(content, true);
			helper.setReplyTo("soufoods6@gmail.com");
			sender.send(message);
		} catch (MessagingException e) {
			e.printStackTrace();
		}
		return status;
	}
}
