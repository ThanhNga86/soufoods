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
import com.soufoods.entity.Order;
import com.soufoods.entity.OrderDetail;
import com.soufoods.entity.User;
import com.soufoods.model.VoucherAddedResponse;
import com.soufoods.repo.ForgotPasswordRepository;
import com.soufoods.repo.OrderDetailRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
	private final JavaMailSender sender;
	private final AwsS3Service awsS3Service;
	private final ForgotPasswordRepository forgotPasswordRepository;
	private final OrderDetailRepository orderDetailRepository;
	@Value("${app.url}")
	private String appUrl;

	public void sendEmail(String sendEmail, String subject, String content) {
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
	}
	
	public void sendVoucher(VoucherAddedResponse voucher) {
		String logo = awsS3Service.getFileS3("logo-soufoods.png");
		String subject = "";
		String content = "";
		NumberFormat numb = NumberFormat.getInstance(new Locale("Vi", "VN"));
		SimpleDateFormat simpDate = new SimpleDateFormat("dd-MM-yyyy");

		if (voucher.isFreeShip()) {
			subject = "BẠN NHẬN ĐƯỢC MÃ GIẢM GIÁ + FREE SHIP ( " + voucher.getDiscountCode() + " )";
		} else {
			subject = "BẠN NHẬN ĐƯỢC MÃ GIẢM GIÁ ( " + voucher.getDiscountCode() + " )";
		}
		
		content += "<div style=\"font-size: 15px;\">";
		content += "<img src=\"" + logo + "\" width=\"100\">";
		content += "<h3>CHÚC MỪNG BẠN NHẬN ĐƯỢC MÃ GIẢM GIÁ</h3>";

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
		content += " (Hạn sử dụng đến hết ngày " + simpDate.format(voucher.getExpiration())
				+ " kể từ ngày nhận mã giảm giá này).<br><br>";
		content += "Lưu ý :<br>" + "- Chỉ sử dụng 1 mã giảm giá/1 đơn hàng<br>"
				+ "- Cần nhập mã trên vào ô \"Mã giảm giá\"<br>"
				+ "- Các hành vi gian lận, tạo nhiều tài khoản để nhận giảm giá, chúng tôi sẽ hủy đơn hàng mà không hoàn trả lại tiền. <br><br>";

		content += "<a href=\""+appUrl+"\" style=\"text-decoration: none; color: white; font-size: large;\"><span style=\"padding: 10px 40px; border-radius: 10px; background-color: rgb(246, 166, 68)\">Ghé thăm Soufoods<span></a><br>"
				+ "</div>";
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
		
		content += "<div style=\"font-size: 15px;\">"
				+ "<img src=\"" + logo + "\" width=\"100\"> <br>"
		 		+ "Xin chào "+user.getFirstName()+", Chúng tôi nhận được yêu cầu đặt lại mật khẩu của quý khách qua email. <br>"
				+ "Để hoàn tất quá trình đặt lại mật khẩu, quý khách vui lòng bấm vào đường link <b>đặt lại mật khẩu</b> dưới đây. "
				+ "Nếu quý khách không yêu cầu đặt lại mật khẩu thì có thể xóa email này để đảm bảo an toàn thông tin. Xin cảm ơn quý khách !<br><br>"
				+ "<a href=\""+appUrl+"/account/reset/"+forgotPassword.getId()+"/"+forgotPassword.getValidCode()+"\" style=\"text-decoration: none; color: white; font-size: large;\"><span style=\"padding: 10px 40px; border-radius: 10px; background-color: rgb(246, 166, 68)\">Đặt lại mật khẩu<span></a> <br><br>"
				+ "<span>hoặc <a href=\""+appUrl+"\" style=\"text-decoration: none; color: orange\">ghé thăm soufoods</a></span><br>"
				+ "</div>";
		this.sendEmail(user.getEmail(), subject, content);
	}
	
	public void orderInfo(Order order) {
	    String subject = "Thông tin đơn đặt hàng #" + order.getId();
	    String logo = awsS3Service.getFileS3("logo-soufoods.png");
	    String content = "";
	    String table = "";
	    NumberFormat numb = NumberFormat.getInstance(new Locale("Vi", "VN"));
	    Double provisional = 0.0;
	    Double discount = 0.0;
	    Double paymentTotal = 0.0;

	    content += "<div style=\"font-size: 15px;\">"
	            + "<img src=\"" + logo + "\" width=\"100\"> <br><br>"
	            + "Xin chào " + order.getFirstName() + ","
	            + "<h3>Cảm ơn quý khách đã đặt hàng Soufoods!</h3>"
	            + "<div style=\"font-size: medium; font-weight: 600; margin: 5px 0;\">Thông tin đặt hàng:</div>";
	    table += "<table style=\"border-collapse: collapse; width: 100%; text-align: center;\">\r\n"
	            + "    <tr>\r\n"
	            + "      <th style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">Tên sản phẩm</th>\r\n"
	            + "      <th style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">Loại sản phẩm</th>\r\n"
	            + "      <th style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">Hình ảnh</th>\r\n"
	            + "      <th style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">Giá</th>\r\n"
	            + "      <th style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">Số lượng</th>\r\n"
	            + "      <th style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">Tổng cộng</th>\r\n"
	            + "    </tr>\r\n";

	    for (OrderDetail orderDetail : orderDetailRepository.findAllByOrder(order.getId())) {
	        Double price = orderDetail.getPrice() * (100 - orderDetail.getDiscount()) / 100;
	        Double total = price * orderDetail.getQuantity();
	        table += "    <tr>\r\n"
	                + "      <td style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">" + orderDetail.getName() + "</td>\r\n"
	                + "      <td style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">" + (orderDetail.getSize() != null ? orderDetail.getSize() : "") + "</td>\r\n"
	                + "      <td style=\"border: solid 1px gray; font-size: medium; padding: 10px;\"><img src=\"" + awsS3Service.getFileS3(orderDetail.getProductDetail().getProduct().getImage()) + "\" width=\"80\"></td>\r\n"
	                + "      <td style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">" + numb.format(price) + " đ</td>\r\n"
	                + "      <td style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">" + numb.format(orderDetail.getQuantity()) + "</td>\r\n"
	                + "      <td style=\"border: solid 1px gray; font-size: medium; padding: 10px;\">" + numb.format(total) + " đ</td>\r\n"
	                + "    </tr>\r\n";
	        provisional += total;
	        paymentTotal += total;
	    }

	    table += "</table>";
	    content += table
	            + "<div style=\"margin-top: 10px; width: 100%;\">\r\n"
	            + "    <table style=\"width: 100%;\">\r\n"
	            + "        <tr>\r\n"
	            + "            <td><b>Tạm tính: </b></td>\r\n"
	            + "            <td style=\"color: orange; text-align: right;\">" + numb.format(provisional) + " đ</td>\r\n"
	            + "        </tr>\r\n";
	    if(order.getVoucher() != null) {
	        if(order.getVoucher().isDiscountType()) {
	            discount = provisional - (provisional - order.getVoucher().getDiscount());
	        } else {
	            discount = provisional - (provisional * (100 - order.getVoucher().getDiscount()) / 100);
	        }
	        paymentTotal -= discount;

	        content += "        <tr>\r\n"
	                + "            <td><b>Mã giảm giá: " + order.getVoucher().getDiscountCode() + "</b></td>\r\n"
	                + "            <td style=\"color: orange; text-align: right;\">-" +  numb.format(discount) + " đ</td>\r\n"
	                + "        </tr>\r\n";
	    }

	    if(order.getShipFee() == 0) {
	        content += "        <tr>\r\n"
	                + "            <td><b>Phí vận chuyển: </b></td>\r\n"
	                + "            <td style=\"color: orange; text-align: right;\">Miễn phí</td>\r\n"
	                + "        </tr>\r\n";
	    } else {
	        content += "        <tr>\r\n"
	                + "            <td><b>Phí vận chuyển: </b></td>\r\n"
	                + "            <td style=\"color: orange; text-align: right;\">" + numb.format(order.getShipFee()) + " đ</td>\r\n"
	                + "        </tr>\r\n";
	        paymentTotal += order.getShipFee();
	    }

	    content += "        <tr>\r\n"
	            + "            <td><b>Tổng thanh toán: </b></td>\r\n"
	            + "            <td style=\"font-size: 18px; color: orange; text-align: right;\">" + numb.format(paymentTotal) + " đ</td>\r\n"
	            + "        </tr>\r\n"
	            + "    </table>\r\n"
	            + "</div>\r\n";

	    content += "<div style=\"font-size: medium; font-weight: 600; margin: 5px 0;\">Thông tin khác:</div>"
		     	+ "<div>Họ và tên: " + order.getLastName() +" "+order.getFirstName() + "</div>"
		     	+ "<div>Số điện thoại: " + order.getPhone() + "</div>";
	    String address = order.getAddress().replaceAll("\\|\\|", ",");
	    content += "<div>Địa chỉ giao hàng: " + address + "</div>";
	    if(!order.getNote().isEmpty() && !order.getNote().equals("undefined")) {
	        content += "<div> Ghi chú: " + order.getNote() + "</div>";
	    }
	    content += "<br><span style=\"font-size: medium;\">Cần hỗ trợ? Hotline : 048-234-7000</span><br><br>"
	            + "<a href=\"" + appUrl + "\" style=\"text-decoration: none; color: white; font-size: large;\"><span style=\"padding: 10px 40px; border-radius: 10px; background-color: rgb(246, 166, 68)\">Ghé thăm Soufoods</span></a><br>"
	            + "</div>";
	    this.sendEmail(order.getUser().getEmail(), subject, content);
	}

}
