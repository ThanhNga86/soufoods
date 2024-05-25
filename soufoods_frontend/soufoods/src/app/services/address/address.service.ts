import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public update(formData: FormData){
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/user/address`, formData)
  }

  public findAllByProvinces() {
    return this.httpClient.get(`../../../assets/json/address/provinces.json`);
  }

  public findAllByDistricts(parent_code: any) {
    return this.httpClient.get<any[]>(`../../../assets/json/address/districts.json`)
      .pipe(
        map((response: any) => response.data.data.filter((item: any) => item.parent_code === parent_code))
      );
  }

  public findAllByWards(parent_code: any) {
    return this.httpClient.get(`../../../assets/json/address/wards.json`).pipe(
      map((response: any) => response.data.data.filter((item: any) => item.parent_code === parent_code))
    );
  }
}
