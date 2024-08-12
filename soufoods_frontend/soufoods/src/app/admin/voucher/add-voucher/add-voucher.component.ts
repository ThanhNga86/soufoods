import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AdminUsersService } from 'src/app/services/admin/admin-users.service';
import { AdminVouchersService } from './../../../services/admin/admin-vouchers.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-voucher',
  templateUrl: './add-voucher.component.html',
  styleUrls: ['./add-voucher.component.css']
})
export class AddVoucherComponent implements OnInit {
  message: any = {}
  defaultSave: any = {}
  categories: any[] = []

  constructor(private adminVouchersService: AdminVouchersService, private adminUsersService: AdminUsersService, private httpClient: HttpClient) { }

  ngOnInit(): void {
    // Xử lý phần input sẽ tắt message nếu input đó lỗi
    this.checkInput()

    // Xử lý phần thay đổi form type discount
    this.handleDiscountTo()

    // Xử lý phần loại email
    this.handleSendEmailType()

    // Xử lý phần thêm email
    this.addEmailForVoucher()

    // thêm voucher
    const btnSave: any = document.querySelector(".btnSave")
    btnSave.addEventListener("click", () => {
      this.add()
    })

    // làm mới form
    const btnReset: any = document.querySelector(".btnReset")
    btnReset.addEventListener("click", () => {
      this.resetForm()
    })
  }

  private add() {
    const formData = new FormData()
    const btnSave: any = document.querySelector(".btnSave")
    const btnReset: any = document.querySelector(".btnReset")
    const sendEmailType: any = document.querySelector(".sendEmailType")
    const inpExpiration: any = document.querySelector(".inpExpiration")
    const inpFreeShip: any = document.querySelector(".inpFreeShip")
    const inpDiscount: any = document.querySelector(".inpDiscount")
    const inpPriceMin: any = document.querySelector(".inpPriceMin")
    const inpMessageType: any = document.querySelector(".inpMessageType")

    btnSave.disabled = true
    btnReset.disabled = true
    btnSave.innerHTML = '<span class="loader2"></span> Thêm mới'

    formData.set("sendEmailType", sendEmailType.value)

    if (inpExpiration.value == '') {
      formData.set("expiration", '2000-01-01')
    } else {
      formData.set("expiration", inpExpiration.value)
    }

    if (inpDiscount.getAttribute("flag") == "false") { // giảm theo %
      formData.set("discount", inpDiscount.value)
      formData.set("discountType", "false")
    } else {
      formData.set("discount", inpDiscount.value) // giảm theo giá
      formData.set("discountType", "true")
    }

    formData.set("priceMin", inpPriceMin.value)

    if (inpFreeShip.checked) {
      formData.set("freeShip", "true")
    } else {
      formData.set("freeShip", "false")
    }

    if (sendEmailType.value == 'false') {
      if (inpMessageType.checked) {
        formData.set("messageType", "email")
      } else {
        formData.set("messageType", "local")
      }
    } else {
      formData.set("messageType", "local")
    }

    if (sendEmailType.value == "true") {
      this.adminVouchersService.add(formData).subscribe((response: any) => {
        if (response.status == '200') {
          const timeout = response.time
          setTimeout(() => {
            Swal.fire("", "Thêm mã giảm giá thành công.", "success")
            this.resetForm()
            btnSave.disabled = false
            btnReset.disabled = false
            btnSave.innerHTML = 'Thêm mới'
          }, timeout);
        } else {
          this.message = response
          btnSave.disabled = false
          btnReset.disabled = false
          btnSave.innerHTML = 'Thêm mới'
        }
      })
    } else {
      const emailAdded = document.querySelectorAll(".emailAdded")
      if (emailAdded.length != 0) {
        for (let i = 0; i < emailAdded.length; i++) {
          const userId: any = emailAdded[i].getAttribute("id")
          formData.set("user", userId)

          this.adminVouchersService.add(formData).subscribe((response: any) => {
            if (response.status == '200') {
              if (i == length) {
                Swal.fire("", "Thêm mã giảm giá thành công.", "success")
                this.resetForm()
              }
            } else if (response.status == '401') {
              this.message = response
            }
            btnSave.disabled = false
            btnReset.disabled = false
            btnSave.innerHTML = 'Thêm mới'
          })
        }
      } else {
        this.adminVouchersService.add(formData).subscribe((response: any) => {
          if (response.status == '401') {
            this.message = response
          }
          btnSave.disabled = false
          btnReset.disabled = false
          btnSave.innerHTML = 'Thêm mới'
        })
      }
    }
  }

