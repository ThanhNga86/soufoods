package com.soufoods.service;

import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.soufoods.entity.ForgotPassword;
import com.soufoods.entity.User;
import com.soufoods.model.VoucherAddedResponse;
import com.soufoods.repo.ForgotPasswordRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
	private final JavaMailSender sender;
	private final AwsS3Service awsS3Service;
	private final ForgotPasswordRepository forgotPasswordRepository;
	@Value("${app.url}")
	private String appUrl;

	public String sendEmail(String sendEmail, String subject, String content) {
		String status = "";
		try {
			MimeMessage message = sender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");
			helper.setFrom("Soufoods <testtest86n@gmail.com>");
			helper.setTo(sendEmail);
			helper.setSubject(subject);
			helper.setText(content, true);
			helper.setReplyTo("testtest86n@gmail.com");
			sender.send(message);
		} catch (MessagingException e) {
			e.printStackTrace();
		}
		return status;
	}
	
	public void sendVoucher(VoucherAddedResponse voucher) {
		String logo = awsS3Service.getFileS3("logo-soufoods.png");
		String subject = "";
		String content = "";
		NumberFormat numb = NumberFormat.getInstance(new Locale("Vi", "VN"));
		SimpleDateFormat simpDate = new SimpleDateFormat("dd-MM-yyyy");

		content += "<img src=\"" + logo + "\" width=\"100\">";
		content += "<h3>CHÚC MỪNG BẠN NHẬN ĐƯỢC MÃ GIẢM GIÁ</h3>";

		if (voucher.isFreeShip()) {
			subject = "BẠN NHẬN ĐƯỢC MÃ GIẢM GIÁ + FREE SHIP ( " + voucher.getDiscountCode() + " )";
		} else {
			subject = "BẠN NHẬN ĐƯỢC MÃ GIẢM GIÁ ( " + voucher.getDiscountCode() + " )";
		}

		if (voucher.isDiscountType()) {
			content += "<span>Soufoods xin gửi tặng bạn 01 mã giảm <strong>" + numb.format(voucher.getDiscount())
					+ "đ</strong> ";
			content += (voucher.isFreeShip()) ? "+ <strong>FREE SHIP</strong> " : "";
		} else {
			content += "<span>Soufoods xin gửi tặng bạn 01 mã giảm <strong>" + voucher.getDiscount() + "%</strong> ";
			content += (voucher.isFreeShip()) ? "+ <strong>FREE SHIP</strong> " : "";
		}
		content += "khi mua hàng trên App.</span><br><br>";

		if (voucher.getPriceMin() == 0) {
			content += "Mã giảm giá: <strong>" + voucher.getDiscountCode() + "</strong> áp dụng cho đơn hàng mọi giá.";
		} else {
			content += "Mã giảm giá: <strong>" + voucher.getDiscountCode() + "</strong> áp dụng cho đơn hàng từ "
					+ numb.format(voucher.getPriceMin()) + " đ";
		}
		content += " ( Hạn sử dụng đến hết ngày " + simpDate.format(voucher.getExpiration())
				+ " kể từ ngày nhận mã giảm giá này).<br><br>";
		content += "Lưu ý :<br>" + "- Chỉ sử dụng 1 mã giảm giá/1 đơn hàng<br>"
				+ "- Cần nhập mã trên vào ô \"Mã giảm giá\"<br>"
				+ "- Các hành vi gian lận, tạo nhiều tài khoản để nhận giảm giá, chúng tôi sẽ hủy đơn hàng mà không hoàn trả lại tiền. <br><br>";

		content += "<a href=\""+appUrl+"\" style=\"text-decoration: none; color: white; font-size: large;\"><span style=\"padding: 10px 40px; border-radius: 10px; background-color: rgb(246, 166, 68)\">Ghé thăm Soufoods<span></a><br>";
		this.sendEmail(voucher.getEmail(), subject, content);
	}
	
	public void forgotPassword(User user) {
		String subject = "Đặt lại mật khẩu";
		String logo = awsS3Service.getFileS3("logo-soufoods.png");
		String content = "";
		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.MINUTE, 10);
		UUID uuid = UUID.randomUUID();
		String validCode = uuid.toString() + "-";
		String str = "qwertyuiopasd1234567890fghjklzxcvbnm";
		for(int i = 0; i < 10; i++) {
			validCode += str.charAt(new Random().nextInt(str.length()));
		}
		
		ForgotPassword forgotPassword = forgotPasswordRepository.save(
				new ForgotPassword(null, validCode.toString(), calendar.getTime(), user));
		
		content += "<img src=\"" + logo + "\" width=\"100\"> <br>";
		content += "Xin chào "+user.getFirstName()+", Chúng tôi nhận được yêu cầu đặt lại mật khẩu của quý khách qua email. <br>"
				+ "Để hoàn tất quá trình đặt lại mật khẩu, quý khách vui lòng bấm vào đường link <b>đặt lại mật khẩu</b> dưới đây. "
				+ "Nếu quý khách không yêu cầu đặt lại mật khẩu thì có thể xóa email này để đảm bảo an toàn thông tin. Xin cảm ơn quý khách !<br><br>";
		content += "<a href=\""+appUrl+"/account/reset/"+forgotPassword.getId()+"/"+forgotPassword.getValidCode()+"\" style=\"text-decoration: none; color: white; font-size: large;\"><span style=\"padding: 10px 40px; border-radius: 10px; background-color: rgb(246, 166, 68)\">Đặt lại mật khẩu<span></a> <br><br>";
		content += "<span style=\"font-size: medium;\">hoặc <a href=\""+appUrl+"\" style=\"text-decoration: none; color: orange\">ghé thăm soufoods</a></span><br>";
		this.sendEmail(user.getEmail(), subject, content);
	}
}
