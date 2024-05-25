import { AddressService } from './../../services/address/address.service';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { NgForm } from '@angular/forms';
import { AccountService } from './../../services/account/account.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent {
  message: any = {}
  account: any = {}
  address: any = {}

  constructor(private accountService: AccountService, private userAuthService: UserAuthService, private addressService: AddressService) { }
  ngOnInit(): void {
    this.getAccount()

    this.checkInput()

    // Cập nhật thông tin
    const btnSaveInfo: any = document.querySelector(".btnSaveInfo")
    btnSaveInfo.addEventListener("click", () => {
      this.update()
    })

    this.getAddress()

    // Làm mới form thông tin
    const btnResetInfo: any = document.querySelector(".btnResetInfo")
    btnResetInfo.addEventListener("click", () => {
      this.resetInfo()
    })

    // Đổi mật khẩu
    const btnSavePw: any = document.querySelector(".btnSavePw")
    btnSavePw.addEventListener("click", () => {
      this.changePassword()
    })

    // Làm mới form đổi mật khẩu
    const btnResetPw: any = document.querySelector(".btnResetPw")
    btnResetPw.addEventListener("click", () => {
      this.resetPw()
    })
  }

  public update() {
    const formData = new FormData()
    const btnSaveInfo: any = document.querySelector(".btnSaveInfo")
    const btnResetInfo: any = document.querySelector(".btnResetInfo")
    const token = this.userAuthService.getToken()
    const inpFirstName: any = document.querySelector(".inpFirstName")
    const inpLastName: any = document.querySelector(".inpLastName")
    const inpPhone: any = document.querySelector(".inpPhone")
    const inpAddress: any = document.querySelector(".inpAddress")
    const inpProvinces: any = document.querySelector(".inpProvinces")
    const inpDistricts: any = document.querySelector(".inpDistricts")
    const inpWards: any = document.querySelector(".inpWards")

    if (this.validateForm()) {
      formData.append("token", token)
      formData.append("firstName", inpFirstName.value.trim())
      formData.append("lastName", inpLastName.value.trim())
      formData.append("phone", inpPhone.value.trim())
      const address = `${inpAddress.value.trim()}|| ${inpWards.value.trim()}|| ${inpDistricts.value.trim()}|| ${inpProvinces.value.trim()}`
      formData.append("address", address)

      btnSaveInfo.disabled = true
      btnResetInfo.disabled = true
      btnSaveInfo.innerHTML = '<span class="loader2"></span> Lưu thay đổi'

      console.log(true);
      this.accountService.update(formData).subscribe((response: any) => {

        if (response.status == '200') {
          this.resetInfo()
          const changeMessage: any = document.querySelector(".change-message")
          changeMessage.innerText = 'Cập nhật thành công.'
          setTimeout(() => {
            changeMessage.innerText = ''
          }, 2000);
        } else {
          this.message = response
        }

        btnSaveInfo.disabled = false
        btnResetInfo.disabled = false
        btnSaveInfo.innerHTML = 'Lưu thay đổi'
      })
    }

  }

  private validateForm() {
    const inpForm = document.querySelectorAll(".inpForm")
    var check = true

    inpForm.forEach((event: any) => {
      if (event.value == '') {
        event.style.boxShadow = "0 0 0 2px lightcoral"
        check = false
      }
    })

    inpForm.forEach((event: any) => {
      event.addEventListener("focus", () => {
        event.style.boxShadow = '0 0 0 2px rgb(255, 222, 170)'
        event.style.borderColor = 'rgb(255, 222, 170)'
      })
      event.addEventListener("blur", () => {
        event.style.boxShadow = 'none'
        event.style.borderColor = 'lightgray'
      })
    })

    return check
  }

  private resetInfo() {
    const credentials = this.userAuthService.getCredentials()
    const btnResetInfo: any = document.querySelector(".btnResetInfo")
    const btnSaveInfo: any = document.querySelector(".btnSaveInfo")
    const inpFirstName: any = document.querySelector(".inpFirstName")
    const inpLastName: any = document.querySelector(".inpLastName")
    const inpPhone: any = document.querySelector(".inpPhone")
    const inpAddress: any = document.querySelector(".inpAddress")
    const inpProvinces: any = document.querySelector(".inpProvinces")
    const inpDistricts: any = document.querySelector(".inpDistricts")
    const inpWards: any = document.querySelector(".inpWards")

    btnResetInfo.disabled = true
    btnSaveInfo.disabled = true
    btnResetInfo.innerHTML = '<span class="loader2"></span> Khôi phục'

    this.accountService.findByEmail(credentials.sub).subscribe((response: any) => {
      if (response.status == '200') {
        this.account = response.user
        if (this.account.address != null) {
          this.account.address = this.account.address.split('||')
          inpAddress.value = this.account.address[0]
          inpProvinces.style.boxShadow = 'none'
          inpProvinces.style.borderColor = 'lightgray'
          inpDistricts.style.boxShadow = 'none'
          inpDistricts.style.borderColor = 'lightgray'
          inpWards.style.boxShadow = 'none'
          inpWards.style.borderColor = 'lightgray'

          setTimeout(() => {
            const inpProvinces: any = document.querySelector(".inpProvinces")
            const inpDistricts: any = document.querySelector(".inpDistricts")
            const inpWards: any = document.querySelector(".inpWards")

            // lọc theo mã tỉnh / thành
            var option = inpProvinces.options[inpProvinces.selectedIndex];
            const provincesCode = option.getAttribute("code")
            this.addressService.findAllByDistricts(provincesCode).subscribe((response: any) => {
              inpDistricts.innerHTML = `<option value="">Chọn Quận / Huyện</option>`
              inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
              for (const item of response) {
                if (item.name_with_type == this.account.address[2].trim()) {
                  inpDistricts.innerHTML += `<option value="${item.name_with_type}" selected code="${item.code}">${item.name_with_type}</option>`
                } else {
                  inpDistricts.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
                }
              }

              // lọc theo mã quận / huyện
              var option = inpDistricts.options[inpDistricts.selectedIndex];
              const districtsCode = option.getAttribute("code")
              this.addressService.findAllByWards(districtsCode).subscribe((response: any) => {
                inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
                for (const item of response) {
                  if (item.name_with_type == this.account.address[1].trim()) {

                    inpWards.innerHTML += `<option value="${item.name_with_type}" selected code="${item.code}">${item.name_with_type}</option>`
                  } else {
                    inpWards.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
                  }
                }

                btnResetInfo.disabled = false
                btnSaveInfo.disabled = false
                btnResetInfo.innerHTML = 'Khôi phục'
              })
            })
          }, 100);
        } else {
          inpAddress.value = this.account.address
          btnResetInfo.disabled = false
          btnSaveInfo.disabled = false
          btnResetInfo.innerHTML = 'Khôi phục'
        }

        inpFirstName.value = this.account.firstName
        inpLastName.value = this.account.lastName
        inpPhone.value = this.account.phone

        this.message = {}
      } else {
        console.error("Không tìm thấy email này.")
        btnResetInfo.disabled = false
        btnSaveInfo.disabled = false
        btnResetInfo.innerHTML = 'Khôi phục'
      }

    })
  }

  private changePassword() {
    const btnSavePw: any = document.querySelector(".btnSavePw")
    const btnResetPw: any = document.querySelector(".btnResetPw")
    const token = this.userAuthService.getToken()
    const inpPasswordOld: any = document.querySelector(".inpPasswordOld")
    const inpPasswordNew: any = document.querySelector(".inpPasswordNew")
    const inpPasswordNewCf: any = document.querySelector(".inpPasswordNewCf")
    const formData = new FormData()

    formData.append("token", token)
    formData.append("passwordOld", inpPasswordOld.value)
    formData.append("passwordNew", inpPasswordNew.value)
    formData.append("passwordNewCf", inpPasswordNewCf.value)

    btnSavePw.disabled = true
    btnResetPw.disabled = true
    btnSavePw.innerHTML = '<span class="loader2"></span> Lưu thay đổi'

    this.accountService.changePassword(formData).subscribe((response: any) => {
      if (response.status == '200') {
        this.resetPw()
        const changePwMessage: any = document.querySelector(".changePw-message")
        changePwMessage.innerText = 'Cập nhật thành công.'
        setTimeout(() => {
          changePwMessage.innerText = ''
        }, 2000);
      } else {
        this.message = response
      }

      btnSavePw.disabled = false
      btnResetPw.disabled = false
      btnSavePw.innerHTML = 'Lưu thay đổi'
    })
  }

  private resetPw() {
    const inpFormPw = document.querySelectorAll(".inpFormPw")
    const btnResetPw: any = document.querySelector(".btnResetPw")

    btnResetPw.disabled = true
    btnResetPw.innerHTML = '<span class="loader2"></span> Khôi phục'
    inpFormPw.forEach((e: any) => {
      e.value = ''
    })

    this.message = {}
    btnResetPw.disabled = false
    btnResetPw.innerHTML = 'Khôi phục'
  }

  private getAddress() {
    this.addressService.findAllByProvinces().subscribe((response: any) => {
      this.address.provinces = response.data.data

      this.handleAddress()

      setTimeout(() => {
        if (this.account.address != null) {
          const inpProvinces: any = document.querySelector(".inpProvinces")
          const inpDistricts: any = document.querySelector(".inpDistricts")
          const inpWards: any = document.querySelector(".inpWards")

          // lọc theo mã tỉnh / thành
          var option = inpProvinces.options[inpProvinces.selectedIndex];
          const provincesCode = option.getAttribute("code")
          this.addressService.findAllByDistricts(provincesCode).subscribe((response: any) => {
            inpDistricts.innerHTML = `<option value="">Chọn Quận / Huyện</option>`
            inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
            for (const item of response) {
              if (item.name_with_type == this.account.address[2].trim()) {
                inpDistricts.innerHTML += `<option value="${item.name_with_type}" selected code="${item.code}">${item.name_with_type}</option>`
              } else {
                inpDistricts.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
              }
            }

            // lọc theo mã quận / huyện
            var option = inpDistricts.options[inpDistricts.selectedIndex];
            const districtsCode = option.getAttribute("code")
            this.addressService.findAllByWards(districtsCode).subscribe((response: any) => {
              inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
              for (const item of response) {
                if (item.name_with_type == this.account.address[1].trim()) {

                  inpWards.innerHTML += `<option value="${item.name_with_type}" selected code="${item.code}">${item.name_with_type}</option>`
                } else {
                  inpWards.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
                }
              }
            })
          })
        }
      }, 500);
    })
  }

  public handleAddress() {
    const inpProvinces: any = document.querySelector(".inpProvinces")
    const inpDistricts: any = document.querySelector(".inpDistricts")
    const inpWards: any = document.querySelector(".inpWards")

    inpProvinces.addEventListener("change", () => {
      var option = inpProvinces.options[inpProvinces.selectedIndex];
      const code = option.getAttribute("code")
      this.addressService.findAllByDistricts(code).subscribe((response: any) => {
        inpDistricts.innerHTML = `<option value="">Chọn Quận / Huyện</option>`
        inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
        for (const item of response) {
          inpDistricts.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
        }
      })

      if (this.account.address != null) {
        this.account.address[3] = inpProvinces.value
      }
    })

    inpDistricts.addEventListener("change", () => {
      var option = inpDistricts.options[inpDistricts.selectedIndex];
      const code = option.getAttribute("code")
      this.addressService.findAllByWards(code).subscribe((response: any) => {
        inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
        for (const item of response) {
          inpWards.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
        }
      })
    })
  }

  private getAccount() {
    const credentials = this.userAuthService.getCredentials();
    this.accountService.findByEmail(credentials.sub).subscribe((response: any) => {
      if (response.status == '200') {
        this.account = response.user
        if (this.account.address != null) {
          this.account.address = this.account.address.split('||')
        }
      } else {
        console.error("Không tìm thấy email này.")
      }
    })
  }

  private checkInput() {
    const inpForm = document.querySelectorAll(".inpForm")
    const inpFormPw = document.querySelectorAll(".inpFormPw")

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

    inpFormPw.forEach((event: any) => {
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
