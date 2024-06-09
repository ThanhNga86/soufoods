import { FacebookLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { FavoriteService } from './../../services/favorite/favorite.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  message: any = {}

  constructor(private userAuthService: UserAuthService, private favoriteService: FavoriteService, private socialAuthService: SocialAuthService) { }
  ngOnInit(): void {
    if (this.userAuthService.authenticated()) {
      location.href = ""
    }

    this.loginWithOAuth2()

    this.checkInput()
  }

  public login(loginForm: NgForm) {
    const btnLogin: any = document.querySelector(".btnLogin")
    btnLogin.disabled = true
    btnLogin.innerHTML = `<span class="loader2"></span> Đăng nhập`
    const loader2: any = document.querySelector(".loader2")
    loader2.style.border = '5px dotted #000'

    this.userAuthService.login(loginForm.value).subscribe((response: any) => {
      this.userAuthService.setToken(response.token)
      this.userAuthService.setRefreshToken(response.refreshToken)

      this.favoriteSave(response)
    }, (error: any) => {
      if (error.status == 403) {
        this.message.error = 'Tài khoản hoặc mật khẩu không chính xác'
      }
      btnLogin.disabled = false
      btnLogin.innerHTML = `Đăng nhập`
    })
  }

  private loginWithOAuth2() {
    const btnLogin: any = document.querySelector(".btnLogin")
    this.socialAuthService.authState.subscribe((data: any) => {
      const loginData: any = {
        email: `${data.id}@gmail.com`,
        firstName: data.firstName,
        lastName: data.lastName,
        provider: data.provider
      }
      btnLogin.disabled = true
      btnLogin.innerHTML = `<span class="loader2"></span> Đăng nhập`
      const loader2: any = document.querySelector(".loader2")
      loader2.style.border = '5px dotted #000'

      this.userAuthService.loginWithOAhtu2(loginData).subscribe((response: any) => {
        this.userAuthService.setToken(response.token)
        this.userAuthService.setRefreshToken(response.refreshToken)

        this.favoriteSave(response)
      }, (error: any) => {
        btnLogin.disabled = true
        btnLogin.innerHTML = `<span class="loader2"></span> Đăng nhập`
        const loader2: any = document.querySelector(".loader2")
        loader2.style.border = '5px dotted #000'
        if (error.status == 403) {
          this.message.error = 'Tài khoản của bạn đã bị khóa'
        }
      })
    })
  }

  public loginWidthFacebook() {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((data: any) => { })
  }

  private favoriteSave(response: any) {
    const arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []
    if (arrFavorite.length == 0) {
      location.href = ""
    } else {
      arrFavorite.forEach((e: any, i: number) => {
        const productId = e.id
        const favorite = {
          token: response.token,
          productId: productId
        }

        this.favoriteService.checkFavoriteBeforeLogin(favorite).subscribe((response: any) => {
          if (i == arrFavorite.length - 1) {
            const timeout = (arrFavorite.length * 10) + 1000
            setTimeout(() => {
              location.href = ""
            }, timeout);
          }
        })
      })
    }
  }

  private checkInput() {
    const inpForm = document.querySelectorAll(".inpForm")

    inpForm.forEach((e: any) => {
      e.addEventListener("input", () => {
        this.message.error = ''
      })
    })
  }
}