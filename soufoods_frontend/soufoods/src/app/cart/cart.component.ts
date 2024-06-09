import Swal from 'sweetalert2';
import { ProductService } from './../services/product/product.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  carts: any[] = []
  voucher: any = null
  orderForm: any = {}

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.findAll()
  }

  private findAll() {
    var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []

    arrCart.forEach((e: any, i: number) => {
      const id = e.id
      const orderForm = JSON.parse(localStorage.getItem("orderForm") + "") || {}
      if (orderForm) { this.orderForm = orderForm }

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
              this.handleUpdateCart()

              this.handleDeleteCart()

              setTimeout(() => {
                this.provisionalCart()
                this.checkProductCart()
                this.handlePayment()
              }, 300);
            }
          })
        }
      })
    })
  }

  private handlePayment() {
    const btnPaymentCart: any = document.querySelector(".btnPaymentCart")
    const inpNote: any = document.querySelector(".inpNote")
    const cloneBtnPaymentCart: any = this.cloneElement(btnPaymentCart)

    cloneBtnPaymentCart.addEventListener("click", () => {
      const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
      const arrError: any[] = []
      cloneBtnPaymentCart.disabled = true
      cloneBtnPaymentCart.innerHTML = `<span class="loader2"></span> THANH TOÁN`
      var check = true

      if (arrCart.length == 0) {
        this.carts = []
        this.handleCounter()
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
                  if (check) {
                    location.href = `/payment`
                  } else {
                    if (arrError.length != 0) {
                      var errors = ""
                      for (const error of arrError) {
                        errors += error
                      }
                      Swal.fire("", `<span style="font-size: medium;">${errors}</span>`, "error")
                    }
                  }
                  const orderForm = JSON.parse(localStorage.getItem("orderForm") + "") || {}
                  orderForm.note = inpNote.value.trim()
                  localStorage.setItem(`orderForm`, JSON.stringify(orderForm))
                  cloneBtnPaymentCart.disabled = false
                  cloneBtnPaymentCart.innerHTML = `THANH TOÁN`
                }, timeout);
              }
            }
          })
        })
      }
    })
  }

  private checkProductCart() {
    const arrError: any[] = []
    const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []

    if (arrCart.length == 0) {
      this.carts = []
      this.handleCounter()
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
                Swal.fire("", `<span style="font-size: medium;">${errors}</span>`, "error")
              }
            }, timeout);
          }
        })
      })
    }
  }

  private showAddCart(response: any) {
    const ctnAddCart: any = document.querySelector(".ctnAddCart")

    const productCart: any = document.querySelector(".product-cart")
    const image: any = productCart.querySelector(".image-cart")
    const img: any = image.querySelector("img")
    const ctnNameSize: any = productCart.querySelector(".name-size")

    const productSize: any = document.querySelector(".product-size")
    const nameSize: any = productSize.querySelector(".name")
    var ctnSize: any = productSize.querySelector(".ctnSize")

    const ctnQuantity: any = document.querySelector(".ctnQuantity")
    const btnMinus: any = ctnQuantity.querySelector(".btnMinus")
    const quantity: any = ctnQuantity.querySelector(".quantity")

    const btnPlus: any = ctnQuantity.querySelector(".btnPlus")
    const messageQuantity: any = document.querySelector(".message-quantity")

    // giảm số lượng sản phẩm
    const cloneBtnMinus: any = this.cloneElement(btnMinus)
    cloneBtnMinus.addEventListener("click", () => {
      var qtity = Number(quantity.innerHTML) - 1
      const id: any = cloneBtnMinus.getAttribute("id")
      cloneBtnMinus.disabled = true
      cloneBtnPlus.disabled = true
      messageQuantity.innerHTML = ''

      // kiểm tra hiện tại còn hàng hay ko
      this.productService.findDetailById(id).subscribe((responsePD: any) => {
        if (responsePD.status == '200') {
          if (qtity > responsePD.productDetail.quantity) {
            qtity = responsePD.productDetail.quantity
            cloneBtnPlus.disabled = true
            cloneBtnMinus.disabled = false
          } else if (qtity <= 1 && responsePD.productDetail.quantity > 0) {
            qtity = 1
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else if (qtity <= 1 && responsePD.productDetail.quantity == 0) {
            qtity = 0
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else {
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = false
          }

          quantity.innerHTML = qtity

          if (this.checkQtityAndActiveProduct(responsePD) == false) {
            setTimeout(() => {
              messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
            }, 1000);
            // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
            var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
            var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)

            if (indexCart != -1) {
              if (this.carts.length <= 1) {
                this.carts = []
                arrCart = []
              } else {
                arrCart.splice(indexCart, 1)
                this.carts.splice(indexCart, 1)
              }
              localStorage.setItem("carts", JSON.stringify(arrCart));
              this.handleCounter()
              this.provisionalCart()
            }

            // load lại size mới nếu size đó hết hàng
            this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
              response.product.productDetail = responseD
              this.showAddCart(response)
            })
          }
        } else {
          messageQuantity.innerHTML = 'Lỗi không xác định !'
          cloneBtnPlus.disabled = false
          cloneBtnMinus.disabled = false
        }
      })
    })

    // tăng số lượng sản phẩm
    const cloneBtnPlus: any = this.cloneElement(btnPlus)
    cloneBtnPlus.addEventListener("click", () => {
      var qtity = Number(quantity.innerHTML) + 1
      const id: any = cloneBtnPlus.getAttribute("id")
      cloneBtnPlus.disabled = true
      cloneBtnMinus.disabled = true
      messageQuantity.innerHTML = ''

      // kiểm tra hiện tại còn hàng hay ko
      this.productService.findDetailById(id).subscribe((responsePD: any) => {
        if (responsePD.status == '200') {
          if (qtity > responsePD.productDetail.quantity) {
            qtity = responsePD.productDetail.quantity
            cloneBtnPlus.disabled = true
            cloneBtnMinus.disabled = false

            messageQuantity.innerHTML = `Hiện tại số lượng sản phẩm chỉ còn ${responsePD.productDetail.quantity}`
          } else if (qtity <= 1 && responsePD.productDetail.quantity > 0) {
            qtity = 1
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else if (qtity <= 1 && responsePD.productDetail.quantity == 0) {
            qtity = 0
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else {
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = false
          }

          quantity.innerHTML = qtity

          if (this.checkQtityAndActiveProduct(responsePD) == false) {
            setTimeout(() => {
              messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
            }, 1000);
            // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
            var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
            var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)

            if (indexCart != -1) {
              if (this.carts.length <= 1) {
                this.carts = []
                arrCart = []
              } else {
                arrCart.splice(indexCart, 1)
                this.carts.splice(indexCart, 1)
              }
              localStorage.setItem("carts", JSON.stringify(arrCart));
              this.handleCounter()
              this.provisionalCart()
            }

            // load lại size mới nếu size đó hết hàng
            this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
              response.product.productDetail = responseD
              this.showAddCart(response)
            })
          }
        } else {
          messageQuantity.innerHTML = 'Lỗi không xác định !'
          cloneBtnPlus.disabled = false
          cloneBtnMinus.disabled = false
        }
      })
    })

    // thêm vào giỏ hàng
    const btnFastAddCart: any = document.querySelector(".btnFastAddCart")
    const cloneBtnFastAddCart: any = this.cloneElement(btnFastAddCart)
    var loadTimeout: any = null
    cloneBtnFastAddCart.addEventListener("click", () => {
      const id: any = cloneBtnFastAddCart.getAttribute("id")
      var check: boolean = true
      messageQuantity.innerHTML = ''
      cloneBtnFastAddCart.innerHTML = `<span class="loader2"></span> THÊM VÀO GIỎ`
      cloneBtnFastAddCart.disabled = true

      this.productService.findDetailById(id).subscribe((responsePD: any) => {
        if (responsePD.status == '200') {
          var qtity = quantity.innerHTML

          // kiểm tra hiện tại còn hàng hay ko
          if (qtity > responsePD.productDetail.quantity) {
            quantity.innerHTML = responsePD.productDetail.quantity
            cloneBtnPlus.disabled = true
            cloneBtnMinus.disabled = false
            check = false

            messageQuantity.innerHTML = `Hiện tại số lượng sản phẩm chỉ còn ${responsePD.productDetail.quantity}`
          } else if (qtity <= 1 && responsePD.productDetail.quantity > 0) {
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else if (qtity <= 1 && responsePD.productDetail.quantity == 0) {
            qtity = 0
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else {
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = false
          }

          // kiểm tra số lượng sản phẩm với giỏ hàng
          var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
          var checkCart = arrCart.find(e => e.id == responsePD.productDetail.id)
          var indexCart = arrCart.indexOf(checkCart)

          if (checkCart) {
            const qtity = Number(quantity.innerHTML) + checkCart.quantity
            if (qtity > responsePD.productDetail.quantity) {
              messageQuantity.innerHTML = `Toàn bộ ${responsePD.productDetail.product.name} - ${responsePD.productDetail.size} đều nằm trong giỏ hàng của bạn`
              if (loadTimeout != null) {
                clearTimeout(loadTimeout)
              }

              loadTimeout = setTimeout(() => {
                messageQuantity.innerHTML = ''
              }, 6000);
              check = false;
            }
          }

          if (this.checkQtityAndActiveProduct(responsePD) == false) {
            setTimeout(() => {
              messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
            }, 1000);
            // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
            if (indexCart != -1) {
              if (this.carts.length <= 1) {
                this.carts = []
                arrCart = []
              } else {
                arrCart.splice(indexCart, 1)
                this.carts.splice(indexCart, 1)
              }
              localStorage.setItem("carts", JSON.stringify(arrCart));
              this.handleCounter()
              this.provisionalCart()
            }

            // load lại size mới nếu size đó hết hàng
            this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
              response.product.productDetail = responseD
              this.showAddCart(response)
            })
            check = false
          }

          // Kiểm tra thành công thì thêm vào giỏ hàng
          if (check) {
            cloneShowAddCart.style.display = "none"
            ctnAddCart.style.top = "130%"
            ctnAddCart.style.opacity = "0"
            document.body.style.overflow = 'auto'

            const notCart: any = document.querySelector(".not-cart")
            response.product.productDetail = responsePD.productDetail
            if (notCart) { notCart.style.display = 'none' }

            if (checkCart) {
              const qtity = Number(quantity.innerHTML) + checkCart.quantity
              arrCart[indexCart] = {
                id: responsePD.productDetail.id,
                productId: responsePD.productDetail.product.id,
                quantity: qtity
              }

              for (let i = 0; i < this.carts.length; i++) {
                if (this.carts[i].productDetail.id == responsePD.productDetail.id) {
                  this.carts[i].quantity = qtity
                  this.carts[i].total = Number(qtity * (responsePD.productDetail.price * (100 - responsePD.productDetail.discount) / 100))
                  localStorage.setItem("carts", JSON.stringify(arrCart))
                }
              }
            } else {
              arrCart.unshift({
                id: responsePD.productDetail.id,
                productId: responsePD.productDetail.product.id,
                quantity: Number(quantity.innerHTML)
              })

              this.productService.findById(responsePD.productDetail.product.id).subscribe((response: any) => {
                response.product.productDetail = responsePD.productDetail
                response.product.quantity = Number(quantity.innerHTML)
                var total = 0
                if (response.product.productDetail.discount > 0) {
                  total = (response.product.productDetail.price * (100 - response.product.productDetail.discount) / 100) * Number(quantity.innerHTML)
                } else {
                  total = response.product.productDetail.price * Number(quantity.innerHTML)
                }
                response.product.total = total

                localStorage.setItem("carts", JSON.stringify(arrCart))
                this.carts.unshift(response.product)
                this.loadingImage()
                this.provisionalCart()
                this.handleDeleteCart()
                this.handleUpdateCart()
                this.handleCounter()
              })
            }

            this.loadingImage()
            this.provisionalCart()
            this.handleDeleteCart()
            this.handleUpdateCart()
            this.handleCounter()
          }
        } else {
          messageQuantity.innerHTML = 'Lỗi không xác định !'
        }

        cloneBtnFastAddCart.innerHTML = `THÊM VÀO GIỎ`
        cloneBtnFastAddCart.disabled = false
      })
    })

    // gắn giá trị vào các form
    productCart.href = `/collections/product?id=${response.product.id}&name=${response.product.name}`

    image.style.backgroundImage = 'url(../../assets/images/loading-image.gif)';
    const cloneImg: any = this.cloneElement(img)
    cloneImg.src = response.product.imageUrl
    cloneImg.style.opacity = '0'
    if (cloneImg.complete) {
      image.style.backgroundImage = 'none';
      cloneImg.style.opacity = '1'
    } else {
      cloneImg.addEventListener("load", () => {
        image.style.backgroundImage = 'none';
        cloneImg.style.opacity = '1'
      })
    }

    ctnSize.innerHTML = ''
    for (let i = 0; i < response.product.productDetail.length; i++) {
      if (response.product.productDetail[i].quantity != 0) {
        ctnSize.innerHTML += `<button class="size" id="${response.product.productDetail[i].id}" style="margin: 5px; padding: 2px 4px; border-radius: 10px; background-color: white; color: black; border: solid 1px lightgrey;">${response.product.productDetail[i].size}</button>`
      } else {
        ctnSize.innerHTML += `<del style="margin: 5px; padding: 2px 4px; border-radius: 10px; border: solid 1px lightgrey; color: grey; cursor: default; user-select: none;">${response.product.productDetail[i].size}</del>`
      }
    }

    // lấy tất cả size sản phẩm
    const getSize = (responseD: any, i: number) => {
      const productSize: any = document.querySelector(".product-size")
      const size: any = productSize.querySelectorAll(".size")
      size.forEach((e: any, index: number) => {
        if (i != index) {
          e.style.backgroundColor = 'white'
          e.style.color = ' black'
          e.style.border = "solid 1px lightgrey"
        }
      })

      size.forEach((e: any, index: number) => {
        if (i == index) {
          e.style.backgroundColor = 'rgb(255, 176, 80)'
          e.style.color = ' white'
          e.style.border = "none"
        }
      })

      ctnNameSize.innerHTML = ''
      ctnNameSize.innerHTML += `<div class="name" style="font-size: medium; margin-bottom: 5px;">${response.product.name}</div>`
      if (responseD.discount != 0) {
        ctnNameSize.innerHTML += `<del class="price-del" style="color: grey; margin-right: 5px;">${Number(responseD.price).toLocaleString("vi-VN")} đ</del>`
        ctnNameSize.innerHTML += `<span class="price" style="color: orange;">${Number(responseD.price * (100 - responseD.discount) / 100).toLocaleString("vi-VN")} đ</span>`
        ctnNameSize.innerHTML += `<div style="margin-top: 5px; font-size: 12px;">
                <span class="discount" style="padding: 2px 4px; background-color: rgb(255, 87, 87); border-radius: 5px; color: white; margin-right: 5px;">-${responseD.discount}%</span>
                <span class="save-money" style="padding: 2px 4px; background-color: rgb(255, 87, 87); border-radius: 5px; color: white; margin-right: 5px;">Tiết kiệm ${Number(responseD.price - (responseD.price * (100 - responseD.discount) / 100)).toLocaleString("vi-VN")} đ</span>
              </div>`
      } else {
        ctnNameSize.innerHTML += `<span class="price" style="color: orange;">${Number(responseD.price).toLocaleString("vi-VN")} đ</span>`
      }

      nameSize.innerHTML = `SIZE: ${responseD.size.toUpperCase()}`

      quantity.innerHTML = '1'
      cloneBtnMinus.disabled = true
      cloneBtnPlus.disabled = false
      cloneBtnMinus.setAttribute("id", responseD.id)
      cloneBtnPlus.setAttribute("id", responseD.id)
      cloneBtnFastAddCart.setAttribute("id", responseD.id)

      this.productService.findDetailById(responseD.id).subscribe((responsePD: any) => {
        if (this.checkQtityAndActiveProduct(responsePD) == false) {
          // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
          var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
          var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)

          if (indexCart != -1) {
            if (this.carts.length <= 1) {
              this.carts = []
              arrCart = []
            } else {
              arrCart.splice(indexCart, 1)
              this.carts.splice(indexCart, 1)
            }
            localStorage.setItem("carts", JSON.stringify(arrCart));
            this.handleCounter()
            this.provisionalCart()
          }

          // load lại size mới nếu size đó hết hàng
          setTimeout(() => {
            messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
          }, 1000);
          this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
            response.product.productDetail = responseD
            this.showAddCart(response)
          })
        } else {
          messageQuantity.innerHTML = ''
        }
      })
    }

    // Chọn size sản phẩm
    const size: any = ctnSize.querySelectorAll(".size")
    size.forEach((e: any, index: number) => {
      // lấy size đầu tiên với điều kiện còn hàng
      const id: any = e.getAttribute("id")
      for (let i = 0; i < response.product.productDetail.length; i++) {
        if (response.product.productDetail[i].quantity != 0) {
          if (response.product.productDetail[i].id == id) {
            getSize(response.product.productDetail[i], index)
          }
          break;
        }
      }

      e.addEventListener("click", () => {
        const id: any = e.getAttribute("id")
        messageQuantity.innerHTML = ''

        for (let i = 0; i < response.product.productDetail.length; i++) {
          if (response.product.productDetail[i].id == id) {
            getSize(response.product.productDetail[i], index)
          }
        }
      })
    })

    // Kiểm tra sản phẩm có hết hàng ko
    if (size.length == 0) {
      cloneBtnFastAddCart.disabled = true
      cloneBtnFastAddCart.innerHTML = "HẾT HÀNG"
    } else {
      cloneBtnFastAddCart.disabled = false
      cloneBtnFastAddCart.innerHTML = "THÊM VÀO GIỎ"
    }

    // Hiển thị và tắt form add cart
    const showAddCart: any = document.querySelector(".show-addCart")
    const closeAddCart: any = document.querySelector(".close-addCart")
    showAddCart.style.display = "block"
    ctnAddCart.style.top = "50%"
    ctnAddCart.style.opacity = "1"
    document.body.style.overflow = 'hidden'

    const cloneShowAddCart: any = this.cloneElement(showAddCart)
    cloneShowAddCart.addEventListener("click", () => {
      cloneShowAddCart.style.display = "none"
      ctnAddCart.style.top = "130%"
      ctnAddCart.style.opacity = "0"
      document.body.style.overflow = 'auto'
    })

    const cloneCloseAddCart: any = this.cloneElement(closeAddCart)
    cloneCloseAddCart.addEventListener("click", () => {
      cloneShowAddCart.style.display = "none"
      ctnAddCart.style.top = "130%"
      ctnAddCart.style.opacity = "0"
      document.body.style.overflow = 'auto'
    })
  }

  private handleUpdateCart() {
    setTimeout(() => {
      const ctnProductInCart: any = document.querySelector(".ctnProductInCart")
      const btnPaymentCart: any = document.querySelector(".btnPaymentCart")

      // Giảm số lượng sản phẩm
      const handleMinusCart = () => {
        const btnMinus = ctnProductInCart.querySelectorAll(".btnMinus")
        btnMinus.forEach((e: any, i: number) => {
          const cloneElement: any = this.cloneElement(e)

          cloneElement.addEventListener("click", () => {
            const btnPlus = ctnProductInCart.querySelectorAll(".btnPlus")
            const messageQuantity = ctnProductInCart.querySelectorAll(".message-quantity")

            var qtity = this.carts[i].quantity - 1
            const id: any = cloneElement.getAttribute("id")
            cloneElement.disabled = true
            btnPlus[i].disabled = true
            btnPaymentCart.disabled = true
            messageQuantity[i].innerHTML = ''

            // kiểm tra hiện tại còn hàng hay ko
            this.productService.findDetailById(id).subscribe((responsePD: any) => {
              const btnPlus = ctnProductInCart.querySelectorAll(".btnPlus")
              const btnMinus = ctnProductInCart.querySelectorAll(".btnMinus")
              if (responsePD.status == '200') {
                if (qtity > responsePD.productDetail.quantity) {
                  qtity = responsePD.productDetail.quantity
                  btnPlus[i].disabled = true
                  btnMinus[i].disabled = false
                } else if (qtity <= 1 && responsePD.productDetail.quantity > 0) {
                  qtity = 1
                  btnPlus[i].disabled = false
                  btnMinus[i].disabled = true
                } else if (qtity <= 1 && responsePD.productDetail.quantity == 0) {
                  qtity = 0
                  btnPlus[i].disabled = false
                  btnMinus[i].disabled = true
                } else {
                  btnPlus[i].disabled = false
                  btnMinus[i].disabled = false
                }

                this.carts[i].quantity = qtity

                if (this.checkQtityAndActiveProduct(responsePD) == false) {
                  messageQuantity[i].innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
                }

                var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
                var checkCart = arrCart.find(e => e.id == responsePD.productDetail.id)
                var indexCart = arrCart.indexOf(checkCart)

                if (checkCart) {
                  arrCart[indexCart] = {
                    id: responsePD.productDetail.id,
                    productId: responsePD.productDetail.product.id,
                    quantity: qtity
                  }
                  localStorage.setItem("carts", JSON.stringify(arrCart));
                }

                this.carts[i].total = Number(qtity * (responsePD.productDetail.price * (100 - responsePD.productDetail.discount) / 100))
                this.provisionalCart()
                this.handleCounter()
                setTimeout(() => {
                  if (qtity <= 1) {
                    btnPlus[i].disabled = false
                    btnMinus[i].disabled = true
                  }
                  handlePlusCart()
                }, 300);
              } else {
                messageQuantity[i].innerHTML = 'Lỗi không xác định !'
                btnPlus[i].disabled = false
                btnMinus[i].disabled = false
              }
              btnPaymentCart.disabled = false
            })
          })
        })
      }
      handleMinusCart()

      // tăng số lượng sản phẩm
      const handlePlusCart = () => {
        const btnPlus = ctnProductInCart.querySelectorAll(".btnPlus")
        btnPlus.forEach((e: any, i: number) => {
          const cloneElement: any = this.cloneElement(e)
          cloneElement.addEventListener("click", () => {
            const messageQuantity = ctnProductInCart.querySelectorAll(".message-quantity")
            const btnMinus = ctnProductInCart.querySelectorAll(".btnMinus")

            var qtity = this.carts[i].quantity + 1
            const id: any = cloneElement.getAttribute("id")
            cloneElement.disabled = true
            btnMinus[i].disabled = true
            btnPaymentCart.disabled = true
            messageQuantity[i].innerHTML = ''

            // kiểm tra hiện tại còn hàng hay ko
            this.productService.findDetailById(id).subscribe((responsePD: any) => {
              const btnPlus = ctnProductInCart.querySelectorAll(".btnPlus")
              const btnMinus = ctnProductInCart.querySelectorAll(".btnMinus")
              if (responsePD.status == '200') {
                if (qtity > responsePD.productDetail.quantity) {
                  qtity = responsePD.productDetail.quantity
                  btnPlus[i].disabled = true
                  btnMinus[i].disabled = false

                  messageQuantity[i].innerHTML = `Hiện tại số lượng sản phẩm chỉ còn ${responsePD.productDetail.quantity}`
                } else if (qtity <= 1 && responsePD.productDetail.quantity > 0) {
                  qtity = 1
                  btnPlus[i].disabled = false
                  btnMinus[i].disabled = true
                } else if (qtity <= 1 && responsePD.productDetail.quantity == 0) {
                  qtity = 0
                  btnPlus[i].disabled = false
                  btnMinus[i].disabled = true
                } else {
                  btnPlus[i].disabled = false
                  btnMinus[i].disabled = false
                }

                this.carts[i].quantity = qtity

                if (this.checkQtityAndActiveProduct(responsePD) == false) {
                  messageQuantity[i].innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
                }

                var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
                var checkCart = arrCart.find(e => e.id == responsePD.productDetail.id)
                var indexCart = arrCart.indexOf(checkCart)

                if (checkCart) {
                  arrCart[indexCart] = {
                    id: responsePD.productDetail.id,
                    productId: responsePD.productDetail.product.id,
                    quantity: qtity
                  }
                  localStorage.setItem("carts", JSON.stringify(arrCart));
                }

                this.carts[i].total = Number(qtity * (responsePD.productDetail.price * (100 - responsePD.productDetail.discount) / 100))
                this.provisionalCart()
                this.handleCounter()

                setTimeout(() => {
                  if (qtity <= 1) {
                    btnPlus[i].disabled = false
                    btnMinus[i].disabled = true
                  }
                  handleMinusCart()
                }, 300);
              } else {
                messageQuantity.innerHTML = 'Lỗi không xác định !'
                btnPlus[i].disabled = false
                btnMinus[i].disabled = false
              }
              btnPaymentCart.disabled = false
            })
          })
        })
      }
      handlePlusCart()

      // Cập nhật lại size sản phẩm
      const btnUpdateInCart = ctnProductInCart.querySelectorAll(".btnUpdateInCart")
      const messageQuantity: any = document.querySelector(".message-quantity")
      btnUpdateInCart.forEach((e: any) => {
        const cloneElement: any = this.cloneElement(e)
        cloneElement.addEventListener("click", () => {
          const id = cloneElement.getAttribute("id")
          const detailId = cloneElement.getAttribute("detailId")
          cloneElement.disabled = true

          this.productService.findById(id).subscribe((response: any) => {
            if (response.status == '200') {
              // kiểm tra hiện tại còn hàng hay ko
              this.productService.findDetailById(detailId).subscribe((responsePD: any) => {
                if (this.checkQtityAndActiveProduct(responsePD) == false) {
                  setTimeout(() => {
                    messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
                  }, 1000);
                  // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
                  var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
                  var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)

                  if (indexCart != -1) {
                    if (this.carts.length <= 1) {
                      this.carts = []
                      arrCart = []
                    } else {
                      arrCart.splice(indexCart, 1)
                      this.carts.splice(indexCart, 1)
                    }
                    localStorage.setItem("carts", JSON.stringify(arrCart));
                    this.handleCounter()
                    this.provisionalCart()
                  }

                  // load lại size mới nếu size đó hết hàng
                  this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
                    response.product.productDetail = responseD
                    this.showAddCart(response)
                  })
                } else {
                  this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
                    response.product.productDetail = responseD

                    this.showUpdateCart(response, detailId)
                    cloneElement.disabled = false
                  })
                }
              })
            }
          })
        })
      })
    }, 300);
  }

  private showUpdateCart(response: any, productDetailId: number) {
    const ctnAddCart: any = document.querySelector(".ctnAddCart")

    const productCart: any = document.querySelector(".product-cart")
    const image: any = productCart.querySelector(".image-cart")
    const img: any = image.querySelector("img")
    const ctnNameSize: any = productCart.querySelector(".name-size")

    const productSize: any = document.querySelector(".product-size")
    const nameSize: any = productSize.querySelector(".name")
    var ctnSize: any = productSize.querySelector(".ctnSize")

    const ctnQuantity: any = document.querySelector(".ctnQuantity")
    const btnMinus: any = ctnQuantity.querySelector(".btnMinus")
    const quantity: any = ctnQuantity.querySelector(".quantity")

    const btnPlus: any = ctnQuantity.querySelector(".btnPlus")
    const messageQuantity: any = document.querySelector(".message-quantity")

    // giảm số lượng sản phẩm
    const cloneBtnMinus: any = this.cloneElement(btnMinus)
    cloneBtnMinus.addEventListener("click", () => {
      var qtity = Number(quantity.innerHTML) - 1
      const id: any = cloneBtnMinus.getAttribute("id")
      cloneBtnMinus.disabled = true
      cloneBtnPlus.disabled = true
      messageQuantity.innerHTML = ''

      // kiểm tra hiện tại còn hàng hay ko
      this.productService.findDetailById(id).subscribe((responsePD: any) => {
        if (responsePD.status == '200') {
          if (qtity > responsePD.productDetail.quantity) {
            qtity = responsePD.productDetail.quantity
            cloneBtnPlus.disabled = true
            cloneBtnMinus.disabled = false
          } else if (qtity <= 1 && responsePD.productDetail.quantity > 0) {
            qtity = 1
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else if (qtity <= 1 && responsePD.productDetail.quantity == 0) {
            qtity = 0
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else {
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = false
          }

          quantity.innerHTML = qtity

          if (this.checkQtityAndActiveProduct(responsePD) == false) {
            setTimeout(() => {
              messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
            }, 1000);
            // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
            var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
            var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)

            if (indexCart != -1) {
              if (this.carts.length <= 1) {
                this.carts = []
                arrCart = []
              } else {
                arrCart.splice(indexCart, 1)
                this.carts.splice(indexCart, 1)
              }
              localStorage.setItem("carts", JSON.stringify(arrCart));
              this.handleCounter()
              this.provisionalCart()
            }

            // load lại size mới nếu size đó hết hàng
            this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
              response.product.productDetail = responseD
              this.showAddCart(response)
            })
          }
        } else {
          messageQuantity.innerHTML = 'Lỗi không xác định !'
          cloneBtnPlus.disabled = false
          cloneBtnMinus.disabled = false
        }
      })
    })

    // tăng số lượng sản phẩm
    const cloneBtnPlus: any = this.cloneElement(btnPlus)
    cloneBtnPlus.addEventListener("click", () => {
      var qtity = Number(quantity.innerHTML) + 1
      const id: any = cloneBtnPlus.getAttribute("id")
      cloneBtnPlus.disabled = true
      cloneBtnMinus.disabled = true
      messageQuantity.innerHTML = ''

      // kiểm tra hiện tại còn hàng hay ko
      this.productService.findDetailById(id).subscribe((responsePD: any) => {
        if (responsePD.status == '200') {
          if (qtity > responsePD.productDetail.quantity) {
            qtity = responsePD.productDetail.quantity
            cloneBtnPlus.disabled = true
            cloneBtnMinus.disabled = false

            messageQuantity.innerHTML = `Hiện tại số lượng sản phẩm chỉ còn ${responsePD.productDetail.quantity}`
          } else if (qtity <= 1 && responsePD.productDetail.quantity > 0) {
            qtity = 1
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else if (qtity <= 1 && responsePD.productDetail.quantity == 0) {
            qtity = 0
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else {
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = false
          }

          quantity.innerHTML = qtity

          if (this.checkQtityAndActiveProduct(responsePD) == false) {
            setTimeout(() => {
              messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
            }, 1000);
            // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
            var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
            var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)

            if (indexCart != -1) {
              if (this.carts.length <= 1) {
                this.carts = []
                arrCart = []
              } else {
                arrCart.splice(indexCart, 1)
                this.carts.splice(indexCart, 1)
              }
              localStorage.setItem("carts", JSON.stringify(arrCart));
              this.handleCounter()
              this.provisionalCart()
            }

            // load lại size mới nếu size đó hết hàng
            this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
              response.product.productDetail = responseD
              this.showAddCart(response)
            })
          }
        } else {
          messageQuantity.innerHTML = 'Lỗi không xác định !'
          cloneBtnPlus.disabled = false
          cloneBtnMinus.disabled = false
        }
      })
    })

    // cập nhật vào giỏ hàng
    const btnFastAddCart: any = document.querySelector(".btnFastAddCart")
    const cloneBtnFastAddCart: any = this.cloneElement(btnFastAddCart)
    var loadTimeout: any = null
    cloneBtnFastAddCart.addEventListener("click", () => {
      const id: any = cloneBtnFastAddCart.getAttribute("id")
      var check: boolean = true
      messageQuantity.innerHTML = ''
      cloneBtnFastAddCart.innerHTML = `<span class="loader2"></span> THÊM VÀO GIỎ`
      cloneBtnFastAddCart.disabled = true

      this.productService.findDetailById(id).subscribe((responsePD: any) => {
        if (responsePD.status == '200') {
          var qtity = quantity.innerHTML

          // kiểm tra hiện tại còn hàng hay ko
          if (qtity > responsePD.productDetail.quantity) {
            quantity.innerHTML = responsePD.productDetail.quantity
            cloneBtnPlus.disabled = true
            cloneBtnMinus.disabled = false
            check = false

            messageQuantity.innerHTML = `Hiện tại số lượng sản phẩm chỉ còn ${responsePD.productDetail.quantity}`
          } else if (qtity <= 1 && responsePD.productDetail.quantity > 0) {
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = true
          } else {
            cloneBtnPlus.disabled = false
            cloneBtnMinus.disabled = false
          }

          // kiểm tra số lượng sản phẩm với giỏ hàng
          var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
          var checkCart = arrCart.find(e => e.id == responsePD.productDetail.id)
          var indexCart = arrCart.indexOf(checkCart)

          if (checkCart) {
            const qtity = Number(quantity.innerHTML) + checkCart.quantity

            if (qtity > responsePD.productDetail.quantity) {
              messageQuantity.innerHTML = `Toàn bộ ${responsePD.productDetail.product.name} - ${responsePD.productDetail.size} đều nằm trong giỏ hàng của bạn`
              if (loadTimeout != null) {
                clearTimeout(loadTimeout)
              }

              loadTimeout = setTimeout(() => {
                messageQuantity.innerHTML = ''
              }, 6000);
              check = false;
            }
          }

          if (this.checkQtityAndActiveProduct(responsePD) == false) {
            setTimeout(() => {
              messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
            }, 1000);
            // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
            var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
            var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)

            if (indexCart != -1) {
              if (this.carts.length <= 1) {
                this.carts = []
                arrCart = []
              } else {
                arrCart.splice(indexCart, 1)
                this.carts.splice(indexCart, 1)
              }
              localStorage.setItem("carts", JSON.stringify(arrCart));
              this.handleCounter()
              this.provisionalCart()
            }

            // load lại size mới nếu size đó hết hàng
            this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
              response.product.productDetail = responseD
              this.showAddCart(response)
            })
            check = false
          }

          // Kiểm tra thành công thì cập nhật vào giỏ hàng
          if (check) {
            cloneShowAddCart.style.display = "none"
            ctnAddCart.style.top = "130%"
            ctnAddCart.style.opacity = "0"

            const notCart: any = document.querySelector(".not-cart")
            response.product.productDetail = responsePD.productDetail
            if (notCart) { notCart.style.display = 'none' }

            if (checkCart) {
              const qtity = Number(quantity.innerHTML) + checkCart.quantity
              arrCart[indexCart] = {
                id: responsePD.productDetail.id,
                productId: responsePD.productDetail.product.id,
                quantity: qtity
              }

              for (let i = 0; i < this.carts.length; i++) {
                if (this.carts[i].productDetail.id == responsePD.productDetail.id) {
                  this.carts[i].quantity = qtity
                  this.carts[i].total = Number(qtity * (responsePD.productDetail.price * (100 - responsePD.productDetail.discount) / 100))
                  localStorage.setItem("carts", JSON.stringify(arrCart))
                  break;
                }
              }
            } else {
              arrCart.unshift({
                id: responsePD.productDetail.id,
                productId: responsePD.productDetail.product.id,
                quantity: Number(quantity.innerHTML)
              })

              this.productService.findById(responsePD.productDetail.product.id).subscribe((response: any) => {
                response.product.productDetail = responsePD.productDetail
                response.product.quantity = Number(quantity.innerHTML)
                var total = 0
                if (response.product.productDetail.discount > 0) {
                  total = (response.product.productDetail.price * (100 - response.product.productDetail.discount) / 100) * Number(quantity.innerHTML)
                } else {
                  total = response.product.productDetail.price * Number(quantity.innerHTML)
                }
                response.product.total = total

                localStorage.setItem("carts", JSON.stringify(arrCart))
                this.carts.unshift(response.product)
                this.loadingImage()
                this.provisionalCart()
                this.handleDeleteCart()
                this.handleUpdateCart()
                this.handleCounter()
              })
            }

            // nếu cập nhật sản phẩm loại khác ko giống ban đầu thì xóa ban đầu đi
            const ctnProductInCart: any = document.querySelector(".ctnProductInCart")
            const btnDeleteInCart = ctnProductInCart.querySelectorAll(".btnDeleteInCart")
            btnDeleteInCart.forEach((e: any, i: number) => {
              if (e.getAttribute("id") == productDetailId && productDetailId != responsePD.productDetail.id) {
                if (this.carts.length <= 1) {
                  this.carts = []
                } else {
                  this.carts.splice(i, 1)
                }

                var index = arrCart.findIndex(e => e.id == productDetailId)
                if (this.carts.length <= 1) {
                  arrCart = []
                } else {
                  arrCart.splice(index, 1)
                }
                localStorage.setItem("carts", JSON.stringify(arrCart))
              }
            })

            this.loadingImage()
            this.provisionalCart()
            this.handleDeleteCart()
            this.handleUpdateCart()
            this.handleCounter()
          }
        } else {
          messageQuantity.innerHTML = 'Lỗi không xác định !'
        }

        cloneBtnFastAddCart.innerHTML = `THÊM VÀO GIỎ`
        cloneBtnFastAddCart.disabled = false
      })
    })

    // gắn giá trị vào các form
    productCart.href = `/collections/product?id=${response.product.id}&name=${response.product.name}`

    image.style.backgroundImage = 'url(../../assets/images/loading-image.gif)';
    const cloneImg: any = this.cloneElement(img)
    cloneImg.src = response.product.imageUrl
    cloneImg.style.opacity = '0'
    if (cloneImg.complete) {
      image.style.backgroundImage = 'none';
      cloneImg.style.opacity = '1'
    } else {
      cloneImg.addEventListener("load", () => {
        image.style.backgroundImage = 'none';
        cloneImg.style.opacity = '1'
      })
    }

    ctnSize.innerHTML = ''
    for (let i = 0; i < response.product.productDetail.length; i++) {
      if (response.product.productDetail[i].quantity != 0) {
        ctnSize.innerHTML += `<button class="size" id="${response.product.productDetail[i].id}" style="margin: 5px; padding: 2px 4px; border-radius: 10px; background-color: rgb(255, 176, 80); color: white; border: none;">${response.product.productDetail[i].size}</button>`
      } else {
        ctnSize.innerHTML += `<del style="margin: 5px; padding: 2px 4px; border-radius: 10px; border: solid 1px lightgrey; color: grey; cursor: default; user-select: none;">${response.product.productDetail[i].size}</del>`
      }
    }

    // lấy tất cả size sản phẩm
    const getSize = (responseD: any, i: number) => {
      const productSize: any = document.querySelector(".product-size")
      const size: any = productSize.querySelectorAll(".size")
      size.forEach((e: any, index: number) => {
        if (i != index) {
          e.style.backgroundColor = 'white'
          e.style.color = ' black'
          e.style.border = "solid 1px lightgrey"
        }
      })

      size.forEach((e: any, index: number) => {
        if (i == index) {
          e.style.backgroundColor = 'rgb(255, 176, 80)'
          e.style.color = ' white'
          e.style.border = "none"
        }
      })

      ctnNameSize.innerHTML = ''
      ctnNameSize.innerHTML += `<div class="name" style="font-size: medium; margin-bottom: 5px;">${response.product.name}</div>`
      if (responseD.discount != 0) {
        ctnNameSize.innerHTML += `<del class="price-del" style="color: grey; margin-right: 5px;">${Number(responseD.price).toLocaleString("vi-VN")} đ</del>`
        ctnNameSize.innerHTML += `<span class="price" style="color: orange;">${Number(responseD.price * (100 - responseD.discount) / 100).toLocaleString("vi-VN")} đ</span>`
        ctnNameSize.innerHTML += `<div style="margin-top: 5px; font-size: 12px;">
                <span class="discount" style="padding: 2px 4px; background-color: rgb(255, 87, 87); border-radius: 5px; color: white; margin-right: 5px;">-${responseD.discount}%</span>
                <span class="save-money" style="padding: 2px 4px; background-color: rgb(255, 87, 87); border-radius: 5px; color: white; margin-right: 5px;">Tiết kiệm ${Number(responseD.price - (responseD.price * (100 - responseD.discount) / 100)).toLocaleString("vi-VN")} đ</span>
              </div>`
      } else {
        ctnNameSize.innerHTML += `<span class="price" style="color: orange;">${Number(responseD.price).toLocaleString("vi-VN")} đ</span>`
      }

      nameSize.innerHTML = `SIZE: ${responseD.size.toUpperCase()}`

      quantity.innerHTML = '1'
      cloneBtnMinus.disabled = true
      cloneBtnPlus.disabled = false
      cloneBtnMinus.setAttribute("id", responseD.id)
      cloneBtnPlus.setAttribute("id", responseD.id)
      cloneBtnFastAddCart.setAttribute("id", responseD.id)

      this.productService.findDetailById(responseD.id).subscribe((responsePD: any) => {
        if (this.checkQtityAndActiveProduct(responsePD) == false) {
          // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
          var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
          var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)

          if (indexCart != -1) {
            if (this.carts.length <= 1) {
              this.carts = []
              arrCart = []
            } else {
              arrCart.splice(indexCart, 1)
              this.carts.splice(indexCart, 1)
            }
            localStorage.setItem("carts", JSON.stringify(arrCart));
            this.handleCounter()
            this.provisionalCart()
          }

          // load lại size mới nếu size đó hết hàng
          setTimeout(() => {
            messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
          }, 1000);
          this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
            response.product.productDetail = responseD
            quantity.innerHTML = '0'
            this.showAddCart(response)
          })
        } else {
          messageQuantity.innerHTML = ''
        }
      })
    }

    // Chọn size sản phẩm
    const size: any = ctnSize.querySelectorAll(".size")
    size.forEach((e: any, index: number) => {
      // lấy size muốn cập nhật
      const id: any = e.getAttribute("id")
      for (let i = 0; i < response.product.productDetail.length; i++) {
        if (response.product.productDetail[i].id == productDetailId && response.product.productDetail[i].id == id) {
          getSize(response.product.productDetail[i], index)
          break;
        }
      }

      e.addEventListener("click", () => {
        const id: any = e.getAttribute("id")
        messageQuantity.innerHTML = ''

        for (let i = 0; i < response.product.productDetail.length; i++) {
          if (response.product.productDetail[i].id == id) {
            getSize(response.product.productDetail[i], index)
          }
        }
      })
    })

    // Kiểm tra sản phẩm có hết hàng ko
    if (size.length == 0) {
      cloneBtnFastAddCart.disabled = true
      cloneBtnFastAddCart.innerHTML = "HẾT HÀNG"
    } else {
      cloneBtnFastAddCart.disabled = false
      cloneBtnFastAddCart.innerHTML = "THÊM VÀO GIỎ"
    }

    // Hiển thị và tắt form add cart
    const showAddCart: any = document.querySelector(".show-addCart")
    const closeAddCart: any = document.querySelector(".close-addCart")
    showAddCart.style.display = "block"
    ctnAddCart.style.top = "50%"
    ctnAddCart.style.opacity = "1"

    const cloneShowAddCart: any = this.cloneElement(showAddCart)
    cloneShowAddCart.addEventListener("click", () => {
      cloneShowAddCart.style.display = "none"
      ctnAddCart.style.top = "130%"
      ctnAddCart.style.opacity = "0"
    })

    const cloneCloseAddCart: any = this.cloneElement(closeAddCart)
    cloneCloseAddCart.addEventListener("click", () => {
      cloneShowAddCart.style.display = "none"
      ctnAddCart.style.top = "130%"
      ctnAddCart.style.opacity = "0"
    })
  }

  public handleDeleteCart() {
    setTimeout(() => {
      const ctnProductInCart: any = document.querySelector(".ctnProductInCart")
      const btnDeleteInCart = ctnProductInCart.querySelectorAll(".btnDeleteInCart")
      var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []

      btnDeleteInCart.forEach((e: any, i: number) => {
        const cloneElement: any = this.cloneElement(e)
        cloneElement.addEventListener("click", () => {
          const id = cloneElement.getAttribute("id")

          const messageQuantity: any = ctnProductInCart.querySelector(".message-quantity")
          cloneElement.disabled = true

          this.productService.findDetailById(id).subscribe((responsePD: any) => {
            if (responsePD.status == '200') {
              var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)
              if (indexCart != -1) {
                if (arrCart.length <= 1) {
                  arrCart = []
                  this.carts = []
                } else {
                  arrCart.splice(indexCart, 1)
                  this.carts.splice(indexCart, 1)
                }
                localStorage.setItem("carts", JSON.stringify(arrCart));
              }

              this.handleCounter()

              this.provisionalCart()

              this.handleUpdateCart()
            } else {
              messageQuantity.innerHTML = 'Lỗi không xác định !'
            }

            cloneElement.disabled = false
          })

        })
      })
    }, 300);
  }

  private provisionalCart() {
    var total = 0
    const ctnProvisionalInCart: any = document.querySelector(".ctnProvisionalInCart")
    if (ctnProvisionalInCart) {
      const totalInCart: any = ctnProvisionalInCart.querySelector(".total-cart")

      for (let i = 0; i < this.carts.length; i++) {
        total += this.carts[i].total
      }

      totalInCart.innerHTML = total.toLocaleString("vi-VN") + ' đ'
    }
  }

  private handleCounter() {
    // Đếm số lượt sản phẩm giỏ hàng
    const countCart = document.querySelectorAll(".count-cart")
    var countC = 0
    var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
    arrCart.forEach((e: any) => {
      countC += e.quantity
    })

    countCart.forEach((e: any) => {
      e.innerHTML = countC
    })
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

  private checkQtityAndActiveProduct(responsePD: any) {
    var check = true

    if (responsePD.productDetail.quantity == 0 || responsePD.productDetail.active == false
      || responsePD.productDetail.product.active == false || responsePD.productDetail.product.categoryDetail.active == false
      || responsePD.productDetail.product.categoryDetail.category.active == false) {

      check = false
    }

    return check;
  }

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }
}
