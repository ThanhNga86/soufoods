import { AddressService } from './../../../services/address/address.service';
import { AccountService } from './../../../services/account/account.service';
import { UserAuthService } from './../../../services/auth/user-auth.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pick-address',
  templateUrl: './pick-address.component.html',
  styleUrls: ['./pick-address.component.css']
})
export class PickAddressComponent implements OnInit {
  account: any = {}
  address: any = {}
  ngOnInit(): void {
    this.getAccount()

    this.getAddress()

    this.update()

    this.resetForm()
  }

  constructor(private userAuthService: UserAuthService, private accountService: AccountService, private addressService: AddressService) { }

  private update() {
    const btnSave: any = document.querySelector(".btnSave")
    const btnReset: any = document.querySelector(".btnReset")

    btnSave.addEventListener("click", () => {
      const inpAddress: any = document.querySelector(".inpAddress")
      const inpProvinces: any = document.querySelector(".inpProvinces")
      const inpDistricts: any = document.querySelector(".inpDistricts")
      const inpWards: any = document.querySelector(".inpWards")

      if (this.validateForm()) {
        const formData = new FormData()
        btnSave.disalbed = true
        btnReset.disalbed = true
        btnSave.innerHTML = '<span class="loader2"></span> Cập nhật'
        formData.append("token", this.userAuthService.getToken())
        const address = `${inpAddress.value.trim()}|| ${inpWards.value.trim()}|| ${inpDistricts.value.trim()}|| ${inpProvinces.value.trim()}`
        formData.append("address", address)

        this.addressService.update(formData).subscribe((response: any) => {
          if (response.status == '200') {
            Swal.fire("", "Cập nhật địa chỉ lấy hàng thành công.", "success")
            this.getAccount()
          } else {
            alert("Lỗi không xác định !")
          }

          btnSave.disalbed = false
          btnReset.disalbed = false
          btnSave.innerHTML = 'Cập nhật'
        })
      }
    })
  }

  private resetForm() {
    const btnReset: any = document.querySelector(".btnReset")
    btnReset.addEventListener("click", () => {
      const inpAddress: any = document.querySelector(".inpAddress")
      const inpProvinces: any = document.querySelector(".inpProvinces")
      const inpDistricts: any = document.querySelector(".inpDistricts")
      const inpWards: any = document.querySelector(".inpWards")

      inpAddress.value = ''
      inpProvinces.selectedIndex = 0
      inpDistricts.innerHTML = `<option value="">Chọn Quận / Huyện</option>`
      inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
    })
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
}
