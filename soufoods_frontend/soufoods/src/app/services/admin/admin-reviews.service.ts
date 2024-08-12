import { UserAuthService } from './../auth/user-auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminReviewsService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findById(id: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/reviews/${id}`)
  }

  public filter(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/reviews/filter`, filters)
  }

  public findAll(pageNumber: number, sizePage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/reviews?pageNumber=${pageNumber}&sizePage=${sizePage}`)
  }

  public hiddenAndShowReview(formData: FormData) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/admin/reviews/hiddenAndShow`, formData)
  }
}