  private resetForm() {
    const inpForm: any = document.querySelectorAll(".inpForm")
    const ctnAddFormEmail: any = document.querySelector(".ctnAddFormEmail")
    const ctnAddEmail: any = document.querySelector(".ctnAddEmail")
    const sendEmailType: any = document.querySelector(".sendEmailType")
    const inpDate: any = document.querySelector(".inpDate")
    const inpDiscount: any = document.querySelector(".inpDiscount")
    const toPercent: any = document.querySelector(".toPercent")
    const toPrice: any = document.querySelector(".toPrice")
    const inpFreeShip: any = document.querySelector(".inpFreeShip")
    const showPriceMin: any = document.querySelector(".showPriceMin")
    const inpMessageType: any = document.querySelector(".inpMessageType")

    inpForm.forEach((e: any) => {
      e.value = ''
    })

    inpDate.value = ''
    sendEmailType.selectedIndex = 0
    ctnAddFormEmail.style.display = 'flex'
    ctnAddEmail.innerHTML = ''

    toPercent.classList.replace("btn-outline-secondary", "btn-secondary")
    toPrice.classList.replace("btn-secondary", "btn-outline-secondary")
    inpDiscount.setAttribute("flag", "false")
    inpDiscount.setAttribute("placeholder", "Nhập phần trăm giảm giá")

    inpFreeShip.checked = false
    showPriceMin.innerHTML = ''
    inpMessageType.checked = false
    inpMessageType.disabled = false

    this.message = {}
  }

  private handleSendEmailType() {
    const sendEmailType: any = document.querySelector(".sendEmailType")
    const ctnAddFormEmail: any = document.querySelector(".ctnAddFormEmail")
    const ctnAddEmail: any = document.querySelector(".ctnAddEmail")
    const inpMessageType: any = document.querySelector(".inpMessageType")

    sendEmailType.addEventListener("change", () => {
      if (sendEmailType.value == 'true') {
        ctnAddFormEmail.style.display = "none"
        ctnAddEmail.innerHTML = ""
        this.message.email = ""
        inpMessageType.checked = false
        inpMessageType.disabled = true
      } else {
        ctnAddFormEmail.style.display = "flex"
        inpMessageType.disabled = false
      }
    })
  }

  private handleDiscountTo() {
    const toPercent: any = document.querySelector(".toPercent")
    const toPrice: any = document.querySelector(".toPrice")
    const inpDiscount: any = document.querySelector(".inpDiscount")

    toPercent.addEventListener("click", () => {
      toPercent.classList.replace("btn-outline-secondary", "btn-secondary")
      toPrice.classList.replace("btn-secondary", "btn-outline-secondary")
      inpDiscount.setAttribute("flag", "false")
      inpDiscount.setAttribute("placeholder", "Nhập phần trăm giảm giá")
    })

    toPrice.addEventListener("click", () => {
      toPrice.classList.replace("btn-outline-secondary", "btn-secondary")
      toPercent.classList.replace("btn-secondary", "btn-outline-secondary")
      inpDiscount.setAttribute("flag", "true")
      inpDiscount.setAttribute("placeholder", "Nhập giá giảm")
    })
  }

