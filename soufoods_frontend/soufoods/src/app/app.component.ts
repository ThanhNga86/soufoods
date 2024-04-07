import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserAuthService } from './services/auth/user-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'soufoods';

  constructor(private userAuthService: UserAuthService, private jwtHepler: JwtHelperService, private router: Router) { }

  ngOnInit(): void {
    // Làm mới Token khi hết hạn
    const refreshTokenTime = setInterval(() => {
      if (this.userAuthService.getRefreshToken() && !(this.jwtHepler.isTokenExpired(this.userAuthService.getRefreshToken()))) {
        this.userAuthService.refreshToken().subscribe((response: any) => {
          this.userAuthService.setToken(response.token)
          this.userAuthService.setRefreshToken(response.refreshToken)
        }, (error: any) => {
          localStorage.removeItem("jwtToken")
          localStorage.removeItem("jwtTokenRefresh")
          clearInterval(refreshTokenTime);
        })
      } else {
        localStorage.removeItem("jwtToken")
        localStorage.removeItem("jwtTokenRefresh")
        clearInterval(refreshTokenTime);
      }
    }, 10000)
  }

}
