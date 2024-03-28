import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Injectable } from '@angular/core';
import { UserAuthService } from '../auth/user-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {

  constructor(private httpClient: HttpClient, private userAuthService: UserAuthService) { }

  public findByEmail(email: any) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/users/${email}`)
  }

  public filter(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/users/filter`, filters)
  }

  public findAll(pageNumber: number, totalPage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/users?pageNumber=${pageNumber}&totalPage=${totalPage}`)
  }

  public update(updateForm: NgForm) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/admin/users`, updateForm.value)
  }

  public delete(email: any) {
    return this.httpClient.delete(`${this.userAuthService.getHost()}/api/admin/users/${email}`)
  }
}
