import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public orderCancel(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/order/cancel/${id}`)
  }

  public findAllByUser(token: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/order/all?token=${token}`)
  }

  public findAllByStatus(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/order`, formData)
  }

  public findAllByOrder(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/order/findAllByOrder/${id}`)
  }
}
