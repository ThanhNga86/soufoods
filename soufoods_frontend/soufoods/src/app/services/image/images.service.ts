import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findAllByProduct(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/images/product/${id}`)
  }

  public findAllByReview(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/images/review/${id}`)
  }
}
