import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage: any

  constructor(private userAuthService: UserAuthService, private router: Router) { }
  ngOnInit(): void {

  }

  login(loginForm: NgForm) {
    this.userAuthService.login(loginForm).subscribe((response: any) => {
      this.userAuthService.setToken(response.token)
      this.userAuthService.setRefreshToken(response.refreshToken)
      this.router.navigateByUrl("/admin/dashboard")
    }, (error:any) => {
      if (error.status == 403) {
        this.errorMessage = 'Tài khoản hoặc mật khẩu không chính xác'
      }
    })
  }

}
