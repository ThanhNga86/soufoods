import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findAll(pageNumber: number, productId: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/review?pageNumber=${pageNumber}&productId=${productId}`)
  }

  public review(review: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/review`, review)
  }
}
