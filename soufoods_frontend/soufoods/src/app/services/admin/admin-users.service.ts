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

  public findAllByEmail(search: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/users/findAllByEmail`, search)
  }

  public filter(filters: any) {
    return this.httpClient.post(`${this.userAuthService.getHost()}/api/admin/users/filter`, filters)
  }

  public findAll(pageNumber: number, sizePage: number) {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/users?pageNumber=${pageNumber}&sizePage=${sizePage}`)
  }

  public findAllUser() {
    return this.httpClient.get(`${this.userAuthService.getHost()}/api/admin/users/all`)
  }

  public update(updateForm: NgForm) {
    return this.httpClient.put(`${this.userAuthService.getHost()}/api/admin/users`, updateForm.value)
  }

  public delete(email: any) {
    return this.httpClient.delete(`${this.userAuthService.getHost()}/api/admin/users/${email}`)
  }
}
