package com.soufoods.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soufoods.entity.OrderDetail;
import com.soufoods.entity.Product;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

	@Query("select u.productDetail.product from OrderDetail u where "
			+ "u.productDetail.active = true and u.productDetail.product.active = true and u.productDetail.product.categoryDetail.active = true and u.productDetail.product.categoryDetail.category.active = true "
			+ "group by u.productDetail.product "
			+ "having sum(u.quantity) > 5 "
			+ "order by sum(u.quantity) desc")
	Page<Product> findAllSellingProducts(Pageable page);
	
	@Query("select max(sub.maxPrice) from ("
            + "select max(u.productDetail.price) as maxPrice "
            + "from OrderDetail u "
            + "where u.productDetail.active = true and u.productDetail.product.active = true and u.productDetail.product.categoryDetail.active = true and u.productDetail.product.categoryDetail.category.active = true "
            + "group by u.productDetail.product "
            + "having sum(u.quantity) > 5) sub")
	Double maxPriceBySellingProducts(Long id);

	@Query("select u.productDetail.product from OrderDetail u where "
			+ "(:quantity is null or (:quantity = 0 and u.productDetail.quantity = 0) or (:quantity = 1 and u.productDetail.quantity > 0)) "
			+ "and (:discount is null or (:discount = 0 and u.productDetail.discount = 0) or (:discount = 1 and u.productDetail.discount > 0)) "
			+ "and (u.productDetail.price between :minPrice and :maxPrice) "
			+ "and u.productDetail.active = true and u.productDetail.product.active = true and u.productDetail.product.categoryDetail.active = true and u.productDetail.product.categoryDetail.category.active = true "
			+ "order by u.id desc")
	Page<Product> filterProductBySellingProducts(@Param("quantity") Integer quantity, @Param("discount") Double discount,
			@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, Pageable page);

}
