import { ShipService } from './../services/ship/ship.service';
import { NgForm } from '@angular/forms';
import { FavoriteService } from './../services/favorite/favorite.service';
import { AddressService } from './../services/address/address.service';
import { AccountService } from './../services/account/account.service';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { ProductService } from './../services/product/product.service';
import { PaymentService } from './../services/payment/payment.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  orderForm: any = {}
  carts: any[] = []
  paymentTotal: number = 0
  address: any = {}
  message: any = {}

  constructor(private paymentService: PaymentService, private shipService: ShipService, private productService: ProductService, private favoriteService: FavoriteService, private userAuthService: UserAuthService, private addressService: AddressService, private accountService: AccountService) { }

  ngOnInit(): void {
    this.getOrderForm()

    this.getAddress()

    this.findAllCart()

    // menu hover
    setTimeout(() => {
      this.checkInput()

      const menuHover = document.querySelectorAll(".menu-hover")
      const menuBar = document.querySelectorAll(".menu-bar")
      const dropdownMenuHover = document.querySelectorAll(".dropdown-menu-hover")
      for (let i = 0; i < menuHover.length; i++) {
        this.hoverMenu(menuHover[i], menuBar[i], dropdownMenuHover[i])
      }
    }, 300);
  }

  private findAllCart() {
    const loadingData: any = document.querySelector(".loading-data")
    const containerOrder: any = document.querySelector("#containerOrder")
    const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
    containerOrder.style.display = "none"

    if (arrCart.length == 0) {
      location.href = "/cart"
    } else {
      arrCart.forEach((e: any, i: number) => {
        const id = e.id
        const orderForm = JSON.parse(localStorage.getItem("orderForm") + "") || {}
        this.orderForm = orderForm

        this.productService.findDetailById(id).subscribe((responseD: any) => {
          if (responseD.status == '200') {
            this.productService.findById(responseD.productDetail.product.id).subscribe((response: any) => {
              response.product.productDetail = responseD.productDetail
              response.product.quantity = e.quantity
              var total = 0
              if (response.product.productDetail.discount > 0) {
                total = (response.product.productDetail.price * (100 - response.product.productDetail.discount) / 100) * e.quantity
              } else {
                total = response.product.productDetail.price * e.quantity
              }
              response.product.total = total
              this.carts.push(response.product)
              this.loadingImage()

              if (i == arrCart.length - 1) {
                setTimeout(() => {
                  loadingData.style.display = "none"
                  containerOrder.style.display = "block"
                  this.provisionalCart()
                  this.saveValueInput()
                  this.checkProductCart()
                  this.handlePayment()
                }, 500);
              }
            })
          }
        })
      })
    }
  }

  private handlePayment() {
    const btnPayment: any = document.querySelector(".btnPayment")
    const inpPayments: any = document.querySelectorAll(".inpPayment")
    const cloneBtnPayment: any = this.cloneElement(btnPayment)

    // Chọn hình thức thanh toán
    inpPayments.forEach((e: any) => {
      e.addEventListener("change", () => {

        if (e.value == 'COD') {
          cloneBtnPayment.innerHTML = `Hoàn tất thanh toán`
        } else {
          cloneBtnPayment.innerHTML = `Thanh toán ngay`
        }
      })
    })

    // Thanh toán
    cloneBtnPayment.addEventListener("click", () => {
      var textBtn = cloneBtnPayment.innerHTML
      const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
      const arrError: any[] = []
      cloneBtnPayment.disabled = true
      cloneBtnPayment.innerHTML = `<span class="loader2"></span> ${textBtn}`
      var check = true

      if (arrCart.length == 0) {
        location.href = "/cart"
      } else {
        arrCart.forEach((e: any, i: number) => {
          const id = e.id
          this.productService.findDetailById(id).subscribe((responsePD: any) => {
            var qtity = Number(e.quantity)
            if (responsePD.status == '200') {
              const checkQtityAndActive = this.checkQtityAndActiveProduct(responsePD)
              if (!checkQtityAndActive) {
                arrError.push(`* ${responsePD.productDetail.product.name} ${(responsePD.productDetail.product.name != responsePD.productDetail.size) ? 'loại ' + responsePD.productDetail.size : ''} hiện vừa hết hàng<br>`)
                check = false
              }

              if (checkQtityAndActive) {
                if (qtity > responsePD.productDetail.quantity) {
                  arrError.push(`* Số lượng ${responsePD.productDetail.product.name} ${(responsePD.productDetail.product.name != responsePD.productDetail.size) ? 'loại ' + responsePD.productDetail.size : ''} hiện chỉ còn ${responsePD.productDetail.quantity}<br>`)
                  check = false
                }

                if (qtity == 0) {
                  arrError.push(`* Số lượng ${responsePD.productDetail.product.name} ${(responsePD.productDetail.product.name != responsePD.productDetail.size) ? 'loại ' + responsePD.productDetail.size : ''} hiện đang là 0<br>`)
                  check = false
                }
              }

              if (i == arrCart.length - 1) {
                const timeout = (arrCart.length * 10) + 1000
                setTimeout(() => {
                  // Kiểm tra thành công thì thực hiện thanh toán
                  if (check) {
                    this.payment()
                  } else {
                    if (arrError.length != 0) {
                      var errors = ""
                      for (const error of arrError) {
                        errors += error
                      }
                      Swal.fire({
                        html: `<span style="font-size: medium;">${errors}</span>`,
                        icon: 'error',
                        showDenyButton: true,
                        confirmButtonText: "Quay lại giỏ hàng",
                        denyButtonText: `Hủy bỏ`
                      }).then((result) => {
                        if (result.isConfirmed) {
                          location.href = "/cart"
                        }
                      })
                    }
                  }

                  cloneBtnPayment.disabled = false
                  cloneBtnPayment.innerHTML = textBtn
                }, timeout);
              }
            }
          })
        })
      }
    })
  }

  private payment() {

  }

  private checkProductCart() {
    const arrError: any[] = []
    const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []

    if (arrCart.length == 0) {
      location.href = "/cart"
    } else {
      arrCart.forEach((e: any, i: number) => {
        const id = e.id
        this.productService.findDetailById(id).subscribe((responsePD: any) => {
          var qtity = Number(e.quantity)

          if (responsePD.status == '200') {
            const checkQtityAndActive = this.checkQtityAndActiveProduct(responsePD)
            if (!checkQtityAndActive) {
              arrError.push(`* ${responsePD.productDetail.product.name} ${(responsePD.productDetail.product.name != responsePD.productDetail.size) ? 'loại ' + responsePD.productDetail.size : ''} hiện vừa hết hàng<br>`)
            }

            if (checkQtityAndActive) {
              if (qtity > responsePD.productDetail.quantity) {
                arrError.push(`* Số lượng ${responsePD.productDetail.product.name} ${(responsePD.productDetail.product.name != responsePD.productDetail.size) ? 'loại ' + responsePD.productDetail.size : ''} hiện chỉ còn ${responsePD.productDetail.quantity}<br>`)
              }

              if (qtity == 0) {
                arrError.push(`* Số lượng ${responsePD.productDetail.product.name} ${(responsePD.productDetail.product.name != responsePD.productDetail.size) ? 'loại ' + responsePD.productDetail.size : ''} hiện đang là 0<br>`)
              }
            }
          }

          if (i == this.carts.length - 1) {
            const timeout = (arrCart.length * 10) + 1000
            setTimeout(() => {
              if (arrError.length != 0) {
                var errors = ""
                for (const error of arrError) {
                  errors += error
                }
                Swal.fire({
                  html: `<span style="font-size: medium;">${errors}</span>`,
                  icon: 'error',
                  showDenyButton: true,
                  confirmButtonText: "Quay lại giỏ hàng",
                  denyButtonText: `Hủy bỏ`
                }).then((result) => {
                  if (result.isConfirmed) {
                    location.href = "/cart"
                  }
                })
              }
            }, timeout);
          }
        })
      })
    }
  }

  private getOrderForm() {
    const orderForm = JSON.parse(localStorage.getItem("orderForm") + "") || {}
    this.orderForm = orderForm

    if (this.authenticated()) {
      const credentials = this.userAuthService.getCredentials();
      this.accountService.findByEmail(credentials.sub).subscribe((response: any) => {
        if (response.status == '200') {
          this.orderForm = response.user
          if (this.orderForm.address != null) {
            this.orderForm.address = this.orderForm.address.split('||')
          }
        } else {
          console.error("Không tìm thấy email này.")
        }
      })
    }
  }

  private saveValueInput() {
    const orderForm = JSON.parse(localStorage.getItem("orderForm") + "") || {}

  }

  private checkQtityAndActiveProduct(responsePD: any) {
    var check = true

    if (responsePD.productDetail.quantity == 0 || responsePD.productDetail.active == false
      || responsePD.productDetail.product.active == false || responsePD.productDetail.product.categoryDetail.active == false
      || responsePD.productDetail.product.categoryDetail.category.active == false) {

      check = false
    }

    return check;
  }

  private provisionalCart() {
    var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
    this.paymentTotal = 0

    arrCart.forEach((e: any) => {
      const id = e.id
      this.productService.findDetailById(id).subscribe((responseD: any) => {
        if (responseD.status == '200') {
          this.paymentTotal += Number(e.quantity * (responseD.productDetail.price * (100 - responseD.productDetail.discount) / 100))
        }
      })
    })
  }

  private getAddress() {
    const ctnMessageShip: any = document.querySelector(".ctnMessageShip")
    ctnMessageShip.innerHTML = `<span class="loader3"></span>`

    this.addressService.findAllByProvinces().subscribe((response: any) => {
      this.address.provinces = response.data.data

      this.handleAddress()

      setTimeout(() => {
        const inpAddress: any = document.querySelector(".inpAddress")
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
            if (item.name_with_type == this.orderForm.address[2].trim()) {
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
              if (item.name_with_type == this.orderForm.address[1].trim()) {
                inpWards.innerHTML += `<option value="${item.name_with_type}" selected code="${item.code}">${item.name_with_type}</option>`
              } else {
                inpWards.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
              }
            }

            ctnMessageShip.innerHTML = `
            <i class="fa-solid fa-truck" style="font-size: 50px; margin-bottom: 10px;"></i>
            <div class="message-ship"></div>
            `
            const messageShip: any = document.querySelector(".message-ship")
            var checkShip = true

            if (inpProvinces.value == '') {
              messageShip.innerHTML = `Vui lòng chọn tỉnh / thành để xem hình thức vận chuyển.`
              checkShip = false
            } else {
              if (inpDistricts.value == '') {
                messageShip.innerHTML = `Vui lòng chọn quận / huyện để xem hình thức vận chuyển.`
                checkShip = false
              } else {
                if (inpWards.value == '') {
                  messageShip.innerHTML = `Vui lòng chọn phường / xã để xem hình thức vận chuyển.`
                  checkShip = false
                }
              }
            }

            var weight = 0
            var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
            arrCart.forEach((e: any) => {
              weight += e.quantity
            })
            weight = (Math.floor(weight / 2)) * 1000 // đơn vị là gram

            if (checkShip) {
              ctnMessageShip.innerHTML = `<span class="loader3"></span>`
              if (this.paymentTotal >= 890000) {
                ctnMessageShip.innerHTML = `Miễn phí vận chuyển`
              } else {
                this.shipService.shipFee(inpAddress.value.trim(), inpProvinces.value, inpDistricts.value, inpWards.value, weight, this.paymentTotal).subscribe((response: any) => {
                  if(response.status == '200') {
                    ctnMessageShip.innerHTML = `Phí vận chuyển của bạn là ${Number(response.fee.ship_fee_only).toLocaleString("vi-VN")} đ`
                  }
                })
              }
            }
          })
        })
      }, 500);
    })
  }

  public handleAddress() {
    const inpAddress: any = document.querySelector(".inpAddress")
    const inpProvinces: any = document.querySelector(".inpProvinces")
    const inpDistricts: any = document.querySelector(".inpDistricts")
    const inpWards: any = document.querySelector(".inpWards")
    const ctnMessageShip: any = document.querySelector(".ctnMessageShip")

    inpProvinces.addEventListener("change", () => {
      const btnPayment: any = document.querySelector(".btnPayment")
      var option = inpProvinces.options[inpProvinces.selectedIndex];
      const code = option.getAttribute("code")
      btnPayment.disabled = true

      this.addressService.findAllByDistricts(code).subscribe((response: any) => {
        inpDistricts.innerHTML = `<option value="">Chọn Quận / Huyện</option>`
        inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
        for (const item of response) {
          inpDistricts.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
        }

        ctnMessageShip.innerHTML = `
        <i class="fa-solid fa-truck" style="font-size: 50px; margin-bottom: 10px;"></i>
        <div class="message-ship"></div>
        `
        const messageShip: any = document.querySelector(".message-ship")
        if (inpProvinces.value == '') {
          messageShip.innerHTML = `Vui lòng chọn tỉnh / thành để xem hình thức vận chuyển.`
        } else {
          if (inpDistricts.value == '') {
            messageShip.innerHTML = `Vui lòng chọn quận / huyện để xem hình thức vận chuyển.`
          } else {
            if (inpWards.value == '') {
              messageShip.innerHTML = `Vui lòng chọn phường / xã để xem hình thức vận chuyển.`
            }
          }
        }

        if (this.orderForm.address != null) {
          this.orderForm.address[3] = inpProvinces.value
        }
        btnPayment.disabled = false
      })
    })

    inpDistricts.addEventListener("change", () => {
      const btnPayment: any = document.querySelector(".btnPayment")
      var option = inpDistricts.options[inpDistricts.selectedIndex];
      const code = option.getAttribute("code")
      btnPayment.disabled = true

      this.addressService.findAllByWards(code).subscribe((response: any) => {
        inpWards.innerHTML = `<option value="">Chọn Phường / Xã</option>`
        for (const item of response) {
          inpWards.innerHTML += `<option value="${item.name_with_type}" code="${item.code}">${item.name_with_type}</option>`
        }

        ctnMessageShip.innerHTML = `
        <i class="fa-solid fa-truck" style="font-size: 50px; margin-bottom: 10px;"></i>
        <div class="message-ship"></div>
        `
        const messageShip: any = document.querySelector(".message-ship")
        if (inpProvinces.value == '') {
          messageShip.innerHTML = `Vui lòng chọn tỉnh / thành để xem hình thức vận chuyển.`
        } else {
          if (inpDistricts.value == '') {
            messageShip.innerHTML = `Vui lòng chọn quận / huyện để xem hình thức vận chuyển.`
          } else {
            if (inpWards.value == '') {
              messageShip.innerHTML = `Vui lòng chọn phường / xã để xem hình thức vận chuyển.`
            }
          }
        }

        btnPayment.disabled = false
      })
    })

    inpWards.addEventListener("change", () => {
      const btnPayment: any = document.querySelector(".btnPayment")
      var checkShip = true
      ctnMessageShip.innerHTML = `
      <i class="fa-solid fa-truck" style="font-size: 50px; margin-bottom: 10px;"></i>
      <div class="message-ship"></div>
      `
      const messageShip: any = document.querySelector(".message-ship")
      if (inpWards.value == '') {
        messageShip.innerHTML = `Vui lòng chọn phường / xã để xem hình thức vận chuyển.`
        checkShip = false
      }

      if (checkShip) {
        ctnMessageShip.innerHTML = `<span class="loader3"></span>`
        btnPayment.disabled = true

        var weight = 0
        var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
        arrCart.forEach((e: any) => {
          weight += e.quantity
        })
        weight = (Math.floor(weight / 2)) * 1000 // đơn vị là gram

        if (this.paymentTotal >= 890000) {
          ctnMessageShip.innerHTML = `Miễn phí vận chuyển`
        } else {
          this.shipService.shipFee(inpAddress.value.trim(), inpProvinces.value, inpDistricts.value, inpWards.value, weight, this.paymentTotal).subscribe((response: any) => {
            if(response.status == '200') {
              ctnMessageShip.innerHTML = `Phí vận chuyển của bạn là ${Number(response.fee.ship_fee_only).toLocaleString("vi-VN")} đ`
            }
            btnPayment.disabled = false
          })
        }
      }
    })
  }

  public authenticated() {
    return this.userAuthService.authenticated()
  }

  public authorize(role: string) {
    const credentials = this.userAuthService.getCredentials()
    if (this.authenticated()) {
      const isRole = credentials.role.substring(5)
      if (isRole == role) {
        return true
      }
    }
    return false
  }

  public login(loginForm: NgForm) {
    const btnLoginToMenu: any = document.querySelector(".btnLoginToMenu")
    btnLoginToMenu.disabled = true
    btnLoginToMenu.innerHTML = `<span class="loader2" style="5px dotted white"></span> Đăng nhập`

    this.userAuthService.login(loginForm.value).subscribe((response: any) => {
      this.userAuthService.setToken(response.token)
      this.userAuthService.setRefreshToken(response.refreshToken)

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
                location.href = "/payment"
              }, timeout);
            }
          })
        })
      }
    }, (error: any) => {
      if (error.status == 403) {
        this.message.error = 'Tài khoản hoặc mật khẩu không chính xác'
      }
      btnLoginToMenu.disabled = false
      btnLoginToMenu.innerHTML = `Đăng nhập`
    })
  }

  public logout() {
    this.userAuthService.logout()
    location.href = "payment"
  }

  private loadingImage() {
    setTimeout(() => {
      const images = document.querySelectorAll(".image")
      images.forEach((image: any) => {
        const img = image.querySelector("img")

        if (img.complete) {
          image.style.backgroundImage = 'none';
          img.style.opacity = '1'
        } else {
          img.addEventListener("load", () => {
            image.style.backgroundImage = 'none';
            img.style.opacity = '1'
          })
        }
      })
    }, 300)
  }

  private hoverMenu(menu: any, barMenu: any, dropdown: any) {
    menu?.addEventListener("mouseover", () => {
      if (!dropdown?.classList.contains("show")) {
        dropdown?.classList.add("show")
      }
    })

    barMenu?.addEventListener("mouseover", () => {
      if (!dropdown?.classList.contains("show")) {
        dropdown?.classList.add("show")
      }
    })

    dropdown?.addEventListener("mouseover", () => {
      if (!dropdown?.classList.contains("show")) {
        dropdown?.classList.add("show")
      }
    })

    menu?.addEventListener("mouseout", () => {
      if (dropdown?.classList.contains("show")) {
        dropdown?.classList.remove("show")
      }
    })

    dropdown?.addEventListener("mouseout", () => {
      if (dropdown?.classList.contains("show")) {
        dropdown?.classList.remove("show")
      }
    })
  }

  private checkInput() {
    const inpFormLogin = document.querySelectorAll(".inpFormLogin")

    inpFormLogin.forEach((e: any) => {
      e.addEventListener("input", () => {
        this.message.error = ''
      })
    })
  }

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }
}
