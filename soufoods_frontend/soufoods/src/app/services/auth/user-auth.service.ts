import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private host: string = 'http://localhost:8080'
  // private host: string = 'https://d2dy0hlalwvpdm.cloudfront.net'
  requestHeader = new HttpHeaders({ "No-Auth": "True" })
  constructor(private HttpClient: HttpClient, private jwtHelper: JwtHelperService, private socialAuthService: SocialAuthService) { }

  public getHost(): string {
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

  public login(loginData: any): any {
    return this.HttpClient.post(`${this.host}/api/authentication`, loginData, { headers: this.requestHeader })
  }

  public loginWithOAhtu2(loginData: any): any {
    return this.HttpClient.post(`${this.host}/api/authentication/oauth2`, loginData, { headers: this.requestHeader })
  }

  public logout(): void {
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("jwtTokenRefresh")
    this.HttpClient.post<any>(`${this.host}/api/authentication/logout`, {});
    this.socialAuthService.signOut()
  }
}
