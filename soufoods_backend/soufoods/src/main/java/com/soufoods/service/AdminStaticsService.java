package com.soufoods.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.soufoods.entity.BiggestBuyer;
import com.soufoods.entity.SellingProducts;
import com.soufoods.repo.CategoryDetailRepository;
import com.soufoods.repo.CategoryRepository;
import com.soufoods.repo.OrderDetailRepository;
import com.soufoods.repo.OrderRepository;
import com.soufoods.repo.ProductDetailRepository;
import com.soufoods.repo.ProductRepository;
import com.soufoods.repo.ReviewRepository;
import com.soufoods.repo.UserRepository;
import com.soufoods.repo.VoucherRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminStaticsService {
	private final UserRepository userRepository;
	private final CategoryRepository categoryRepository;
	private final CategoryDetailRepository categoryDetailRepository;
	private final ProductRepository productRepository;
	private final ProductDetailRepository productDetailRepository;
	private final VoucherRepository voucherRepository;
	private final OrderRepository orderRepository;
	private final OrderDetailRepository orderDetailRepository;
	private final ReviewRepository reviewRepository;
	private final AwsS3Service awsS3Service;

	// Thống kê chỉ số
	public Map<String, Object> staticsByUser() {
		Map<String, Object> map = new HashMap<>();
		Long actived = userRepository.staticsByActived();
		Long unActived = userRepository.staticsByUnActived();
		
		map.put("actived", actived);
		map.put("unActived", unActived);
		return map;
	}

	public Map<String, Object> staticsByCategory() {
		Map<String, Object> map = new HashMap<>();
		long actived = 0, unActived = 0;

		actived += categoryRepository.staticsByActived();
		actived += categoryDetailRepository.staticsByActived();

		unActived += categoryRepository.staticsByUnActived();
		unActived += categoryDetailRepository.staticsByUnActived();

		map.put("actived", actived);
		map.put("unActived", unActived);
		return map;
	}

	public Map<String, Object> staticsByProduct() {
		Map<String, Object> map = new HashMap<>();
		Long sold = orderDetailRepository.staticsBySold();
		Long onSale = productDetailRepository.staticsByOnSale();
		Long stopSelling = productRepository.staticsByStopSelling() + productDetailRepository.staticsByStopSelling();
		Long outStock = productDetailRepository.staticsByOutStock();

		map.put("sold", sold);
		map.put("onSale", onSale);
		map.put("stopSelling", stopSelling);
		map.put("outStock", outStock);
		return map;
	}

	public Map<String, Object> staticsByVoucher() {
		Map<String, Object> map = new HashMap<>();
		Long actived = voucherRepository.staticsByActived();
		Long unActived = voucherRepository.staticsByUnActived();

		map.put("actived", actived);
		map.put("unActived", unActived);
		return map;
	}

	public Map<String, Object> staticsByOrder() {
		Map<String, Object> map = new HashMap<>();
		Long wait = orderRepository.staticsByStatus("Chở xử lý");
		Long processed = orderRepository.staticsByStatus("Đã xử lý");
		Long delivering = orderRepository.staticsByStatus("Đang giao");
		Long delivered = orderRepository.staticsByStatus("Đã giao");

		map.put("wait", wait);
		map.put("processed", processed);
		map.put("delivering", delivering);
		map.put("delivered", delivered);
		return map;
	}

	public Map<String, Object> staticsByReview() {
		Map<String, Object> map = new HashMap<>();
		Long out4stars = reviewRepository.staticsByRate(true);
		Long under4stars = reviewRepository.staticsByRate(false);

		map.put("out4stars", out4stars);
		map.put("under4stars", under4stars);
		return map;
	}

	// Thống kê doanh thu
	public Map<String, Object> staticsByYesterday() {
		Map<String, Object> map = new HashMap<>();
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		cal.setTime(new Date());

		cal.add(Calendar.DAY_OF_MONTH, -1);
		Date inpDate = cal.getTime();
		Long revenue = orderDetailRepository.revenueByDate(inpDate, inpDate);
		Long sold = orderDetailRepository.soldByDate(inpDate, inpDate);

		map.put("revenue", revenue);
		map.put("sold", sold);
		return map;
	}

	public Map<String, Object> staticsByToday() {
		Map<String, Object> map = new HashMap<>();
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);

		cal.setTime(new Date());
		Date inpDate = cal.getTime();
		Long revenue = orderDetailRepository.revenueByDate(inpDate, inpDate);
		Long sold = orderDetailRepository.soldByDate(inpDate, inpDate);

		map.put("revenue", revenue);
		map.put("sold", sold);
		return map;
	}

	public Map<String, Object> staticsByWeek() {
		Map<String, Object> map = new HashMap<>();
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);

		cal.setTime(new Date());
		cal.set(Calendar.DAY_OF_WEEK, cal.getFirstDayOfWeek());
		Date fromDate = cal.getTime();
		cal.add(Calendar.DAY_OF_WEEK, 6);
		Date toDate = cal.getTime();

		Long revenue = orderDetailRepository.revenueByDate(fromDate, toDate);
		Long sold = orderDetailRepository.soldByDate(fromDate, toDate);

		map.put("revenue", revenue);
		map.put("sold", sold);
		return map;
	}

	public Map<String, Object> staticsByMonth() {
		Map<String, Object> map = new HashMap<>();
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR_OF_DAY, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);

		cal.set(Calendar.DAY_OF_MONTH, 1);
		Date fromDate = cal.getTime();
		int numberOfDaysInMonth = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
		cal.add(Calendar.DAY_OF_MONTH, numberOfDaysInMonth - 1);
		Date toDate = cal.getTime();

		Long revenue = orderDetailRepository.revenueByDate(fromDate, toDate);
		Long sold = orderDetailRepository.soldByDate(fromDate, toDate);

		map.put("revenue", revenue);
		map.put("sold", sold);
		return map;
	}

	public Map<String, Object> staticsByTotal(String fromDate, String toDate) {
		Map<String, Object> map = new HashMap<>();
		Date inpFromDate = null, inpToDate = null;
		if ((fromDate != null) && toDate != null) {
			SimpleDateFormat simpDate = new SimpleDateFormat("yyyy-MM-dd");
			try {
				inpFromDate = simpDate.parse(fromDate);
				inpToDate = simpDate.parse(toDate);
			} catch (ParseException e) {
			}
		}

		Long revenue = orderDetailRepository.revenueByDate(inpFromDate, inpToDate);
		Long sold = orderDetailRepository.soldByDate(inpFromDate, inpToDate);

		map.put("revenue", revenue);
		map.put("sold", sold);
		return map;
	}
	
	// Thống kê sản phẩm chạy bán và người mua nhiều nhất
	public Map<String, Object> staticsBySellingProducts(Optional<Integer> pageNumber) {
		Map<String, Object> map = new HashMap<>();
		int sizePage = 10;
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		Page<SellingProducts> sellingProducts = orderDetailRepository.staticsBySellingProducts(page);
		long total = sellingProducts.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		List<SellingProducts> ListSellingProducts = sellingProducts.toList();
		for (SellingProducts sellingProduct : ListSellingProducts) {
			sellingProduct.getProductDetail().getProduct().setImageUrl(awsS3Service.getFileS3(sellingProduct.getProductDetail().getProduct().getImage()));
		}
		
		map.put("products", ListSellingProducts);
		map.put("totalPage", totalPage);
		map.put("total", total);
		return map;
	}
	
	public Map<String, Object> staticsByBiggestBuyer(Optional<Integer> pageNumber) {
		Map<String, Object> map = new HashMap<>();
		int sizePage = 20;
		Pageable page = PageRequest.of(pageNumber.orElse(1) - 1, sizePage);
		Page<BiggestBuyer> biggestBuyers = orderDetailRepository.staticsByBiggestBuyer(page);
		long total = biggestBuyers.getTotalElements();
		int totalPage = (int) (total / sizePage);
		if (total % sizePage != 0) {
			totalPage++;
		}
		
		map.put("users", biggestBuyers.toList());
		map.put("totalPage", totalPage);
		map.put("total", total);
		return map;
	}
}
