import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminVouchersService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findById(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/vouchers/${id}`)
  }

  public filter(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/vouchers/filter`, filters)
  }

  public findAll(pageNumber: number, sizePage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/vouchers?pageNumber=${pageNumber}&sizePage=${sizePage}`)
  }

  public createDiscount() {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/vouchers/createDiscountCode`, {})
  }

  public add(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/vouchers`, formData)
  }

  public update(formData: FormData) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/admin/vouchers`, formData)
  }

  public delete(id: number) {
    return this.httpClient.delete(`${this.userAuthService.getHost()}/api/admin/vouchers/${id}`)
  }
}
