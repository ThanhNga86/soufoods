import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserAuthService } from './../auth/user-auth.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findByEmail(email: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/user/${email}`)
  }

  public register(registerData: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/user`, registerData)
  }

  public update(formData: FormData) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/user`, formData)
  }

  public changePassword(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/user/change-password`, formData)
  }

  public forgotPassword(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/user/forgot-password`, formData)
  }

  public forgotPasswordCf(formData: FormData) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/user/forgot-password`, formData)
  }

  public resetPassword(formData: FormData) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/user/reset-password`, formData)
  }

}
