import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private host: String = 'http://localhost:8080'
  requestHeader = new HttpHeaders({ "No-Auth": "True" })
  constructor(private HttpClient: HttpClient, private jwtHelper: JwtHelperService) { }

  public getHost(): String {
    return this.host;
  }

  public setToken(jwtToken: any): void {
    localStorage.setItem("jwtToken", jwtToken)
  }

  public getToken(): any {
    return localStorage.getItem("jwtToken")
  }

  public setRefreshToken(jwtTokenRefresh: any): void {
    localStorage.setItem("jwtTokenRefresh", jwtTokenRefresh)
  }

  public getRefreshToken(): any {
    return localStorage.getItem("jwtTokenRefresh")
  }

  public authenticated(): boolean {
    return this.getToken() && !(this.jwtHelper.isTokenExpired(this.getToken()))
  }

  public getCredentials(): any {
    if (this.authenticated()) {
      return this.jwtHelper.decodeToken(this.getToken())
    } else {
      console.error("Người dùng chưa xác thực !")
    }
  }

  public hasRole(role: string): boolean {
    let checkRole = false;
    const userRole: any = this.getCredentials().role.substring(5).toLowerCase()

    if (userRole != null && userRole) {
      if (userRole === role) {
        checkRole = true
        return checkRole
      } else {
        return checkRole
      }
    } else {
      return checkRole
    }
  }

  public refreshToken(): any {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getRefreshToken()}`
    });
    return this.HttpClient.post(`${this.host}/api/authentication/refresh`, { headers: headers })
  }

  public login(loginData: NgForm): any {
    return this.HttpClient.post(`${this.host}/api/authentication`, loginData.value, { headers: this.requestHeader })
  }

  public logout(): void {
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("jwtTokenRefresh")
    this.HttpClient.post<any>(`${this.host}/api/authentication/logout`, {});
  }
}
