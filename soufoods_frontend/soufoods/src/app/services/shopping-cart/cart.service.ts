import Swal from 'sweetalert2';
import { ProductService } from './../product/product.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private productService: ProductService) { }

  public findAll() {
    var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
    const ctnProductCarts: any = document.querySelector(".ctnProductCarts")
    const loadingCart: any = document.querySelector(".loading-cart")
    const notCart: any = document.querySelector(".not-cart")
    ctnProductCarts.innerHTML = ''

    arrCart.forEach((e: any) => {
      if (notCart) { notCart.style.display = 'none' }
      const id = e.id

      this.productService.findDetailById(id).subscribe((responseD: any) => {
        if (responseD.status == '200') {
          this.productService.findById(responseD.productDetail.product.id).subscribe((response: any) => {
            response.product.productDetail = responseD.productDetail

            var productCart = ''

            productCart += `
                <div class="product-carts" id=${response.product.productDetail.id} style="padding: 10px 0; border-bottom: solid 1px lightgrey; display: flex; align-items: center;">
                  <a style="margin: 0 10px;" href="/collections/product?id=${response.product.id}&name=${response.product.name}">
                    <div class="image" style="background-color: white; height: 120px; width: 120px; background-image: url(../../../assets/images/loading-image.gif); background-position: 70% 100%; background-size: cover; background-repeat: no-repeat; object-position: center center; overflow: hidden; position: relative;">
                      <img src="${response.product.imageUrl}" loading="lazy" style="max-width: 100%; width: 100%; height: 100%; opacity: 0; object-fit: contain; object-position: center center;">
                    </div>
                  </a>
                  <div class="name-size">
                    <div style="font-size: 14px;">${response.product.name}</div>
                    <div style="font-size: 14px; color: grey;">${(response.product.name != response.product.productDetail.size) ? response.product.productDetail.size : ''}</div>

                `

            if (response.product.productDetail.discount > 0) {
              productCart += `
                    <del style="font-size: 15px; color: grey; margin-right: 6px;">${Number(response.product.productDetail.price).toLocaleString("vi-VN")} đ</del>
                  `
            }

            productCart += `
                  <span class="price" style="font-size: 15px; color: orange;">${Number(response.product.productDetail.price * (100 - response.product.productDetail.discount) / 100).toLocaleString("vi-VN")} đ</span>

                  <div style="display: flex; align-items: center; justify-content: flex-start; margin-top: 10px;">
                    <div style="padding: 2px 10px; border-radius: 20px; border: solid 1px black; font-size: medium; display: flex; align-items: center;">
                      <button class="btnMinus" ${e.quantity <= 1 ? 'disabled' : ''} id="${response.product.productDetail.id}" style="border: none; background-color: transparent;"><i class="fa-solid fa-minus"></i></button>
                      <div class="quantity" style="margin: 0 15px;">${e.quantity}</div>
                      <button class="btnPlus" id="${response.product.productDetail.id}" style="border: none; background-color: transparent;"><i class="fa-solid fa-plus"></i></button>
                    </div>
                  </div>
                  <div class="message-quantity-cart" style="color: red; font-size: 14px; margin-bottom: 10px;"></div>

                  <div class="action">
                `

            if (response.product.name != response.product.productDetail.size) {
              productCart += `<button class="btnUpdateCart" id="${response.product.id}" detailId="${response.product.productDetail.id}" style="border: none; background-color: transparent; color: grey; font-size: large; margin-right: 15px;"><i class="fa-regular fa-pen-to-square"></i></button>`
            }

            productCart += `<button class="btnDeleteCart" id="${response.product.productDetail.id}" style="border: none; background-color: transparent; color: grey; font-size: large;"><i class="fa-regular fa-trash-can"></i></button>`

            productCart += `
                    </div>
                  </div>
                </div>
                `

            ctnProductCarts.innerHTML += productCart
            loadingCart.style.display = "none"

            this.loadingImage()
            this.handleDeleteCart()
            this.handleUpdateCart()
            this.provisionalCart()
          })
        }
      })
    })

    if(arrCart.length == 0) {
      loadingCart.style.display = "none"
    }
  }

  public provisionalCart() {
    var total = 0
    const totalCart: any = document.querySelector(".total-cart")
    const ctnProductCarts: any = document.querySelector(".ctnProductCarts")
    const price: any = ctnProductCarts.querySelectorAll(".price")
    const quantity: any = ctnProductCarts.querySelectorAll(".quantity")

    price.forEach((e: any, i: number) => {
      e.innerHTML = e.innerHTML.replaceAll('đ', '')
      const number = Number(e.innerHTML.replaceAll('.', '').trim())
      const qtity = Number(quantity[i].innerHTML)
      total += number * qtity
    })

    totalCart.innerHTML = total.toLocaleString("vi-VN") + ' đ'
  }

  public handleAddCart() {
    setTimeout(() => {
      const notCart: any = document.querySelector(".not-cart")
      const btnAddCart = document.querySelectorAll(".btnAddCart")
      const ctnProductCarts: any = document.querySelector(".ctnProductCarts")

      btnAddCart.forEach((e: any, i: number) => {
        const cloneElement: any = this.cloneElement(e)
        cloneElement.addEventListener("click", () => {

          const id: any = cloneElement.getAttribute("id")
          const saveBtnAddCart = cloneElement.innerHTML
          const actionCart: any = document.querySelector(".action-cart")

          if (id) {
            cloneElement.disabled = true
            cloneElement.innerHTML = `<span class="loader2" style="color: white; background-color: orange; padding: 10px; opacity: 0.9;"></span>`

            this.productService.findById(id).subscribe((response: any) => {
              if (response.status == '200') {
                this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
                  response.product.productDetail = responseD

                  // nếu số lượng size lớn hơn 1 thì sẽ cho chọn size và ngược lại thì thêm giỏ hàng
                  if (responseD.length > 1) {
                    this.showAddCart(response)
                  } else {
                    var check: boolean = true
                    this.productService.findDetailById(responseD[0].id).subscribe((responsePD: any) => {
                      var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
                      var checkCart = arrCart.find(e => e.id == responsePD.productDetail.id)
                      var indexCart = arrCart.indexOf(checkCart)

                      // kiểm tra số lượng sản phẩm với giỏ hàng
                      if (checkCart) {
                        const qtity = checkCart.quantity + 1
                        if (qtity > responsePD.productDetail.quantity) {
                          check = false;
                          Swal.fire({
                            text: `Toàn bộ ${responsePD.productDetail.product.name} đều nằm trong giỏ hàng của bạn`,
                            showDenyButton: true,
                            confirmButtonText: "Giỏ hàng",
                            denyButtonText: `Hủy bỏ`
                          }).then((result) => {
                            if (result.isConfirmed) {
                              actionCart.click()
                            }
                          })
                        }
                      }

                      if (this.checkQtityAndActiveProduct(responsePD) == false) {
                        Swal.fire('', `Hiện tại ${responsePD.productDetail.size} vừa hết hàng`)

                        // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
                        const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
                        btnDeleteCart.forEach((e: any) => {
                          if (e.getAttribute("id") == responsePD.productDetail.id) {
                            e.click()
                          }
                        })
                        check = false
                      }

                      // Kiểm tra thành công thì thêm vào giỏ hàng
                      if (check) {
                        actionCart.click()
                        response.product.productDetail = responsePD.productDetail
                        if (notCart) { notCart.style.display = 'none' }

                        if (checkCart) {
                          const qtity = checkCart.quantity + 1
                          arrCart[indexCart] = {
                            id: responsePD.productDetail.id,
                            productId: responsePD.productDetail.product.id,
                            quantity: qtity
                          }
                          ctnProductCarts.insertAdjacentHTML('afterbegin', this.addProductCart(response, qtity));
                        } else {
                          arrCart.unshift({
                            id: responsePD.productDetail.id,
                            productId: responsePD.productDetail.product.id,
                            quantity: 1
                          })
                          ctnProductCarts.insertAdjacentHTML('afterbegin', this.addProductCart(response, 1));
                        }
                        localStorage.setItem("carts", JSON.stringify(arrCart));

                        this.loadingImage()
                        this.provisionalCart()
                        this.handleDeleteCart()
                        this.handleUpdateCart()
                        this.handleCounter()
                      }
                    })
                  }

                  const btnAddCart: any = document.querySelectorAll(".btnAddCart")[i]

                  btnAddCart.disabled = false
                  btnAddCart.innerHTML = saveBtnAddCart
                  cloneElement.disabled = false
                  cloneElement.innerHTML = saveBtnAddCart
                })
              } else {
                if (response.error) {
                  Swal.fire("", response.error, "error")
                }
                const btnAddCart: any = document.querySelectorAll(".btnAddCart")[i]
                btnAddCart.disabled = false
                btnAddCart.innerHTML = saveBtnAddCart
                cloneElement.disabled = false
                cloneElement.innerHTML = saveBtnAddCart
              }
            })
          }
        })
      })
    }, 300);
  }

  public showAddCart(response: any) {
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
            const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
            btnDeleteCart.forEach((e: any) => {
              if (e.getAttribute("id") == responsePD.productDetail.id) {
                e.click()
              }
            })

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
            const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
            btnDeleteCart.forEach((e: any) => {
              if (e.getAttribute("id") == responsePD.productDetail.id) {
                e.click()
              }
            })

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
            const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
            btnDeleteCart.forEach((e: any) => {
              if (e.getAttribute("id") == responsePD.productDetail.id) {
                e.click()
              }
            })

            // load lại size mới nếu size đó hết hàng
            this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
              response.product.productDetail = responseD
              this.showAddCart(response)
            })
            check = false
          }

          // Kiểm tra thành công thì thêm vào giỏ hàng
          if (check) {
            const actionCart: any = document.querySelector(".action-cart")
            cloneShowAddCart.style.display = "none"
            ctnAddCart.style.top = "130%"
            ctnAddCart.style.opacity = "0"
            document.body.style.overflow = 'auto'

            actionCart.click()
            const ctnProductCarts: any = document.querySelector(".ctnProductCarts")
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

              ctnProductCarts.insertAdjacentHTML('afterbegin', this.addProductCart(response, qtity));
            } else {
              arrCart.unshift({
                id: responsePD.productDetail.id,
                productId: responsePD.productDetail.product.id,
                quantity: Number(quantity.innerHTML)
              })

              ctnProductCarts.insertAdjacentHTML('afterbegin', this.addProductCart(response, Number(quantity.innerHTML)));
            }
            localStorage.setItem("carts", JSON.stringify(arrCart));

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
          const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
          btnDeleteCart.forEach((e: any) => {
            if (e.getAttribute("id") == responsePD.productDetail.id) {
              e.click()
            }
          })

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

  public addProductCart(response: any, quantity: number) {
    var productCart = ''
    var flag = false
    var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []

    // Cộng thêm số lượng sản phẩm nếu có trong giỏ hàng và ngược lại là 1
    arrCart.forEach((e: any) => {
      const id: any = e.id
      if (id == response.product.productDetail.id) {
        const ctnProductCarts: any = document.querySelector(".ctnProductCarts")
        const productCart: any = ctnProductCarts.querySelectorAll(".product-carts")
        productCart.forEach((e: any) => {
          const detailId: any = e.getAttribute("id")

          if (detailId == id) {
            const qtity: any = e.querySelector(".quantity")
            const btnMinus: any = e.querySelector(".btnMinus")
            qtity.innerHTML = quantity
            btnMinus.disabled = false
          }
        })
        flag = true
      }
    })

    if (!flag) {
      productCart += `
      <div class="product-carts" id=${response.product.productDetail.id} style="padding: 10px 0; border-bottom: solid 1px lightgrey; display: flex; align-items: center;">
        <a style="margin: 0 10px;" href="/collections/product?id=${response.product.id}&name=${response.product.name}">
          <div class="image" style="background-color: white; height: 120px; width: 120px; background-image: url(../../../assets/images/loading-image.gif); background-position: 70% 100%; background-size: cover; background-repeat: no-repeat; object-position: center center; overflow: hidden; position: relative;">
            <img src="${response.product.imageUrl}" loading="lazy" style="max-width: 100%; width: 100%; height: 100%; opacity: 0; object-fit: contain; object-position: center center;">
          </div>
        </a>
        <div class="name-size">
          <div style="font-size: 14px;">${response.product.name}</div>
          <div style="font-size: 14px; color: grey;">${(response.product.name != response.product.productDetail.size) ? response.product.productDetail.size : ''}</div>

      `

      if (response.product.productDetail.discount > 0) {
        productCart += `
          <del style="font-size: 15px; color: grey; margin-right: 6px;">${Number(response.product.productDetail.price).toLocaleString("vi-VN")} đ</del>
        `
      }

      productCart += `
        <span class="price" style="font-size: 15px; color: orange;">${Number(response.product.productDetail.price * (100 - response.product.productDetail.discount) / 100).toLocaleString("vi-VN")} đ</span>

        <div style="display: flex; align-items: center; justify-content: flex-start; margin-top: 10px;">
          <div style="padding: 2px 10px; border-radius: 20px; border: solid 1px black; font-size: medium; display: flex; align-items: center;">
            <button class="btnMinus" ${quantity <= 1 ? 'disabled' : ''} id="${response.product.productDetail.id}" style="border: none; background-color: transparent;"><i class="fa-solid fa-minus"></i></button>
            <div class="quantity" style="margin: 0 15px;">${quantity}</div>
            <button class="btnPlus" id="${response.product.productDetail.id}" style="border: none; background-color: transparent;"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>
        <div class="message-quantity-cart" style="color: red; font-size: 14px; margin-bottom: 10px;"></div>

        <div class="action">
      `

      if (response.product.name != response.product.productDetail.size) {
        productCart += `<button class="btnUpdateCart" id="${response.product.id}" detailId="${response.product.productDetail.id}" style="border: none; background-color: transparent; color: grey; font-size: large; margin-right: 15px;"><i class="fa-regular fa-pen-to-square"></i></button>`
      }

      productCart += `<button class="btnDeleteCart" id="${response.product.productDetail.id}" style="border: none; background-color: transparent; color: grey; font-size: large;"><i class="fa-regular fa-trash-can"></i></button>`

      productCart += `
          </div>
        </div>
      </div>
      `
    }
    return productCart;
  }

  public handleDeleteCart() {
    const btnDeleteCart = document.querySelectorAll(".btnDeleteCart")
    const notCart: any = document.querySelector(".not-cart")

    btnDeleteCart.forEach((e: any) => {
      const cloneElement: any = this.cloneElement(e)
      cloneElement.addEventListener("click", () => {
        const id = cloneElement.getAttribute("id")
        const productCart: any = cloneElement.parentNode.parentNode.parentNode
        const messageQuantityCart: any = productCart.querySelector(".message-quantity-cart")
        cloneElement.disabled = true

        this.productService.findDetailById(id).subscribe((responsePD: any) => {
          if (responsePD.status == '200') {
            var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
            var indexCart = arrCart.findIndex(e => e.id == responsePD.productDetail.id)
            if (indexCart != -1) {
              if (arrCart.length <= 1) {
                arrCart = []
              } else {
                arrCart.splice(indexCart, 1)
              }
              localStorage.setItem("carts", JSON.stringify(arrCart));
            }
            productCart.remove()

            const length = document.querySelectorAll(".btnDeleteCart").length
            if (length == 0) { notCart.style.display = 'block' }

            this.handleCounter()

            this.provisionalCart()

            this.handleUpdateCart()
          } else {
            messageQuantityCart.innerHTML = 'Lỗi không xác định !'
          }

          cloneElement.disabled = false
        })

      })
    })
  }

  public handleUpdateCart() {
    const ctnProductCarts: any = document.querySelector(".ctnProductCarts")
    const btnMinus = ctnProductCarts.querySelectorAll(".btnMinus")
    const btnPlus = ctnProductCarts.querySelectorAll(".btnPlus")

    // Giảm số lượng sản phẩm
    btnMinus.forEach((e: any, i: number) => {
      const cloneElement: any = this.cloneElement(e)
      cloneElement.addEventListener("click", () => {
        const btnPlus = ctnProductCarts.querySelectorAll(".btnPlus")
        const quantity = ctnProductCarts.querySelectorAll(".quantity")
        const messageQuantityCart = ctnProductCarts.querySelectorAll(".message-quantity-cart")

        var qtity = Number(quantity[i].innerHTML) - 1
        const id: any = cloneElement.getAttribute("id")
        cloneElement.disabled = true
        btnPlus[i].disabled = true
        messageQuantityCart[i].innerHTML = ''

        // kiểm tra hiện tại còn hàng hay ko
        this.productService.findDetailById(id).subscribe((responsePD: any) => {
          const btnPlus = ctnProductCarts.querySelectorAll(".btnPlus")
          const btnMinus = ctnProductCarts.querySelectorAll(".btnMinus")
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

            quantity[i].innerHTML = qtity

            if (this.checkQtityAndActiveProduct(responsePD) == false) {
              messageQuantityCart[i].innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
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

            this.provisionalCart()
            this.handleCounter()
          } else {
            messageQuantityCart[i].innerHTML = 'Lỗi không xác định !'
            btnPlus[i].disabled = false
            btnMinus[i].disabled = false
          }
        })
      })
    })

    // tăng số lượng sản phẩm
    btnPlus.forEach((e: any, i: number) => {
      const cloneElement: any = this.cloneElement(e)
      cloneElement.addEventListener("click", () => {
        const btnMinus = ctnProductCarts.querySelectorAll(".btnMinus")
        const quantity = ctnProductCarts.querySelectorAll(".quantity")
        const messageQuantityCart = ctnProductCarts.querySelectorAll(".message-quantity-cart")

        var qtity = Number(quantity[i].innerHTML) + 1
        const id: any = cloneElement.getAttribute("id")
        cloneElement.disabled = true
        btnMinus[i].disabled = true
        messageQuantityCart[i].innerHTML = ''

        // kiểm tra hiện tại còn hàng hay ko
        this.productService.findDetailById(id).subscribe((responsePD: any) => {
          const btnPlus = ctnProductCarts.querySelectorAll(".btnPlus")
          const btnMinus = ctnProductCarts.querySelectorAll(".btnMinus")
          if (responsePD.status == '200') {
            if (qtity > responsePD.productDetail.quantity) {
              qtity = responsePD.productDetail.quantity
              btnPlus[i].disabled = true
              btnMinus[i].disabled = false

              messageQuantityCart[i].innerHTML = `Hiện tại số lượng sản phẩm chỉ còn ${responsePD.productDetail.quantity}`
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

            quantity[i].innerHTML = qtity

            if (this.checkQtityAndActiveProduct(responsePD) == false) {
              messageQuantityCart[i].innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
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

            this.provisionalCart()
            this.handleCounter()
          } else {
            messageQuantityCart.innerHTML = 'Lỗi không xác định !'
            btnPlus[i].disabled = false
            btnMinus[i].disabled = false
          }
        })
      })
    })

    // Cập nhật lại size sản phẩm
    const btnUpdateCart = document.querySelectorAll(".btnUpdateCart")
    const messageQuantity: any = document.querySelector(".message-quantity")
    btnUpdateCart.forEach((e: any) => {
      const cloneElement: any = this.cloneElement(e)
      cloneElement.addEventListener("click", () => {
        const id = cloneElement.getAttribute("id")
        const detailId = cloneElement.getAttribute("detailId")

        const productCart: any = cloneElement.parentNode.parentNode.parentNode
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
                const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
                btnDeleteCart.forEach((e: any) => {
                  if (e.getAttribute("id") == responsePD.productDetail.id) {
                    e.click()
                  }
                })

                // load lại size mới nếu size đó hết hàng
                this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
                  response.product.productDetail = responseD
                  this.showAddCart(response)
                })
              } else {
                this.productService.findAllByProduct(response.product.id).subscribe((responseD: any) => {
                  response.product.productDetail = responseD

                  this.showUpdateCart(response, detailId, productCart)
                  cloneElement.disabled = false
                })
              }
            })
          }
        })
      })
    })
  }

  private showUpdateCart(response: any, productDetailId: number, productInCart: any) {
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
            const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
            btnDeleteCart.forEach((e: any) => {
              if (e.getAttribute("id") == responsePD.productDetail.id) {
                e.click()
              }
            })

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
            const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
            btnDeleteCart.forEach((e: any) => {
              if (e.getAttribute("id") == responsePD.productDetail.id) {
                e.click()
              }
            })

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
            const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
            btnDeleteCart.forEach((e: any) => {
              if (e.getAttribute("id") == responsePD.productDetail.id) {
                e.click()
              }
            })

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

            const ctnProductCarts: any = document.querySelector(".ctnProductCarts")
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
              ctnProductCarts.insertAdjacentHTML('afterbegin', this.addProductCart(response, qtity));
            } else {
              arrCart.unshift({
                id: responsePD.productDetail.id,
                productId: responsePD.productDetail.product.id,
                quantity: Number(quantity.innerHTML)
              })
              ctnProductCarts.insertAdjacentHTML('afterbegin', this.addProductCart(response, Number(quantity.innerHTML)));
            }

            // nếu cập nhật sản phẩm loại khác ko giống ban đầu thì xóa ban đầu đi
            if (productDetailId != responsePD.productDetail.id) {
              var index = arrCart.findIndex(e => e.id == productDetailId)
              productInCart.remove()
              if (arrCart.length <= 1) {
                arrCart = []
              } else {
                arrCart.splice(index, 1)
              }
            }
            localStorage.setItem("carts", JSON.stringify(arrCart));

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
          const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
          btnDeleteCart.forEach((e: any) => {
            if (e.getAttribute("id") == responsePD.productDetail.id) {
              e.click()
            }
          })

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

  private checkQtityAndActiveProduct(responsePD: any) {
    var check = true

    if (responsePD.productDetail.quantity == 0 || responsePD.productDetail.active == false
      || responsePD.productDetail.product.active == false || responsePD.productDetail.product.categoryDetail.active == false
      || responsePD.productDetail.product.categoryDetail.category.active == false) {

      check = false
    }

    return check;
  }

  public handleCounter() {
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

  public loadingImage() {
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
  }

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }
}
