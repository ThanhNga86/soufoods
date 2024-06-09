import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findAllCategoryDetail() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/categoryDetails`)
  }

  public findAllPromotionProduct() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/promotionProducts`)
  }

  public findAllProductByCategory(name: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/findAllProduct/${name}`)
  }

  public findAllSellingProducts() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/sellingProducts`)
  }
}
