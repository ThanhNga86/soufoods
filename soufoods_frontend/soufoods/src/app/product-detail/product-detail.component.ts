import { ReviewService } from './../services/review/review.service';
import { CartService } from './../services/shopping-cart/cart.service';
import { FavoriteService } from './../services/favorite/favorite.service';
import { UserAuthService } from './../services/auth/user-auth.service';
import { ImagesService } from './../services/image/images.service';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './../services/product/product.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private id: any
  private countReview: number = 0
  product: any
  productImageConfig: any = {}
  productSimilaire: any[] = []
  productSimilaireConfig: any = {}
  rate: number = 0
  total: any
  totalPage: number[] = []
  rates: number[] = []
  pageNumber: number = 1
  reviews: any[] = []
  arrImages: any[] = []
  message: any = {}

  constructor(private cartService: CartService, private productService: ProductService, private userAuthService: UserAuthService, private reviewService: ReviewService, private favoriteService: FavoriteService, private imagesService: ImagesService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.id = params['id'];

      this.findByProduct()

      this.findAllBySimilar()

      this.findAllByReview()
    })
  }

  private findByProduct() {
    this.productService.findById(this.id).subscribe((response: any) => {
      if (response.status == '200') {
        this.handleProductDetailByProduct(response.product)

        this.imagesService.findAllByProduct(response.product.id).subscribe((responseImages: any) => {
          response.product.images = responseImages
          this.product = response.product

          this.loadingImage()

          this.configSlides()

          this.handleSeeInfoAndReview()

          this.checkInput()
          this.handleReview()

          setTimeout(() => {
            this.showAndHiddenImages()
            this.reloadStyle()
          }, 300);
        })
      } else {
        Swal.fire("", "Lỗi không xác định !", "error")
      }
    })
  }

  private findAllBySimilar() {
    this.productService.findAllBysimilaire(this.id).subscribe((response: any) => {
      for (let i = 0; i < response.length; i++) {
        this.handleProductDetail(response[i])

        if (i == response.length - 1) {
          this.productSimilaire = response

          this.loadingImage()

          this.handleSeeProduct()
        }
      }
    })
  }

  private findAllByReview() {
    this.reviewService.findAll(this.pageNumber, this.id).subscribe((response: any) => {
      for (let i = 0; i < response.reviews.length; i++) {
        this.imagesService.findAllByReview(response.reviews[i].id).subscribe((responseImages: any) => {
          response.reviews[i].images = responseImages
          this.reviews.push(response.reviews[i])

          if (i == response.reviews.length - 1) {
            this.loadingImage()

            const btnPage: any = document.querySelector(".btnPage")
            if (btnPage) {
              btnPage.disabled = false
              btnPage.innerHTML = 'Xem thêm đánh giá <i class="fa-solid fa-angle-down"></i>'
            }

            setTimeout(() => {
              this.showAndHiddenImages()
            }, 300);
          }
        })
      }

      this.rate = response.rate - 1
      this.rates = response.rates
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);
    })
  }

  private handleReview() {
    setTimeout(() => {
      // đánh giá bằng sao
      const reviewStar: any = document.querySelectorAll(".review-star")
      var index: number = -1;

      reviewStar.forEach((e: any, i: number) => {
        const cloneElement: any = this.cloneElement(e)
        cloneElement.addEventListener("click", () => {
          const reviewStar: any = document.querySelectorAll(".review-star")
          this.message.rate = ''
          for (let j = 0; j <= i; j++) {
            reviewStar[j].classList.replace("fa-regular", "fa-solid")
          }

          for (let j = i + 1; j < reviewStar.length; j++) {
            reviewStar[j].classList.replace("fa-solid", "fa-regular")
          }

          index = i
        })

        cloneElement.addEventListener("mouseover", () => {
          const reviewStar: any = document.querySelectorAll(".review-star")
          for (let j = 0; j <= i; j++) {
            reviewStar[j].classList.replace("fa-regular", "fa-solid")
          }

          for (let j = i + 1; j < reviewStar.length; j++) {
            reviewStar[j].classList.replace("fa-solid", "fa-regular")
          }
        })

        cloneElement.addEventListener("mouseout", () => {
          const reviewStar: any = document.querySelectorAll(".review-star")
          if (index != -1) {
            for (let j = 0; j <= index; j++) {
              reviewStar[j].classList.replace("fa-regular", "fa-solid")
            }

            for (let j = index + 1; j < reviewStar.length; j++) {
              reviewStar[j].classList.replace("fa-solid", "fa-regular")
            }
          } else {
            for (let j = 0; j < reviewStar.length; j++) {
              reviewStar[j].classList.replace("fa-solid", "fa-regular")
            }
          }
        })
      })

      // upload nhiều hình ảnh
      this.handlerUploadImages()

      // Gửi nhận xét
      const btnSendReview: any = document.querySelector(".btnSendReview")
      const ctnImages: any = document.querySelector(".ctnImages")
      const cloneBtnSendReview: any = this.cloneElement(btnSendReview)

      cloneBtnSendReview.addEventListener("click", () => {
        const reviewStar: any = document.querySelectorAll(".review-star")
        const inpContent: any = document.querySelector(".inpContent")
        const inpName: any = document.querySelector(".inpName")
        const formData = new FormData()
        cloneBtnSendReview.disabled = true
        cloneBtnSendReview.innerHTML = `<span class="loader2"></span> Gửi nhận xét`

        if (this.countReview < 30) {
          var rate = 0
          for (let i = reviewStar.length - 1; i >= 0; i--) {
            if (reviewStar[i].classList.contains("fa-solid")) {
              rate = reviewStar[i].getAttribute("value")
              break;
            }
          }
          formData.append("rate", rate + "")

          formData.append("content", inpContent.value.replaceAll(/\n/g, "<br>").trim())
          formData.append("name", inpName.value.trim())
          formData.append("product", this.id)

          if (this.userAuthService.authenticated()) {
            const credentials = this.userAuthService.getCredentials()
            formData.append("user", credentials.id)
          }

          for (let i = 0; i < this.arrImages.length; i++) {
            formData.append("fileImages", this.arrImages[i].files)
          }

          this.reviewService.review(formData).subscribe((response: any) => {
            if (response.status == '200') {
              this.countReview += 1
              console.log(this.countReview);

              this.loadReview()
              inpContent.value = ''
              inpContent.value = ''
              ctnImages.innerHTML = ''
              this.arrImages = []
              this.message = {}
            } else {
              this.message = response
            }
            cloneBtnSendReview.disabled = false
            cloneBtnSendReview.innerHTML = `Gửi nhận xét`
          })
        } else {
          cloneBtnSendReview.innerHTML = `Lỗi spam`
        }
      })
    }, 300);
  }

  private loadReview() {
    this.reviewService.findAll(1, this.id).subscribe((response: any) => {
      this.imagesService.findAllByReview(response.reviews[0].id).subscribe((responseImages: any) => {
        response.reviews[0].images = responseImages

        this.reviews.unshift(response.reviews[0])
        this.loadingImage()

        setTimeout(() => {
          this.showAndHiddenImages()
        }, 300);
      })

      this.handleSeeInfoAndReview()
      this.checkInput()

      this.rate = response.rate - 1
      this.rates = response.rates
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);
    })
  }

  private checkInput() {
    setTimeout(() => {
      const inpForm = document.querySelectorAll(".inpForm")
      const inpImage = document.querySelectorAll(".inpImage")

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

      inpImage.forEach((event: any) => {
        event.addEventListener("change", () => {
          if (event.value != '') {
            const name = event.getAttribute("name")
            for (const key in this.message) {
              if (key == name) {
                this.message[key] = ''
              }
            }
          }
        })
      })
    }, 300);
  }

  public arrRate(length: number) {
    return Array.from({ length }, (_, i) => i);
  }

  public checkNumber(number: number) {
    return Number.isInteger(number)
  }

  private handlerUploadImages() {
    const fileImages: HTMLElement | any = document.querySelector(".fileImages")
    const uploadImages: HTMLElement | any = document.querySelector(".uploadImages")
    const ctnImages: HTMLElement | any = document.querySelector(".ctnImages")
    const checkImage = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    const maxSize = 10 * 1024 * 1024; // 10 MB
    var flagFile = true

    uploadImages.addEventListener("click", () => {
      if (fileImages) fileImages.click()
    })

    fileImages.addEventListener("change", () => {
      if (fileImages.files && fileImages.files[0]) {
        var total = this.arrImages.length + fileImages.files.length
        if (total <= 10) {
          for (let i = 0; i < fileImages.files.length; i++) {
            if (fileImages.files[i].size <= maxSize && checkImage.test(fileImages.files[i].name)) {
              var showImage: HTMLElement | any = document.createElement("div");
              showImage.style = `position: relative; display: flex; justify-content: flex-end; width: 100px; height: 100px; padding: 3px;`
              var rdNumber = Math.floor(Math.random() * 100000)
              const rdId = String(new Date().getTime()).substring(8) + rdNumber
              showImage.setAttribute("id", rdId)
              showImage.innerHTML = `
                <button type="button" class="btn-close" aria-label="Close" style="width: 8px; height: 8px; background-color: white; position: absolute;"></button>
                <img width="100%">
              `
              ctnImages.appendChild(showImage);
              showImage.querySelector("img").src = URL.createObjectURL(fileImages.files[i]);
              this.arrImages.push({
                id: showImage.id,
                files: fileImages.files[i]
              })
            } else {
              this.message.images = 'Vui lòng chọn một hình ảnh có định dạng hợp lệ và kích thước không quá 10 MB'
            }
          }
        } else {
          this.message.images = 'Chỉ chứa tối đa 10 hình ảnh'
        }
      }

      const btnClose = document.querySelectorAll(".btn-close")
      btnClose.forEach((event) => {
        event.addEventListener("click", (e: any) => {
          var showImage = e.target.parentNode
          showImage.remove()
          for (let i = 0; i < this.arrImages.length; i++) {
            if (this.arrImages[i].id == showImage.id) {
              this.arrImages.splice(i, 1)
              break;
            }
          }
        })
      })
    })
  }

  public setPageNumber(pageNumber: number) {
    const btnPage: any = document.querySelector(".btnPage")
    btnPage.disabled = true
    btnPage.innerHTML = `<span class="loader2" style="border: 5px dotted deepskyblue; width: 40px; height: 40px;"></span>`
    this.pageNumber = pageNumber
    this.findAllByReview()
  }

  private handleSeeInfoAndReview() {
    setTimeout(() => {
      const seeDescribes: any = document.querySelector(".see-describes")
      const itemInfos: any = document.querySelectorAll(".item-info")
      const seeReview: any = document.querySelector(".see-review")
      const containerInfo: any = document.querySelector("#containerInfo")

      const cloneSeeDescribes: any = this.cloneElement(seeDescribes)
      cloneSeeDescribes.addEventListener("click", () => {
        const position = containerInfo.getBoundingClientRect()
        window.scrollTo({
          top: (position.top - 100),
          behavior: 'smooth' // hiệu ứng cuộn trơn tru hơn
        })
        itemInfos[0].click()
      })

      if (seeReview) {
        const cloneSeeReview: any = this.cloneElement(seeReview)
        cloneSeeReview.addEventListener("click", () => {
          const position = containerInfo.getBoundingClientRect()
          window.scrollTo({
            top: (position.top - 100),
            behavior: 'smooth' // hiệu ứng cuộn trơn tru hơn
          })
          itemInfos[1].click()
        })
      }
    }, 300);
  }

  private handleProductDetailByProduct(response: any) {
    this.findAllFavorite(response)

    this.productService.findAllByProduct(response.id).subscribe((responseD: any) => {
      response.productDetail = responseD
      // lấy size đầu tiên và điều kiện còn hàng
      for (let j = 0; j < responseD.length; j++) {
        if (responseD.length == 1) {
          response.productDetailId = responseD[j].id
          response.showDiscount = responseD[j].discount

          // Tính giá giảm và giá gốc
          if (responseD[j].discount == 0) {
            response.showPrice = responseD[j].price.toLocaleString("vi-VN")
            response.showPriceDel = null
          } else {
            response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
            response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
            response.saveMoney = Number(responseD[j].price - Number(responseD[j].price * (100 - responseD[j].discount) / 100)).toLocaleString("vi-VN")
          }

          response.outStock = (responseD[j].quantity != 0) ? true : false
        } else {
          if (responseD[j].quantity != 0) {
            response.productDetailId = responseD[j].id
            response.showDiscount = responseD[j].discount

            // Tính giá giảm và giá gốc
            if (responseD[j].discount == 0) {
              response.showPrice = responseD[j].price.toLocaleString("vi-VN")
              response.showPriceDel = null
            } else {
              response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
              response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
              response.saveMoney = Number(responseD[j].price - Number(responseD[j].price * (100 - responseD[j].discount) / 100)).toLocaleString("vi-VN")
            }

            response.showSize = responseD[j].size.replaceAll(response.name, '')
            response.outStock = true
            break;
          } else {
            response.showDiscount = responseD[j].discount

            // Tính giá giảm và giá gốc
            if (responseD[j].discount == 0) {
              response.showPrice = responseD[j].price.toLocaleString("vi-VN")
              response.showPriceDel = null
            } else {
              response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
              response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
              response.saveMoney = Number(responseD[j].price - Number(responseD[j].price * (100 - responseD[j].discount) / 100)).toLocaleString("vi-VN")
            }

            response.showSize = responseD[0].size.replaceAll(response.name, '')
            response.outStock = false
          }
        }
      }

      // load lại size mới nếu size đó hết hàng
      const ctnInfo: any = document.querySelector(".ctnInfo")
      if (ctnInfo) {
        const btnMinus = ctnInfo.querySelector(".btnMinus")
        const quantity = ctnInfo.querySelector(".quantity")
        const btnPlus = ctnInfo.querySelector(".btnPlus")
        const btnAddCartP = ctnInfo.querySelector(".btnAddCartP")

        if (btnMinus) {
          btnMinus.disabled = true
          btnPlus.disabled = false
          btnMinus.setAttribute("id", response.productDetailId)
          btnPlus.setAttribute("id", response.productDetailId)
          btnAddCartP.setAttribute("id", response.productDetailId)
          quantity.innerHTML = 1

          this.product.productDetailId = response.productDetailId
          this.product.saveMoney = response.saveMoney
          this.product.showDiscount = response.showDiscount
          this.product.showPrice = response.showPrice
          this.product.showPriceDel = response.showPriceDel
          this.product.showSize = response.showSize
          this.product.productDetail = response.productDetail
          this.product.active = response.active
          this.product.outStock = response.outStock
        }
      }

      this.handleAddCart(response)
    })
  }

  private handleProductDetail(response: any) {
    this.findAllFavorite(response)

    this.productService.findAllByProduct(response.id).subscribe((responseD: any) => {
      response.productDetail = responseD
      // lấy size đầu tiên và điều kiện còn hàng
      for (let j = 0; j < responseD.length; j++) {
        if (responseD.length == 1) {
          response.productDetailId = responseD[j].id
          response.showDiscount = responseD[j].discount

          // Tính giá giảm và giá gốc
          if (responseD[j].discount == 0) {
            response.showPrice = responseD[j].price.toLocaleString("vi-VN")
            response.showPriceDel = null
          } else {
            response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
            response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
            response.saveMoney = Number(responseD[j].price - Number(responseD[j].price * (100 - responseD[j].discount) / 100)).toLocaleString("vi-VN")
          }

          response.outStock = (responseD[j].quantity != 0) ? true : false
        } else {
          if (responseD[j].quantity != 0) {
            response.productDetailId = responseD[j].id
            response.showDiscount = responseD[j].discount

            // Tính giá giảm và giá gốc
            if (responseD[j].discount == 0) {
              response.showPrice = responseD[j].price.toLocaleString("vi-VN")
              response.showPriceDel = null
            } else {
              response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
              response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
              response.saveMoney = Number(responseD[j].price - Number(responseD[j].price * (100 - responseD[j].discount) / 100)).toLocaleString("vi-VN")
            }

            response.showSize = responseD[j].size.replaceAll(response.name, '')
            response.outStock = true
            break;
          } else {
            response.showDiscount = responseD[j].discount

            // Tính giá giảm và giá gốc
            if (responseD[j].discount == 0) {
              response.showPrice = responseD[j].price.toLocaleString("vi-VN")
              response.showPriceDel = null
            } else {
              response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
              response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
              response.saveMoney = Number(responseD[j].price - Number(responseD[j].price * (100 - responseD[j].discount) / 100)).toLocaleString("vi-VN")
            }

            response.showSize = responseD[0].size.replaceAll(response.name, '')
            response.outStock = false
          }
        }
      }

      this.cartService.handleAddCart()
    })
  }

  private handleAddCart(response: any) {
    setTimeout(() => {
      const ctnInfo: any = document.querySelector(".ctnInfo")
      const btnMinus: any = ctnInfo.querySelector(".btnMinus")
      const quantity: any = ctnInfo.querySelector(".quantity")
      const btnPlus: any = ctnInfo.querySelector(".btnPlus")
      const btnAddCartP: any = ctnInfo.querySelector(".btnAddCartP")
      const messageQuantity: any = ctnInfo.querySelector(".message-quantity")
      var loadTimeout: any = null

      // giảm số lượng sản phẩm
      const cloneBtnMinus: any = this.cloneElement(btnMinus)
      if (btnMinus) {
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
                if (loadTimeout != null) {
                  clearTimeout(loadTimeout)
                }

                messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
                loadTimeout = setTimeout(() => {
                  messageQuantity.innerHTML = ''
                }, 6000);

                // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
                const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
                btnDeleteCart.forEach((e: any) => {
                  if (e.getAttribute("id") == responsePD.productDetail.id) {
                    e.click()
                  }
                })

                // load lại size mới nếu size đó hết hàng
                this.handleProductDetailByProduct(responsePD.productDetail.product)
              }
            } else {
              messageQuantity.innerHTML = 'Lỗi không xác định !'
              cloneBtnPlus.disabled = false
              cloneBtnMinus.disabled = false
            }
          })
        })
      }

      // tăng số lượng sản phẩm
      const cloneBtnPlus: any = this.cloneElement(btnPlus)
      if (cloneBtnPlus) {
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
                if (loadTimeout != null) {
                  clearTimeout(loadTimeout)
                }

                messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
                loadTimeout = setTimeout(() => {
                  messageQuantity.innerHTML = ''
                }, 6000);

                // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
                const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
                btnDeleteCart.forEach((e: any) => {
                  if (e.getAttribute("id") == responsePD.productDetail.id) {
                    e.click()
                  }
                })

                // load lại size mới nếu size đó hết hàng
                this.handleProductDetailByProduct(responsePD.productDetail.product)
              }
            } else {
              messageQuantity.innerHTML = 'Lỗi không xác định !'
              cloneBtnPlus.disabled = false
              cloneBtnMinus.disabled = false
            }
          })
        })
      }

      // thêm vào giỏ hàng
      const clonebtnAddCartP: any = this.cloneElement(btnAddCartP)
      if (clonebtnAddCartP) {
        clonebtnAddCartP.addEventListener("click", () => {
          const id: any = clonebtnAddCartP.getAttribute("id")
          var check: boolean = true
          messageQuantity.innerHTML = ''
          clonebtnAddCartP.innerHTML = `<span class="loader2"></span> THÊM VÀO GIỎ`
          clonebtnAddCartP.disabled = true

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
              const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
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
                if (loadTimeout != null) {
                  clearTimeout(loadTimeout)
                }

                messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
                loadTimeout = setTimeout(() => {
                  messageQuantity.innerHTML = ''
                }, 6000);

                // Nếu sản phẩm có trong giỏ hàng trước đó thì xóa đi
                const btnDeleteCart: any = document.querySelectorAll(".btnDeleteCart")
                btnDeleteCart.forEach((e: any) => {
                  if (e.getAttribute("id") == responsePD.productDetail.id) {
                    e.click()
                  }
                })

                // load lại size mới nếu size đó hết hàng
                this.handleProductDetailByProduct(responsePD.productDetail.product)
                check = false
              }

              // Kiểm tra thành công thì thêm vào giỏ hàng
              if (check) {
                this.productService.findById(responsePD.productDetail.product.id).subscribe((response: any) => {
                  const actionCart: any = document.querySelector(".action-cart")

                  actionCart.click()
                  const ctnProductCarts: any = document.querySelector(".ctnProductCarts")
                  const notCart: any = document.querySelector(".not-cart")
                  if (notCart) { notCart.style.display = 'none' }

                  response.product.productDetail = responsePD.productDetail

                  if (checkCart) {
                    const qtity = Number(quantity.innerHTML) + checkCart.quantity
                    arrCart[indexCart] = {
                      id: responsePD.productDetail.id,
                      productId: responsePD.productDetail.product.id,
                      quantity: qtity
                    }

                    ctnProductCarts.insertAdjacentHTML('afterbegin', this.cartService.addProductCart(response, qtity));
                  } else {
                    arrCart.push({
                      id: responsePD.productDetail.id,
                      productId: responsePD.productDetail.product.id,
                      quantity: Number(quantity.innerHTML)
                    })

                    ctnProductCarts.insertAdjacentHTML('afterbegin', this.cartService.addProductCart(response, Number(quantity.innerHTML)));
                  }
                  localStorage.setItem("carts", JSON.stringify(arrCart));

                  this.loadingImage()
                  this.cartService.provisionalCart()
                  this.cartService.handleDeleteCart()
                  this.cartService.handleUpdateCart()
                  this.handleCounter()
                })
              }
            } else {
              messageQuantity.innerHTML = 'Lỗi không xác định !'
            }

            clonebtnAddCartP.innerHTML = `THÊM VÀO GIỎ`
            clonebtnAddCartP.disabled = false
          })
        })
      }

      // Chọn size sản phẩm
      const getSize = (responseD: any) => {
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
            messageQuantity.innerHTML = `Hiện tại loại ${responsePD.productDetail.size} vừa hết hàng`
            this.handleProductDetailByProduct(responsePD.productDetail.product)
          } else {
            const ctnInfo: any = document.querySelector(".ctnInfo")
            if (ctnInfo) {
              const btnMinus = ctnInfo.querySelector(".btnMinus")
              const quantity = ctnInfo.querySelector(".quantity")
              const btnPlus = ctnInfo.querySelector(".btnPlus")
              const btnAddCartP = ctnInfo.querySelector(".btnAddCartP")

              btnMinus.disabled = true
              btnPlus.disabled = false
              btnMinus.setAttribute("id", responseD.id)
              btnPlus.setAttribute("id", responseD.id)
              btnAddCartP.setAttribute("id", responseD.id)
              quantity.innerHTML = 1

              this.product.productDetailId = responseD.id
              this.product.saveMoney = Number(responseD.price - Number(responseD.price * (100 - responseD.discount) / 100)).toLocaleString("vi-VN")
              this.product.showDiscount = responseD.discount
              this.product.showPrice = Number(responseD.price * (100 - responseD.discount) / 100).toLocaleString("vi-VN")
              this.product.showPriceDel = (responseD.discount != 0) ? responseD.price.toLocaleString("vi-VN") : null
              this.product.showSize = responseD.size
              this.product.outStock = (responseD.quantity != 0) ? true : false

              this.handleAddCart(response)
            }
          }
        })
      }

      const size: any = ctnInfo.querySelectorAll(".size")
      size.forEach((e: any) => {
        e.addEventListener("click", () => {
          const id: any = e.getAttribute("id")
          messageQuantity.innerHTML = ''

          this.productService.findAllByProduct(response.id).subscribe((responseD: any) => {
            this.product.productDetail = responseD
            for (let i = 0; i < responseD.length; i++) {
              if (responseD[i].id == id) {
                getSize(responseD[i])
                break;
              }
            }
          })
        })
      })
    }, 300);
  }

  private showAndHiddenImages() {
    const viewDetailImage = document.querySelectorAll(".viewDetailImage")

    for (let i = 0; i < viewDetailImage.length; i++) {
      viewDetailImage[i].addEventListener("click", () => {
        showHiddenImage("show", i)
      })
    }

    const closeImages = document.querySelectorAll(".hidden-detailImage")
    for (let i = 0; i < closeImages.length; i++) {
      closeImages[i].addEventListener("click", () => {
        showHiddenImage("hidden", i)
      })
    }

    const showImages = document.querySelectorAll(".show-images")
    for (let i = 0; i < showImages.length; i++) {
      showImages[i].addEventListener("click", (e: any) => {
        if (e.target.classList.contains('row')) {
          showHiddenImage("hidden", i)
        }
      })
    }

    const showDetailImages = document.querySelectorAll(".show-detailImage")
    for (let i = 0; i < showDetailImages.length; i++) {
      showDetailImages[i].addEventListener("click", () => {
        showHiddenImage("hidden", i)
      })
    }

    function showHiddenImage(action: any, i: number) {
      const showDetailImage: any = document.querySelectorAll(".show-detailImage")
      const showImage: any = document.querySelectorAll(".show-images")

      if (action == 'show') {
        showDetailImage[i].style.display = 'block'
        showImage[i].style.display = 'block'
        document.body.style.overflow = 'hidden'
      } else {
        showDetailImage[i].style.display = 'none'
        showImage[i].style.display = 'none'
        document.body.style.overflow = 'auto'
      }
    }
  }

  private findAllFavorite(response: any) {
    // lấy yêu thích sản phẩm
    if (this.userAuthService.authenticated()) {
      this.favoriteService.findAllByToken(this.userAuthService.getToken()).subscribe((responseD: any) => {

        const arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []
        response.favorite = false

        // yêu thích
        for (let i = 0; i < responseD.length; i++) {
          if (responseD[i].product.id == response.id) {
            response.favorite = true
            const checkFavorite = arrFavorite.find(item => item.id === response.id);

            if (!checkFavorite) {
              arrFavorite.push({ id: response.id });
            }
            localStorage.setItem("favorites", JSON.stringify(arrFavorite));
          }
        }

        this.handleFavorite()
      })
    } else {
      const arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []
      response.favorite = false
      // yêu thích
      arrFavorite.forEach((e: any) => {
        const productId = e.id
        if (productId == response.id) {
          response.favorite = true
        }
      })

      this.handleFavorite()
    }
  }

  private handleFavorite() {
    setTimeout(() => {
      const btnFavorite = document.querySelectorAll(".btnFavorite")

      btnFavorite.forEach((e: any) => {
        const cloneElement: any = this.cloneElement(e)
        cloneElement.addEventListener("click", () => {
          const productId: number = cloneElement.getAttribute("id")

          if (this.userAuthService.authenticated()) {
            cloneElement.disabled = true
            const favorite = {
              token: this.userAuthService.getToken(),
              productId: productId
            }

            this.favoriteService.likeAndUnlike(favorite).subscribe((response: any) => {
              if (response.status == '200') {
                const favorite = cloneElement.querySelector(".favorite");
                (response.favorite == 'true') ? favorite.classList.replace('fa-regular', 'fa-solid') : favorite.classList.replace('fa-solid', 'fa-regular')
              } else {
                if (response.error) {
                  Swal.fire("", response.error, "error")
                }
              }

              cloneElement.disabled = false
              this.handleCounter()
            })
          }

          // Lưu dưới dạng trình duyệt
          var arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []
          var favorite = cloneElement.querySelector(".favorite")

          if (arrFavorite.length == 0) {
            arrFavorite.push({ id: productId, favorite: true })
            favorite.classList.replace('fa-regular', 'fa-solid')
            localStorage.setItem("favorites", JSON.stringify(arrFavorite));
          } else {
            const checkFavorite = arrFavorite.find(e => e.id == productId)
            const indexFavorite = arrFavorite.indexOf(favorite)

            if (checkFavorite) {
              if (arrFavorite.length <= 1) {
                arrFavorite = []
              } else {
                arrFavorite.splice(indexFavorite, 1)
              }
              favorite.classList.replace('fa-solid', 'fa-regular')
            } else {
              arrFavorite.push({ id: productId, favorite: true })
              favorite.classList.replace('fa-regular', 'fa-solid')
            }
            localStorage.setItem("favorites", JSON.stringify(arrFavorite));
          }
          this.handleCounter()
        })
      })
    }, 300);
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

  private handleSeeProduct() {
    setTimeout(() => {
      const btnSeeProduct = document.querySelectorAll(".btnSeeProduct")

      btnSeeProduct.forEach((e: any) => {
        const cloneElement: any = this.cloneElement(e)
        cloneElement.addEventListener("click", () => {
          const productD = cloneElement.parentNode.parentNode.parentNode
          const a = productD.querySelector("a")
          a.click()
        })
      })
    }, 300);
  }

  private handleCounter() {
    // Đếm số lượt sản phẩm yêu thích
    const countFavorite = document.querySelectorAll(".count-favorite")
    var countF = 0
    if (this.userAuthService.authenticated()) {
      this.favoriteService.findAllByToken(this.userAuthService.getToken()).subscribe((response: any) => {
        countFavorite.forEach((e) => {
          e.innerHTML = response.length
        })
      })
    } else {
      var arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []
      countF = arrFavorite.length

      countFavorite.forEach((e: any) => {
        e.innerHTML = countF
      })
    }

    // Đếm số lượt sản phẩm giỏ hàng
    const countCart = document.querySelectorAll(".count-cart")
    var countC = 0
    const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
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

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }

  private configSlides() {
    this.productImageConfig = {
      arrows: true
    }

    this.productSimilaireConfig = {
      arrows: true,
      slidesToShow: 6,
      slidesToScroll: 6,
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 5,
          }
        },
        {
          breakpoint: 1000,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4,
          }
        },
        {
          breakpoint: 800,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ]
    }
  }

  private reloadStyle() {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
      /*Slides*/
      .slides .slick-dotted.slick-slider {
        margin-bottom: 0;
      }

      .slides .slick-prev {
        margin-left: 28px;
        z-index: 100;
      }

      .slides .slick-next {
        margin-right: 34px;
        z-index: 100;
      }

      .slides .slick-prev:before,
      .slides .slick-next:before {
        font-size: 25px;
      }

      .slides .slick-dots {
        bottom: 0;
      }

      .slides .slick-dots li.slick-active button:before {
        color: white;
      }

      .slides .slick-dots li button:before {
        color: white;
        font-size: 10px;
      }

      /*Slides category*/
      .category .slick-dotted.slick-slider {
        margin-bottom: 0;
      }

      .category .slick-prev {
        margin-left: 28px;
        z-index: 100;
      }

      .category .slick-next {
        margin-right: 36px;
        z-index: 100;
      }

      .category .slick-prev:before,
      .category .slick-next:before {
        font-size: 28px;
        color: skyblue;
      }

      .category .slick-dots li.slick-active button:before {
        color: orange;
      }

      .category .slick-dots li button:before {
        margin-top: 5px;
        color: orange;
        font-size: 12px;
      }

      /*Slides product*/
      .product .slick-dotted.slick-slider {
        margin-bottom: 0;
      }

      .product .slick-prev {
        margin-left: 30px;
        z-index: 100;
      }

      .product .slick-next {
        margin-right: 38px;
        z-index: 100;
      }

      .product .slick-prev:before,
      .product .slick-next:before {
        font-size: 28px;
        color: skyblue;
      }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);
  }

}
