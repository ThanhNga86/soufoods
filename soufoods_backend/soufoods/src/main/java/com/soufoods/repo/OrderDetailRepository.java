package com.soufoods.repo;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.BiggestBuyer;
import com.soufoods.entity.OrderDetail;
import com.soufoods.entity.Product;
import com.soufoods.entity.SellingProducts;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

	@Query("from OrderDetail u where " + "u.order.id = ?1")
	List<OrderDetail> findAllByOrder(Long id);

	@Query("select u.productDetail.product from OrderDetail u where "
			+ "u.productDetail.active = true and u.productDetail.product.active = true and u.productDetail.product.categoryDetail.active = true and u.productDetail.product.categoryDetail.category.active = true "
			+ "group by u.productDetail.product " + "having sum(u.quantity) > 5 " + "order by sum(u.quantity) desc")
	Page<Product> findAllSellingProducts(Pageable page);

	@Query("select max(sub.maxPrice) from (" + "select max(u.productDetail.price) as maxPrice " + "from OrderDetail u "
			+ "where u.productDetail.active = true and u.productDetail.product.active = true and u.productDetail.product.categoryDetail.active = true and u.productDetail.product.categoryDetail.category.active = true "
			+ "group by u.productDetail.product " + "having sum(u.quantity) > 5) sub")
	Double maxPriceBySellingProducts(Long id);

	@Query("select u.productDetail.product from OrderDetail u where "
			+ "(:quantity is null or (:quantity = 0 and u.productDetail.quantity = 0) or (:quantity = 1 and u.productDetail.quantity > 0)) "
			+ "and (:discount is null or (:discount = 0 and u.productDetail.discount = 0) or (:discount = 1 and u.productDetail.discount > 0)) "
			+ "and (u.productDetail.price between :minPrice and :maxPrice) "
			+ "and u.productDetail.active = true and u.productDetail.product.active = true and u.productDetail.product.categoryDetail.active = true and u.productDetail.product.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> filterProductBySellingProducts(@Param("quantity") Integer quantity,
			@Param("discount") Double discount, @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice,
			Pageable page);

	@Query("select count(u.productDetail) from OrderDetail u")
	Long staticsBySold();

	// Thống kê doanh thu
	@Query("select sum(u.price*(100-u.discount)/100 * u.quantity) from OrderDetail u "
			+ "where (:fromDate IS NULL OR DATE(u.order.createDate) >= :fromDate) AND (:toDate IS NULL OR DATE(u.order.createDate) <= :toDate)")
	Long revenueByDate(Date fromDate, Date toDate);

	@Query("SELECT SUM(u.quantity) FROM OrderDetail u "
			+ "where (:fromDate IS NULL OR DATE(u.order.createDate) >= :fromDate) AND (:toDate IS NULL OR DATE(u.order.createDate) <= :toDate)")
	Long soldByDate(Date fromDate, Date toDate);

	@Query("select new SellingProducts(u.productDetail.product.id, u.productDetail, sum(u.price*(100-u.discount)/100), sum(u.quantity)) from OrderDetail u "
	        + "group by u.productDetail.product.id, u.productDetail "
	        + "order by sum(u.quantity) desc")
	Page<SellingProducts> staticsBySellingProducts(Pageable page);
	
	@Query("select new BiggestBuyer(u.order.user.id, u.order.user, sum(u.price*(100-u.discount)/100), sum(u.quantity)) from OrderDetail u "
			+ "group by u.order.user.id, u.order.user "
			+ "order by sum(u.price*(100-u.discount)/100) desc")
	Page<BiggestBuyer> staticsByBiggestBuyer(Pageable page);
}
