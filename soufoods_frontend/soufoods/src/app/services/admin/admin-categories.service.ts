import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserAuthService } from '../auth/user-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminCategoriesService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findById(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/categories/${id}`)
  }

  public filter(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/categories/filter`, filters)
  }

  public findAllCategory() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/categories/all`)
  }

  public findAll(pageNumber: number, sizePage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/categories?pageNumber=${pageNumber}&sizePage=${sizePage}`)
  }

  public add(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/categories`, formData)
  }

  public update(formData: FormData) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/admin/categories`, formData)
  }

  public delete(id: number) {
    return this.httpClient.delete(`${this.userAuthService.getHost()}/api/admin/categories/${id}`)
  }

  public findAllCategoryDetail() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/categoryDetail/all`)
  }

  public findAllCategoryDetailByCategory(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/categoryDetail/all/${id}`)
  }

  public addCategoryDetail(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/categoryDetail`, formData)
  }

  public updateCategoryDetail(formData: FormData) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/admin/categoryDetail`, formData)
  }

  public deleteCategoryDetail(id: number) {
    return this.httpClient.delete(`${this.userAuthService.getHost()}/api/admin/categoryDetail/${id}`)
  }
}
