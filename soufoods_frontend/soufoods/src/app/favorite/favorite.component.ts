import { CartService } from './../services/shopping-cart/cart.service';
import { ProductService } from './../services/product/product.service';
import { FavoriteService } from './../services/favorite/favorite.service';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {
  products: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1

  constructor(private userAuthService: UserAuthService, private favoriteService: FavoriteService, private productService: ProductService, private cartService: CartService) { }

  ngOnInit(): void {
    this.findAll()
  }

  private findAll() {
    if (this.userAuthService.authenticated()) {
      const ctnProducts: any = document.querySelector(".ctnProducts")
      const loadingData: any = document.querySelector(".loading-data")
      ctnProducts.style.display = "none"
      loadingData.style.display = "block"

      this.favoriteService.findAll(this.pageNumber, this.userAuthService.getToken()).subscribe((response: any) => {
        const arrProduct = []
        for (let i = 0; i < response.favorites.length; i++) {
          this.handleProductDetail(response.favorites[i].product)
          arrProduct.push(response.favorites[i].product)

          if (i == response.favorites.length - 1) {
            this.products = arrProduct

            this.loadingImage()

            this.handleSeeProduct()

            this.deleteFavorite()

            ctnProducts.style.display = "block"
            loadingData.style.display = "none"
          }
        }
        this.total = response.total

        if (this.total == 0) {
          ctnProducts.style.display = "block"
          loadingData.style.display = "none"
        }
        this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);
      })
    } else {
      var arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []
      arrFavorite.sort().reverse()

      arrFavorite.forEach((e: any) => {
        const id = e.id
        this.favoriteService.findByProduct(id).subscribe((response: any) => {
          if (response.status == '200') {
            this.handleProductDetail(response.product)
            this.products.push(response.product)
          } else {
            console.error(response.error)
          }
        })

        this.loadingImage()

        this.handleSeeProduct()

        this.deleteFavorite()

      })
    }
  }

  private handleProductDetail(response: any) {
    this.productService.findAllByProduct(response.id).subscribe((responseD: any) => {
      response.productDetail = responseD
      // lấy size đầu tiên và điều kiện còn hàng
      for (let j = 0; j < responseD.length; j++) {
        if (responseD.length == 1) {
          response.showDiscount = responseD[j].discount

          // Tính giá giảm và giá gốc
          if (response.showDiscount == 0) {
            response.showPrice = responseD[j].price.toLocaleString("vi-VN")
            response.showPriceDel = null
          } else {
            response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
            response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
          }

          response.outStock = (responseD[j].quantity != 0) ? true : false
        } else {
          if (responseD[j].quantity != 0) {
            response.showDiscount = responseD[j].discount
            // Tính giá giảm và giá gốc
            if (response.showDiscount == 0) {
              response.showPrice = responseD[j].price.toLocaleString("vi-VN")
              response.showPriceDel = null
            } else {
              response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
              response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
            }

            response.showSize = responseD[j].size.replaceAll(response.name, '')
            response.outStock = true
            break;
          } else {
            response.showDiscount = responseD[j].discount

            // Tính giá giảm và giá gốc
            if (response.showDiscount == 0) {
              response.showPrice = responseD[j].price.toLocaleString("vi-VN")
              response.showPriceDel = null
            } else {
              response.showPriceDel = responseD[j].price.toLocaleString("vi-VN")
              response.showPrice = Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")
            }

            response.showSize = responseD[0].size.replaceAll(response.name, '')
            response.outStock = false
          }
        }
      }

      this.cartService.handleAddCart()
    })
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

  private deleteFavorite() {
    setTimeout(() => {
      const btnDeleteFavorite = document.querySelectorAll(".btnDeleteFavorite")
      var arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []

      btnDeleteFavorite.forEach((e: any) => {
        const cloneElement: any = this.cloneElement(e)
        cloneElement.addEventListener("click", () => {
          const id: any = cloneElement.getAttribute("id")
          const product = cloneElement.parentNode.parentNode.parentNode
          const checkFavorite = arrFavorite.find(e => e.id == id)
          const indexFavorite = arrFavorite.indexOf(checkFavorite)

          if (this.userAuthService.authenticated()) {
            const favorite = {
              token: this.userAuthService.getToken(),
              productId: id
            }
            this.favoriteService.likeAndUnlike(favorite).subscribe((response: any) => {
              if (response.status == '200') {
                if (arrFavorite.length <= 1) {
                  arrFavorite = []
                } else {
                  arrFavorite.splice(indexFavorite, 1)
                }
                localStorage.setItem("favorites", JSON.stringify(arrFavorite));
                product.remove()
                this.handleCounter()
                const length = document.querySelectorAll(".delete-favorite").length
                if (length == 0) {
                  this.products = []
                }

                this.setPageNumber(this.pageNumber)
              }
            })
          } else {
            if (arrFavorite.length <= 1) {
              arrFavorite = []
            } else {
              arrFavorite.splice(indexFavorite, 1)
            }
            localStorage.setItem("favorites", JSON.stringify(arrFavorite));
            product.remove()
            this.handleCounter()

            const length = document.querySelectorAll(".delete-favorite").length

            if (length == 0) {
              this.products = []
            }
          }
        })
      })
    }, 300);
  }

  public setPageNumber(pageNumber: number) {
    const productD = document.querySelectorAll(".productD")
    if (productD.length <= 1 && this.pageNumber > 1) {
      this.pageNumber -= 1
    } else {
      this.pageNumber = pageNumber
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth' // hiệu ứng cuộn trơn tru hơn
    })

    this.findAll()
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
}
