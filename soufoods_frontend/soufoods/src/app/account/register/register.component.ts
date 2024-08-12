import Swal from 'sweetalert2';
import { AccountService } from './../../services/account/account.service';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { UserAuthService } from './../../services/auth/user-auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  message: any = {}

  constructor(private accountService: AccountService, private userAuthService: UserAuthService) { }
  ngOnInit(): void {
    if (this.userAuthService.authenticated()) {
      location.href = ""
    }

    this.checkInput()
  }

  private removeVietnameseAccents(str: string): string {
    const accentsMap: { [key: string]: string } = {
      'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
      'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
      'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
      'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
      'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
      'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
      'đ': 'd', 'Đ': 'D'
    };

    return str.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/g, function (match) {
      return accentsMap[match];
    });
  }

  public register(registerForm: NgForm) {
    const btnRegister: any = document.querySelector(".btnRegister")
    btnRegister.disabled = true
    btnRegister.innerHTML = `<span class="loader2"></span> Đăng ký`
    const loader2: any = document.querySelector(".loader2")
    loader2.style.border = '5px dotted #000'

    this.accountService.register(registerForm.value).subscribe((response: any) => {
      if (response.status == '200') {
        Swal.fire("", "Đăng ký thành công", "success")
        this.resetForm()
      } else {
        this.message = response
      }

      btnRegister.disabled = false
      btnRegister.innerHTML = `Đăng ký`
    })
  }

  private resetForm() {
    const inpForm = document.querySelectorAll(".inpForm")

    inpForm.forEach((event: any) => {
      event.value = ''
    })
    this.message = {}
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
