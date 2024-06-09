import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findById(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/product/${id}`)
  }

  public findAllBysimilaire(productId: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/product/similaire?productId=${productId}`)
  }

  public findAllByProduct(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/findAllByProduct/${id}`)
  }

  public findDetailById(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/product/detail/${id}`)
  }

  public productSearch(search: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/search`, search)
  }

  public filterProductBySearch(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/search/filter`, filters)
  }

  public maxPrice(search: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/search/maxPrice/${search}`)
  }
}
