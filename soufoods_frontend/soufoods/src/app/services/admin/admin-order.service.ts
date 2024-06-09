import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public orderCancel(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/orders/cancel/${id}`)
  }

  public findAllByApply(pageNumber: number, sizePage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/orders/apply?pageNumber=${pageNumber}&sizePage=${sizePage}`)
  }

  public findAll(pageNumber: number, sizePage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/orders?pageNumber=${pageNumber}&sizePage=${sizePage}`)
  }

  public findAllByOrder(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/orderDetails/findAllByOrder/${id}`)
  }

  public filter(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/orders/filter`, filters)
  }

  public filterByWaitStatus(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/orders/filterByWaitStatus`, filters)
  }
}
