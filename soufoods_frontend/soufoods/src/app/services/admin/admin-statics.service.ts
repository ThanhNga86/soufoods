import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminStaticsService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  // Thống kê chỉ số
  public staticsByUser() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/users`)
  }

  public staticsByCategory() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/categories`)
  }

  public staticsByProduct() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/products`)
  }

  public staticsByOrder() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/orders`)
  }

  public staticsByReview() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/reviews`)
  }

  public staticsByVoucher() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/vouchers`)
  }

  // Thống kê doanh thu
  public staticsByYesterday() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/yesterday`)
  }

  public staticsByToday() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/today`)
  }

  public staticsByWeek() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/week`)
  }

  public staticsByMonth() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/month`)
  }

  public staticsByTotal(fromDate: any, toDate: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/total?fromDate=${fromDate}&toDate=${toDate}`)
  }

  // Thống kê sản phẩm chạy bán và người mua nhiều nhất
  public staticsBySellingProducts(pageNumber: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/sellingProducts?pageNumber=${pageNumber}`)
  }

  public staticsByBiggestBuyer(pageNumber: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/statics/biggestBuyer?pageNumber=${pageNumber}`)
  }
}
