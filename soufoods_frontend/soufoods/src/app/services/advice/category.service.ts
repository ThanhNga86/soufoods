import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findAll() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/categories`)
  }

  public findAllCategoryDetail() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/categories/categoryDetails`)
  }

  public findAllByCategory(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/categories/findAllByCategory/${id}`)
  }

  public findAllProductByCategory(id: any, pageNumber: number, sizePage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/categories/products/${id}?pageNumber=${pageNumber}&sizePage=${sizePage}`)
  }

  public filterProductByCategory(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/categories/filterProductByCategory`, filters)
  }

  public maxPrice(categoryDetailId: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/categories/maxPrice/${categoryDetailId}`)
  }
}
