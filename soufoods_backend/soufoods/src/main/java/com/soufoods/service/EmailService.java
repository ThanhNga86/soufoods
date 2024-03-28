package com.soufoods.service;

import java.util.Random;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.soufoods.entity.User;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
	private	final JavaMailSender sender;
	
	public String sendEmail(User user) {
		String validCode = "";
		try {
			MimeMessage message = sender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");
			helper.setFrom("testtest86n@gmail.com");
			helper.setTo(user.getEmail());
			helper.setSubject("Thông tin mã xác thực đặt lại mật khẩu");
			Random rd = new Random();
			for (int i = 0; i < 6; i++) {
				validCode += String.valueOf(rd.nextInt(9) + 0);
			}
			String noidung = "Chào " + user.getFirstName() + ".<br>"
					+ "Chúng tôi nhận được yêu cầu lấy lại mật khẩu của bạn qua email. Để hoàn tất quá trình lấy lại mật khẩu, vui lòng sử dụng mã xác nhận sau đây để đặt lại mật khẩu của bạn:<br>"
					+ "Mã xác nhận: <span style=\"color: skyblue; font-size: 16px; font-weight: bold;\">" + validCode
					+ "</span><br>"
					+ "Vui lòng nhập mã xác nhận này vào trang đặt lại mật khẩu của chúng tôi để tiếp tục quá trình đặt lại mật khẩu của bạn.<br>"
					+ "Đây là email gửi tự động, vui lòng không phản hồi.<br>"
					+ "Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này.<br>";
			helper.setText(noidung, true);
			helper.setReplyTo("testtest86n@gmail.com");
			sender.send(message);
		} catch (MessagingException e) {
		}
		return validCode;
	}
}
