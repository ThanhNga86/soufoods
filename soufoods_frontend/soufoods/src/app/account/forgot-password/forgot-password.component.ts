import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAuthService } from './../../services/auth/user-auth.service';
import { AccountService } from './../../services/account/account.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  message: any = {}
  forgotConfirm: boolean = false
  info: any = {}

  constructor(private accountService: AccountService, private userAuthService: UserAuthService, private router: Router, private activatedRoute: ActivatedRoute) { }
  ngOnInit(): void {
    if (this.userAuthService.authenticated()) {
      location.href = ""
    }

    // Khôi phục mật khẩu
    setTimeout(() => {
      const btnForgot: any = document.querySelector(".btnForgot")
      if (btnForgot) {
        btnForgot.addEventListener("click", () => {
          this.forgotPassword()
        })
      }
      this.checkInput()
    }, 200);

    // Xác nhận khôi phục mật khẩu
    this.forgotPasswordCf()
  }

  private forgotPassword() {
    const inpEmail: any = document.querySelector(".inpEmail")
    const btnForgot: any = document.querySelector(".btnForgot")
    const formData = new FormData()

    formData.set("email", inpEmail.value)

    btnForgot.disabled = true
    btnForgot.innerHTML = `<span class="loader2"></span> Khôi phục`
    const loader2: any = document.querySelector(".loader2")
    loader2.style.border = '5px dotted #000'

    this.accountService.forgotPassword(formData).subscribe((response: any) => {
      if (response.status == '200') {
        inpEmail.value = ''
        Swal.fire(`<span style="font-size: 18px;">Chúng tôi đã gửi bạn email có link đặt lại mật khẩu.</span>`,
          `<span style="font-size: medium;">Có thể mất vài phút để hiển thị trong hộp thư đến của bạn. Vui lòng đợi ít nhất 10 phút trước khi thử thiết lập lại lần nữa.</span>`, "success")
        this.router.navigateByUrl("/account/login")
      } else {
        this.message = response
      }

      btnForgot.disabled = false
      btnForgot.innerHTML = `Khôi phục`
    })
  }

  private forgotPasswordCf() {
    const id: any = this.activatedRoute.snapshot.paramMap.get("id")
    const validCode: any = this.activatedRoute.snapshot.paramMap.get("validCode")
    const formData = new FormData()

    if (id && validCode) {
      this.forgotConfirm = true
      formData.set("id", id)
      formData.set("validCode", validCode)

      this.accountService.forgotPasswordCf(formData).subscribe((response: any) => {
        if (response.status == '200') {
          this.info.email = response.email

          const currentTime: any = document.querySelector(".currentTime")
          const expiration = moment(response.expiration);
          const loadTime = setInterval(() => {
            const timeMoment = moment.duration(expiration.diff(moment()))
            const hours = Math.floor(timeMoment.asHours());
            const minutes = timeMoment.minutes();
            const seconds = timeMoment.seconds();

            currentTime.innerHTML = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            if (hours == 0 && minutes == 0 && seconds == 0) {
              clearInterval(loadTime)

              this.router.navigateByUrl("/account/forgot-password")
              this.forgotConfirm = false
              Swal.fire("", "Thời hạn đặt lại mật khẩu đã hết. Vui lòng thử lại !", "error")
              setTimeout(() => {
                const btnForgot: any = document.querySelector(".btnForgot")
                if (btnForgot) {
                  btnForgot.addEventListener("click", () => {
                    this.forgotPassword()
                  })
                }
                this.checkInput()
              }, 200);
            }
          }, 1000)

          const btnResetPassword: any = document.querySelector(".btnResetPassword")
          btnResetPassword.addEventListener("click", () => {
            this.resetPassword()
          })
        } else {
          this.router.navigateByUrl("/account/forgot-password")
          this.forgotConfirm = false
          if (response.error) {
            Swal.fire("", response.error, "error")
          }

          setTimeout(() => {
            const btnForgot: any = document.querySelector(".btnForgot")
            if (btnForgot) {
              btnForgot.addEventListener("click", () => {
                this.forgotPassword()
              })
            }
            this.checkInput()
          }, 200);
        }
      })
    }
  }

  private resetPassword() {
    const btnResetPassword: any = document.querySelector(".btnResetPassword")
    const id: any = this.activatedRoute.snapshot.paramMap.get("id")
    const validCode: any = this.activatedRoute.snapshot.paramMap.get("validCode")
    const inpPassword: any = document.querySelector(".inpPassword")
    const inpPasswordCf: any = document.querySelector(".inpPasswordCf")
    const formData = new FormData()

    formData.set("id", id)
    formData.set("validCode", validCode)
    formData.set("password", inpPassword.value)
    formData.set("passwordCf", inpPasswordCf.value)

    btnResetPassword.disabled = true
    btnResetPassword.innerHTML = `<span class="loader2"></span> Đặt lại mật khẩu`
    const loader2: any = document.querySelector(".loader2")
    loader2.style.border = '5px dotted #000'

    this.accountService.resetPassword(formData).subscribe((response: any) => {
      if (response.status == '200') {
        Swal.fire("", "Đặt lại mật khẩu thành công", "success")
        this.router.navigateByUrl("/account/login")
      } else {
        this.message = response

        if (response.error) {
          this.router.navigateByUrl("/account/forgot-password")
          this.forgotConfirm = false
          Swal.fire("", response.error, "error")
          setTimeout(() => {
            const btnForgot: any = document.querySelector(".btnForgot")
            if (btnForgot) {
              btnForgot.addEventListener("click", () => {
                this.forgotPassword()
              })
            }
            this.checkInput()
          }, 200);
        }
      }

      btnResetPassword.disabled = false
      btnResetPassword.innerHTML = `Đặt lại mật khẩu`
    })
  }

  private checkInput() {
    const inpForm = document.querySelectorAll(".inpForm")

    inpForm.forEach((event: any) => {
      event.addEventListener("input", () => {
        const name = event.getAttribute("name")
        for (const key in this.message) {
          if (key == name) {
            this.message[key] = ''
          }
        }
      })
    })
  }
}
