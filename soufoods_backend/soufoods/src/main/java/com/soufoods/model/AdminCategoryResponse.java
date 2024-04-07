package com.soufoods.model;


import java.util.List;

import com.soufoods.entity.Categories;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminCategoryResponse {
	private int totalPage;
	private Long total;
	private List<Categories> categories;
}
