import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findAll(pageNumber: number, email: string) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/voucher?pageNumber=${pageNumber}&email=${email}`)
  }

  public applyVoucher(voucher: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/voucher`, voucher)
  }
}
