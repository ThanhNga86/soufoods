import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminProductsService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findById(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/products/${id}`)
  }

  public filter(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/products/filter`, filters)
  }

  public findAll(pageNumber: number, sizePage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/products?pageNumber=${pageNumber}&sizePage=${sizePage}`)
  }

  public add(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/products`, formData)
  }

  public update(formData: FormData) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/admin/products`, formData)
  }

  public delete(id: number) {
    return this.httpClient.delete(`${this.userAuthService.getHost()}/api/admin/products/${id}`)
  }

  public findAllProductDetailByProduct(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/productdetail/all/${id}`)
  }

  public addProductDetail(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/productdetail`, formData)
  }

  public updateProductDetail(formData: FormData) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/admin/productdetail`, formData)
  }

  public deleteProductDetail(id: number) {
    return this.httpClient.delete(`${this.userAuthService.getHost()}/api/admin/productdetail/${id}`)
  }

}
