import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShipService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public orderApply(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/shipment/apply-order/${id}`)
  }

  public orderCancel(id: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/shipment/cancel-order/${id}`)
  }

  public shipFee(address: string, province: string, district: string, ward: string, weight: number, value: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/shipment/fee?address=${address}&province=${province}&district=${district}&ward=${ward}&weight=${weight}&value=${value}`)
  }
}
