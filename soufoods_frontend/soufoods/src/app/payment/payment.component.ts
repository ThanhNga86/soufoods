import { VoucherService } from './../services/voucher/voucher.service';
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
import { FacebookLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  orderForm: any = {}
  carts: any[] = []
  paymentTotal: number = 0
  provisional: number = 0
  address: any = {}
  message: any = {}

  constructor(private paymentService: PaymentService, private socialAuthService: SocialAuthService, private voucherService: VoucherService, private shipService: ShipService, private productService: ProductService, private favoriteService: FavoriteService, private userAuthService: UserAuthService, private addressService: AddressService, private accountService: AccountService) { }

  ngOnInit(): void {
    this.provisionalCart()

    this.getOrderForm()

    this.findAllCart()

    this.loginWithOAuth2()

    setTimeout(() => {
      // menu hover
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
                  this.saveValueInput()
                  this.checkProductCart()
                  this.checkInput()
                  this.handleVoucher()
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

    // Chọn hình thức thanh toán
    inpPayments.forEach((e: any) => {
      if (e.checked) {
        if (e.value == 'COD') {
          btnPayment.innerHTML = `Hoàn tất thanh toán`
        } else {
          btnPayment.innerHTML = `Thanh toán ngay`
        }
      }

      e.addEventListener("change", () => {
        if (e.value == 'COD') {
          btnPayment.innerHTML = `Hoàn tất thanh toán`
        } else {
          btnPayment.innerHTML = `Thanh toán ngay`
        }
      })
    })

    // Thanh toán
    btnPayment.addEventListener("click", () => {
      var textBtn = btnPayment.innerHTML
      const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
      const orderForm: any = JSON.parse(localStorage.getItem("orderForm") + "") || {}
      const arrError: any[] = []
      btnPayment.disabled = true
      btnPayment.innerHTML = `<span class="loader2"></span> ${textBtn}`
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
                const inpForm: any = document.querySelectorAll(".inpForm")
                const inpEmail: any = document.querySelector(".inpEmail")
                const checkEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                inpForm.forEach((event: any) => {
                  if (event.value == '') {
                    event.style.boxShadow = "0 0 0 2px lightcoral"
                    check = false
                  }
                })

                if (!checkEmail.test(inpEmail.value)) {
                  inpEmail.style.boxShadow = "0 0 0 2px lightcoral"
                  this.message.email = "Vui lòng nhập đúng định dạng email.<br>Ví dụ: soufoods@gmail.com"
                  check = false
                }

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

                if (this.orderForm.voucher) {
                  const expiration = new Date(this.orderForm.voucher.expiration)
                  if (expiration <= new Date()) {
                    this.message.voucher = "Mã giảm giá đã hết hạn! Vui lòng xóa mã giảm giá này"
                    const orderForm: any = JSON.parse(localStorage.getItem("orderForm") + "") || {}
                    this.orderForm.voucher = null
                    orderForm.voucher = null
                    localStorage.setItem("orderForm", JSON.stringify(orderForm))
                    check = false;
                  }
                }

                const timeout = (arrCart.length * 10) + 1000
                setTimeout(() => {
                  // Kiểm tra thành công thì thực hiện thanh toán
                  if (check) {
                    if (this.authenticated()) {
                      // thanh toán đơn hàng
                      const formData = new FormData()
                      const inpLastName: any = document.querySelector(".inpLastName")
                      const inpFirstName: any = document.querySelector(".inpFirstName")
                      const inpEmail: any = document.querySelector(".inpEmail")
                      const inpPhone: any = document.querySelector(".inpPhone")
                      const inpAddress: any = document.querySelector(".inpAddress")
                      const inpProvinces: any = document.querySelector(".inpProvinces")
                      const inpDistricts: any = document.querySelector(".inpDistricts")
                      const inpWards: any = document.querySelector(".inpWards")
                      const address: any = `${inpAddress.value.trim()}|| ${inpWards.value.trim()}|| ${inpDistricts.value.trim()}|| ${inpProvinces.value.trim()}`
                      const inpPayment: any = document.querySelector(".inpPayment")

                      formData.append("token", this.userAuthService.getToken())
                      formData.append("lastName", inpLastName.value.trim())
                      formData.append("firstName", inpFirstName.value.trim())
                      formData.append("email", inpEmail.value.trim())
                      formData.append("phone", inpPhone.value.trim())
                      formData.append("address", address.trim())
                      formData.append("shipFee", this.orderForm.shipFee)
                      formData.append("payment", inpPayment.value.trim())

                      if (this.orderForm.voucher) { formData.append("voucher", this.orderForm.voucher.id) }
                      for (let cart of arrCart) {
                        formData.append("productDetailId", cart.id)
                        formData.append("quantity", cart.quantity)
                      }
                      formData.append("note", orderForm.note)

                      this.paymentService.payment(formData).subscribe((response: any) => {
                        if (response.status == "200") {
                          localStorage.removeItem("carts")
                          localStorage.removeItem("orderForm")
                          Swal.fire({
                            title: "Đặt hàng thành công",
                            html: `Cám ơn bạn đã đặt hàng! Thông tin đơn đặt hàng sẽ được gửi qua email của quý khách`,
                            icon: "success",
                            showDenyButton: true,
                            confirmButtonText: "Tiếp tục mua hàng",
                            denyButtonText: `Trang chủ`
                          }).then((result) => {
                            if (result.isConfirmed) {
                              location.href = "collections/category?id=0&name=Tất%20cả%20sản%20phẩm"
                            } else if (result.isDenied) {
                              location.href = ""
                            }
                          })
                        } else {
                          Swal.fire("", response.error, "error")
                        }
                      })
                    } else {
                      const btnPayment: any = document.querySelector(".btnPayment")
                      Swal.fire({
                        html: `<span style="font-size: medium;">Vui lòng đăng nhập để có thể ${btnPayment.innerText.toLowerCase()} !</span>`,
                        showDenyButton: true,
                        confirmButtonText: "Đăng nhập",
                        denyButtonText: `Hủy bỏ`
                      }).then((result) => {
                        if (result.isConfirmed) {
                          const actionUser: any = document.querySelector(".action-user")
                          actionUser.click()
                        }
                      })
                    }
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
                    } else {
                      Swal.fire("", "Vui lòng kiểm tra và nhập đầy đủ thông tin đơn hàng.", "error")
                    }
                  }

                  btnPayment.disabled = false
                  btnPayment.innerHTML = textBtn
                }, timeout);
              }
            }
          })
        })
      }
    })
  }

  private fcPaymentTotal() {
    const orderForm: any = JSON.parse(localStorage.getItem("orderForm") + "") || {}
    this.paymentTotal = 0

    this.paymentTotal = this.provisional

    if (orderForm.voucher != null) {
      this.paymentTotal -= (orderForm.voucher.discountType) ? this.provisional - (this.provisional - orderForm.voucher.discount)
        : this.provisional - (this.provisional * (100 - orderForm.voucher.discount) / 100)
    }

    if (orderForm.shipFee != null) {
      this.paymentTotal += orderForm.shipFee
    }
  }

  private handleVoucher() {
    const inpVoucher: any = document.querySelectorAll(".inpVoucher")
    const btnVoucher: any = document.querySelectorAll(".btnVoucher")
    const btnPayment: any = document.querySelector(".btnPayment")

    btnVoucher.forEach((e: any, i: number) => {
      e.addEventListener("click", () => {
        btnPayment.disabled = true
        btnVoucher.forEach((e: any) => {
          e.disabled = true
          e.innerHTML = `<span class="loader2"></span> Áp dụng`
        })

        const voucher = {
          token: this.userAuthService.getToken(),
          discountCode: inpVoucher[i].value.trim(),
          provisional: this.provisional + Number((this.orderForm.shipFee) ? this.orderForm.shipFee : 0)
        }
        this.appVoucher(voucher)
      })
    })
  }

  private appVoucher(voucher: any) {
    const btnVoucher: any = document.querySelectorAll(".btnVoucher")
    const btnPayment: any = document.querySelector(".btnPayment")
    const ctnMessageShip: any = document.querySelector(".ctnMessageShip")
    const orderForm: any = JSON.parse(localStorage.getItem("orderForm") + "") || {}

    this.voucherService.applyVoucher(voucher).subscribe((response: any) => {
      if (response.status == '200') {
        this.orderForm.voucher = response.voucher
        orderForm.voucher = response.voucher
        localStorage.setItem("orderForm", JSON.stringify(orderForm))

        if (orderForm.voucher != null) {
          this.orderForm.voucher = orderForm.voucher
          if (orderForm.voucher.freeShip == true) {
            this.orderForm.shipFee = 0
            ctnMessageShip.innerHTML = `Miễn phí vận chuyển`
            btnPayment.disabled = false
            btnVoucher.forEach((e: any) => {
              e.disabled = false
              e.innerHTML = `Áp dụng`
            })
          } else {
            this.getAddress()
          }
        }

        this.message.voucher = ''
        this.fcPaymentTotal()

        setTimeout(() => {
          // xóa mã giảm xóa
          const deleteVoucher: any = document.querySelectorAll(".deleteVoucher")
          deleteVoucher.forEach((e: any) => {
            const cloneElement = this.cloneElement(e)
            cloneElement.addEventListener("click", () => {
              this.orderForm.voucher = null
              orderForm.voucher = null
              localStorage.setItem("orderForm", JSON.stringify(orderForm))

              this.getAddress()
              this.fcPaymentTotal()
            })
          })
        }, 300);
      } else {
        this.message.voucher = response.error
        const orderForm: any = JSON.parse(localStorage.getItem("orderForm") + "") || {}
        this.orderForm.voucher = null
        orderForm.voucher = null
        localStorage.setItem("orderForm", JSON.stringify(orderForm))
        btnPayment.disabled = false
        btnVoucher.forEach((e: any) => {
          e.disabled = false
          e.innerHTML = `Áp dụng`
        })
      }
    })
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

    if (this.authenticated()) {
      const credentials = this.userAuthService.getCredentials();
      this.accountService.findByEmail(credentials.sub).subscribe((response: any) => {
        if (response.status == '200') {
          this.orderForm = response.user
          if (orderForm.note != null || orderForm.note != '') {
            this.orderForm.note = orderForm.note
          }

          if (this.orderForm.address != null) {
            this.orderForm.address = this.orderForm.address.split('||')
          }

          if (orderForm.payment != null) {
            this.orderForm.payment = orderForm.payment
          }

          if (orderForm.voucher != null) {
            this.orderForm.voucher = orderForm.voucher

            const voucher = {
              token: this.userAuthService.getToken(),
              discountCode: this.orderForm.voucher.discountCode,
              provisional: this.provisional + Number((this.orderForm.shipFee) ? this.orderForm.shipFee : 0)
            }
            this.appVoucher(voucher)
          }

          localStorage.setItem("orderForm", JSON.stringify(this.orderForm))
          this.getAddress()
          this.fcPaymentTotal()
        } else {
          console.error("Không tìm thấy email này.")
        }
      })
    } else {
      this.orderForm = orderForm
      this.orderForm.voucher = null
      orderForm.voucher = null
      localStorage.setItem("orderForm", JSON.stringify(orderForm))
      this.getAddress()
      this.fcPaymentTotal()
    }
  }

  private saveValueInput() {
    const inpForm: any = document.querySelectorAll(".inpForm")

    inpForm.forEach((e: any) => {
      e.addEventListener("change", () => {
        const orderForm: any = JSON.parse(localStorage.getItem("orderForm") + "") || {}
        if (!orderForm.address) { orderForm.address = [] }
        const name = e.getAttribute("name")

        if (name.includes('address')) {
          var index = name.replaceAll("address_", "")
          orderForm.address[index] = e.value || []
        } else {
          orderForm[name] = e.value
        }
        localStorage.setItem("orderForm", JSON.stringify(orderForm))
      })
    })
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
    this.provisional = 0

    arrCart.forEach((e: any, i: number) => {
      const id = e.id
      this.productService.findDetailById(id).subscribe((responseD: any) => {
        if (responseD.status == '200') {
          this.provisional += Number(e.quantity * (responseD.productDetail.price * (100 - responseD.productDetail.discount) / 100))
          if (i == arrCart.length - 1) {
            this.fcPaymentTotal()
          }
        }
      })
    })
  }

  private getAddress() {
    const ctnMessageShip: any = document.querySelector(".ctnMessageShip")
    ctnMessageShip.innerHTML = `<span class="loader3"></span>`
    const btnPayment: any = document.querySelector(".btnPayment")
    const btnVoucher: any = document.querySelectorAll(".btnVoucher")
    btnPayment.disabled = true
    btnVoucher.forEach((e: any) => {
      e.disabled = true
    })

    this.addressService.findAllByProvinces().subscribe((response: any) => {
      this.address.provinces = response.data.data

      setTimeout(() => {
        this.handleAddress()
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
              this.orderForm.shipFee = null
            } else {
              if (inpDistricts.value == '') {
                messageShip.innerHTML = `Vui lòng chọn quận / huyện để xem hình thức vận chuyển.`
                checkShip = false
                this.orderForm.shipFee = null
              } else {
                if (inpWards.value == '') {
                  messageShip.innerHTML = `Vui lòng chọn phường / xã để xem hình thức vận chuyển.`
                  checkShip = false
                  this.orderForm.shipFee = null
                }
              }
            }

            var weight = 0
            var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
            arrCart.forEach((e: any) => {
              weight += e.quantity
            })
            weight = (Math.floor(weight / 4)) * 1000 // đơn vị là gram

            if (checkShip) {
              const orderForm: any = JSON.parse(localStorage.getItem("orderForm") + "") || {}
              ctnMessageShip.innerHTML = `<span class="loader3"></span>`

              if (this.provisional >= 890000) {
                ctnMessageShip.innerHTML = `Miễn phí vận chuyển`
                this.orderForm.shipFee = 0
                orderForm.shipFee = 0
                localStorage.setItem("orderForm", JSON.stringify(orderForm))
                this.fcPaymentTotal()
                btnPayment.disabled = false
                btnVoucher.forEach((e: any) => {
                  e.disabled = false
                  e.innerHTML = `Áp dụng`
                })
              } else {
                this.paymentTotal = Math.floor(this.paymentTotal)
                this.shipService.shipFee(inpAddress.value.trim(), inpProvinces.value, inpDistricts.value, inpWards.value, weight, this.paymentTotal).subscribe((response: any) => {
                  if (response.status == '200') {
                    this.orderForm.shipFee = response.fee.ship_fee_only
                    orderForm.shipFee = response.fee.ship_fee_only

                    if (orderForm.voucher == null) {
                      ctnMessageShip.innerHTML = `Phí vận chuyển của bạn là ${Number(response.fee.ship_fee_only).toLocaleString("vi-VN")} đ`
                    } else {
                      this.orderForm.voucher = orderForm.voucher

                      if (orderForm.voucher.freeShip == true) {
                        this.orderForm.shipFee = 0
                        orderForm.shipFee = 0
                        ctnMessageShip.innerHTML = `Miễn phí vận chuyển`
                      } else {
                        ctnMessageShip.innerHTML = `Phí vận chuyển của bạn là ${Number(response.fee.ship_fee_only).toLocaleString("vi-VN")} đ`
                      }
                    }

                    localStorage.setItem("orderForm", JSON.stringify(orderForm))
                    this.fcPaymentTotal()
                  } else {
                    alert(response.error)
                    orderForm.shipFee = null
                    localStorage.setItem("orderForm", JSON.stringify(orderForm))
                  }
                  btnPayment.disabled = false
                  btnVoucher.forEach((e: any) => {
                    e.disabled = false
                    e.innerHTML = `Áp dụng`
                  })
                })
              }
            } else {
              btnPayment.disabled = false
              btnVoucher.forEach((e: any) => {
                e.disabled = false
                e.innerHTML = `Áp dụng`
              })
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
      var option = inpProvinces.options[inpProvinces.selectedIndex];
      const code = option.getAttribute("code")

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
          this.orderForm.shipFee = null
        } else {
          if (inpDistricts.value == '') {
            messageShip.innerHTML = `Vui lòng chọn quận / huyện để xem hình thức vận chuyển.`
            this.orderForm.shipFee = null
          } else {
            if (inpWards.value == '') {
              messageShip.innerHTML = `Vui lòng chọn phường / xã để xem hình thức vận chuyển.`
              this.orderForm.shipFee = null
            }
          }
        }

        if (this.orderForm.address != null) {
          this.orderForm.address[3] = inpProvinces.value
        }

        this.fcPaymentTotal()
      })
    })

    inpDistricts.addEventListener("change", () => {
      var option = inpDistricts.options[inpDistricts.selectedIndex];
      const code = option.getAttribute("code")

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
          this.orderForm.shipFee = null
        } else {
          if (inpDistricts.value == '') {
            messageShip.innerHTML = `Vui lòng chọn quận / huyện để xem hình thức vận chuyển.`
            this.orderForm.shipFee = null
          } else {
            if (inpWards.value == '') {
              messageShip.innerHTML = `Vui lòng chọn phường / xã để xem hình thức vận chuyển.`
              this.orderForm.shipFee = null
            }
          }
        }
        this.fcPaymentTotal()
      })
    })

    inpWards.addEventListener("change", () => {
      const btnPayment: any = document.querySelector(".btnPayment")
      const btnVoucher: any = document.querySelectorAll(".btnVoucher")

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
        const orderForm: any = JSON.parse(localStorage.getItem("orderForm") + "") || {}
        ctnMessageShip.innerHTML = `<span class="loader3"></span>`
        btnPayment.disabled = true
        btnVoucher.forEach((e: any) => {
          e.disabled = true
        })

        var weight = 0
        var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
        arrCart.forEach((e: any) => {
          weight += e.quantity
        })
        weight = (Math.floor(weight / 2)) * 1000 // đơn vị là gram

        if (this.provisional >= 890000) {
          ctnMessageShip.innerHTML = `Miễn phí vận chuyển`
          this.orderForm.shipFee = 0
          orderForm.shipFee = 0
          localStorage.setItem("orderForm", JSON.stringify(orderForm))
          btnPayment.disabled = false
          btnVoucher.forEach((e: any) => {
            e.disabled = false
            e.innerHTML = `Áp dụng`
          })
          this.fcPaymentTotal()
        } else {
          this.shipService.shipFee(inpAddress.value.trim(), inpProvinces.value, inpDistricts.value, inpWards.value, weight, this.paymentTotal).subscribe((response: any) => {
            if (response.status == '200') {
              this.orderForm.shipFee = response.fee.ship_fee_only
              orderForm.shipFee = response.fee.ship_fee_only

              if (orderForm.voucher == null) {
                ctnMessageShip.innerHTML = `Phí vận chuyển của bạn là ${Number(response.fee.ship_fee_only).toLocaleString("vi-VN")} đ`
              } else {
                this.orderForm.voucher = orderForm.voucher
                const voucher = {
                  token: this.userAuthService.getToken(),
                  discountCode: this.orderForm.voucher.discountCode,
                  provisional: this.provisional + Number((this.orderForm.shipFee) ? this.orderForm.shipFee : 0)
                }
                this.appVoucher(voucher)

                if (orderForm.voucher.freeShip == true) {
                  this.orderForm.shipFee = 0
                  ctnMessageShip.innerHTML = `Miễn phí vận chuyển`
                } else {
                  ctnMessageShip.innerHTML = `Phí vận chuyển của bạn là ${Number(response.fee.ship_fee_only).toLocaleString("vi-VN")} đ`
                }
              }
              localStorage.setItem("orderForm", JSON.stringify(orderForm))
              btnPayment.disabled = false
              btnVoucher.forEach((e: any) => {
                e.disabled = false
                e.innerHTML = `Áp dụng`
              })
              this.fcPaymentTotal()
            } else {
              alert(response.error)
              orderForm.shipFee = null
              localStorage.setItem("orderForm", JSON.stringify(orderForm))
            }
          })
        }
      } else {
        btnPayment.disabled = false
        btnVoucher.forEach((e: any) => {
          e.disabled = false
          e.innerHTML = `Áp dụng`
        })
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

      this.favoriteSave(response)
    }, (error: any) => {
      if (error.status == 403) {
        this.message.error = 'Tài khoản hoặc mật khẩu không chính xác'
      }
      btnLoginToMenu.disabled = false
      btnLoginToMenu.innerHTML = `Đăng nhập`
    })
  }

  private loginWithOAuth2() {
    const btnLoginToMenu: any = document.querySelector(".btnLoginToMenu")
    this.socialAuthService.authState.subscribe((data: any) => {
      const loginData: any = {
        email: `${data.id}@gmail.com`,
        firstName: data.firstName,
        lastName: data.lastName,
        provider: data.provider
      }
      btnLoginToMenu.disabled = true
      btnLoginToMenu.innerHTML = `<span class="loader2" style="5px dotted white"></span> Đăng nhập`

      this.userAuthService.loginWithOAhtu2(loginData).subscribe((response: any) => {
        this.userAuthService.setToken(response.token)
        this.userAuthService.setRefreshToken(response.refreshToken)

        this.favoriteSave(response)
      }, (error: any) => {
        btnLoginToMenu.disabled = true
        btnLoginToMenu.innerHTML = `<span class="loader2" style="5px dotted white"></span> Đăng nhập`
        if (error.status == 403) {
          this.message.error = 'Tài khoản của bạn đã bị khóa'
        }
      })
    })
  }

  public loginWidthFacebook() {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID).then((data: any) => {})
  }

  private favoriteSave(response: any) {
    const arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []
    if (arrFavorite.length == 0) {
      location.href = "/payment"
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
    const inpForm = document.querySelectorAll(".inpForm")
    const inpFormLogin = document.querySelectorAll(".inpFormLogin")
    const inpFormVoucher = document.querySelectorAll(".inpFormVoucher")

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

    inpFormLogin.forEach((e: any) => {
      e.addEventListener("input", () => {
        this.message.error = ''
      })
    })

    inpFormVoucher.forEach((event: any) => {
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

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }
}
