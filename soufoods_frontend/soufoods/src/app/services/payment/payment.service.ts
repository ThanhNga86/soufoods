import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public payment(formData: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/payment`, formData)
  }
}
