package com.soufoods.model;

import java.util.List;

import com.soufoods.entity.Favorite;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteResponse {
	private int totalPage;
	private Long total;
	private List<Favorite> favorites;
}