  private addEmailForVoucher() {
    const addEmail: any = document.querySelector(".addEmail")
    const inpEmail: any = document.querySelector(".inpEmail")
    const ctnAddEmail: any = document.querySelector(".ctnAddEmail")
    const searchResultEmail: any = document.querySelector(".search-resultEmail")

    const addFormEmail = () => {
      if (inpEmail.value != '') {
        this.adminUsersService.findByEmail(inpEmail.value).subscribe((response: any) => {
          if (response.status == '200') {
            const emailAdded = document.querySelectorAll(".emailAdded")
            var checkEmail = true

            if (emailAdded) {
              emailAdded.forEach((e: any) => {
                if (String(e.innerHTML) == inpEmail.value) {
                  this.message.email = "Email này đã được thêm vào."
                  checkEmail = false
                }
              })
            }

            if (checkEmail == true) {
              ctnAddEmail.innerHTML += `
              <label style="position: relative; margin: 10px 5px 0 0; padding: 0 5px 5px 5px; border-radius: 5px; background-color: gainsboro; border: solid 1px lightgray; user-select: none">
                <div style="width: 95%; text-align: right; padding-bottom: 5px;"><i class="fa-solid fa-xmark removeEmailAdded" style="font-size: 14px; cursor: pointer; position: absolute;"></i></div>
                <span id="${response.user.id}" class="emailAdded">${response.user.email}</span>
              </label>
              `
              inpEmail.value = ''
              this.message.email = ""
            }

            // Xóa các email đã thêm vào
            const removeEmailAdded = document.querySelectorAll(".removeEmailAdded")
            removeEmailAdded.forEach((e: any) => {
              const cloneElement: any = this.cloneElement(e)
              cloneElement.addEventListener("click", () => {
                cloneElement.parentNode.parentNode?.remove()
              })
            })
          } else {
            this.message.email = "Không tìm thấy địa chỉ email này."
          }
        })
      } else {
        this.message.email = 'Vui lòng nhập địa chỉ email'
      }
    }

    // Nút thêm email
    addEmail.addEventListener("click", () => {
      selectedIndex = -1
      addFormEmail()
    })

    // Bấm enter để thêm vào ctnEmail
    inpEmail.addEventListener("keydown", (event: any) => {
      if (event.key == 'Enter') {
        selectedIndex = -1
        searchResultEmail.classList.remove("show")
        addFormEmail()
      }
    })

    // Chọn 1 kết quả đã tìm kiếm
    var selectedIndex = -1
    inpEmail.addEventListener("keydown", (event: any) => {
      if (inpEmail.value != '') {
        const showEmail: any = document.querySelectorAll(".showEmail")
        if (showEmail && event.key == "ArrowDown") {
          selectedIndex++;
          if (selectedIndex >= showEmail.length) {
            selectedIndex = 0
          }

          showEmail[selectedIndex].style.backgroundColor = "gainsboro"
          showEmail.forEach((e: any, i: number) => {
            if (selectedIndex != i) {
              e.style.backgroundColor = "white"
            }
          })
        }

        if (showEmail && event.key == "ArrowUp") {
          selectedIndex--;
          if (selectedIndex <= -1) {
            selectedIndex = showEmail.length - 1
          }

          showEmail[selectedIndex].style.backgroundColor = "gainsboro"
          showEmail.forEach((e: any, i: number) => {
            if (selectedIndex != i) {
              e.style.backgroundColor = "white"
            }
          })
        }

        if (showEmail[selectedIndex]) {
          inpEmail.value = showEmail[selectedIndex].innerHTML
        }
      }
    })

    const searchFormEmail = () => {
      if (inpEmail.value != '') {
        searchResultEmail.classList.add("show")

        this.adminUsersService.findAllByEmail(inpEmail.value).subscribe((response: any) => {
          searchResultEmail.innerHTML = ''
          for (let i = 0; i < response.users.length; i++) {
            searchResultEmail.innerHTML += `
              <li class="showEmail" style="padding: 3px 10px; border-bottom: solid 1px lightgray; cursor: pointer;">${response.users[i].email}</li>
            `
          }

          const showEmail = document.querySelectorAll(".showEmail")
          showEmail.forEach((e: any) => {
            const cloneElement: any = this.cloneElement(e)
            cloneElement.addEventListener("mouseover", () => {
              cloneElement.style.backgroundColor = "gainsboro"
            })

            cloneElement.addEventListener("mouseout", () => {
              cloneElement.style.backgroundColor = "white"
            })

            cloneElement.addEventListener("click", () => {
              inpEmail.focus()
              inpEmail.value = cloneElement.innerHTML
              searchResultEmail.classList.remove("show")
            })
          })
        })
      } else {
        searchResultEmail.classList.remove("show")
      }
    }

    // tìm kiếm kết quả email
    inpEmail.addEventListener("input", () => {
      searchFormEmail()
      selectedIndex = -1
    })

    // Thoát khỏi ô tìm kiếm sẽ tắt bảng kết quả tìm kiếm
    inpEmail.addEventListener("blur", () => {
      setTimeout(() => {
        searchResultEmail.classList.remove("show")
        selectedIndex = -1
      }, 200);
    })

    // Ấn vào ô tìm kiếm sẽ hiển bảng kết quả tìm kiếm
    inpEmail.addEventListener("focus", () => {
      searchResultEmail.classList.add("show")
      searchFormEmail()
      selectedIndex = -1
    })
  }

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }

  private checkInput() {
    const inpForm = document.querySelectorAll(".inpForm")
    const inpDate = document.querySelectorAll(".inpDate")
    const inpPriceMin: any = document.querySelector(".inpPriceMin")
    const showPriceMin: any = document.querySelector(".showPriceMin")

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

    inpDate.forEach((event: any) => {
      event.addEventListener("change", () => {
        const name = event.getAttribute("name")
        for (const key in this.message) {
          if (key == name) {
            this.message[key] = ''
          }
        }
      })
    })

    inpPriceMin.addEventListener("input", () => {
      if (inpPriceMin.value != '') {
        showPriceMin.innerHTML = Number(inpPriceMin.value).toLocaleString("vi-VN") + ' đ'
      } else {
        showPriceMin.innerHTML = ''
      }
    })
  }
}
