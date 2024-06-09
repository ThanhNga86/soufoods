import { CartService } from './../services/shopping-cart/cart.service';
import { ProductService } from './../services/product/product.service';
import { FavoriteService } from './../services/favorite/favorite.service';
import { UserAuthService } from './../services/auth/user-auth.service';
import { HomeService } from './../services/home/home.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  slides: any[] = []
  slideConfig: any = {}
  categoryDetails: any[] = []
  categoryConfig: any = {}
  promotionProducts: any[] = []
  promotionProductConfig: any = {}
  meatAndSeafoods: any[] = []
  fruitsVegetables: any[] = []
  sellingProducts: any[] = []
  favoriteSize: number = 0
  cartSize: number = 0

  constructor(private homeService: HomeService, private productService: ProductService, private userAuthService: UserAuthService, private favoriteService: FavoriteService, private cartService: CartService) { }

  ngOnInit(): void {
    this.configSlides()

    this.findAllCategoryDetail()

    this.findAllPromotionProduct()

    this.findAllMeatAndSeafoods()

    this.findAllSellingProducts()

    setTimeout(() => {
      this.reloadStyle()
    }, 300);
  }

  private findAllCategoryDetail() {
    this.homeService.findAllCategoryDetail().subscribe((response: any) => {
      this.categoryDetails = response

      const categoryImg = document.querySelectorAll(".category-img")
      categoryImg.forEach((e: any) => {
        e.addEventListener("load", () => {
          e.setAttribute("src", `assets/images/logo-soufoods.png`)
        })
      })

      this.loadingImage()

      this.handleSeeProduct()

    })
  }

  private findAllPromotionProduct() {
    this.homeService.findAllPromotionProduct().subscribe((response: any) => {
      for (let i = 0; i < response.length; i++) {
        this.handleProductDetail(response[i])

        if (i == response.length - 1) {
          this.promotionProducts = response
          this.loadingImage()

          this.handleSeeProduct()

        }
      }
    })
  }

  private findAllMeatAndSeafoods() {
    // Bánh kẹo - Đồ uống
    this.homeService.findAllProductByCategory("Bánh kẹo - Đồ uống").subscribe((response: any) => {
      for (let i = 0; i < response.length; i++) {
        this.handleProductDetail(response[i])

        if (i == response.length - 1) {
          this.meatAndSeafoods = response
          this.loadingImage()
          this.handleSeeProduct()
        }
      }
    })

    // Trái cây - Rau củ
    this.homeService.findAllProductByCategory("Trái cây - Rau củ").subscribe((response: any) => {
      for (let i = 0; i < response.length; i++) {
        this.handleProductDetail(response[i])

        if (i == response.length - 1) {
          this.fruitsVegetables = response
          this.loadingImage()
          this.handleSeeProduct()
        }
      }
    })
  }

  private findAllSellingProducts() {
    this.homeService.findAllSellingProducts().subscribe((response: any) => {
      for (let i = 0; i < response.length; i++) {
        this.handleProductDetail(response[i])

        if (i == response.length - 1) {
          this.sellingProducts = response
          this.loadingImage()

          this.handleSeeProduct()

        }
      }
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
            const checkFavorite = arrFavorite.find(item => item.id == response.id);

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
                const favorites = document.querySelectorAll(".favorite")
                favorites.forEach((e: any) => {
                  const id = e.getAttribute("id")
                  if (productId == id) {
                    (response.favorite == 'true') ? e.classList.replace('fa-regular', 'fa-solid') : e.classList.replace('fa-solid', 'fa-regular')
                  }
                })
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
          const favorites = document.querySelectorAll(".favorite")
          var arrFavorite: any[] = JSON.parse(localStorage.getItem("favorites") + "") || []
          var favorite = cloneElement.querySelector(".favorite")

          if (arrFavorite.length == 0) {
            arrFavorite.push({ id: productId, favorite: true })
            localStorage.setItem("favorites", JSON.stringify(arrFavorite));
            favorites.forEach((e: any) => {
              const id = e.getAttribute("id")
              if (productId == id) {
                e.classList.replace('fa-regular', 'fa-solid')
              }
            })
          } else {
            const checkFavorite = arrFavorite.find(e => e.id == productId)
            const indexFavorite = arrFavorite.indexOf(favorite)

            if (checkFavorite) {
              if (arrFavorite.length <= 1) {
                arrFavorite = []
              } else {
                arrFavorite.splice(indexFavorite, 1)
              }

              favorites.forEach((e: any) => {
                const id = e.getAttribute("id")
                if (productId == id) {
                  e.classList.replace('fa-solid', 'fa-regular')
                }
              })
            } else {
              arrFavorite.push({ id: productId, favorite: true })
              favorites.forEach((e: any) => {
                const id = e.getAttribute("id")
                if (productId == id) {
                  e.classList.replace('fa-regular', 'fa-solid')
                }
              })
            }
            localStorage.setItem("favorites", JSON.stringify(arrFavorite));
          }
          this.handleCounter()
        })
      })
    }, 300);
  }

  private handleProductDetail(response: any) {
    this.findAllFavorite(response)

    this.productService.findAllByProduct(response.id).subscribe((responseD: any) => {
      response.productDetail = responseD
      // lấy size đầu tiên và điều kiện còn hàng
      for (let j = 0; j < responseD.length; j++) {
        if (responseD.length == 1) {
          response.showDiscount = responseD[j].discount

          // Tính giá giảm và giá gốc
          if (responseD[j].discount == 0) {
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
            if (responseD[j].discount == 0) {
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
            if (responseD[j].discount == 0) {
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
    var arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
    arrCart.forEach((e: any) => {
      countC += e.quantity
    })

    countCart.forEach((e: any) => {
      e.innerHTML = countC
    })
  }

  private configSlides() {
    const carousel = document.querySelectorAll(".carousel")
    carousel.forEach((e: any) => {
      e.addEventListener("mousedown", () => {
        e.style.cursor = 'grabbing'
      })

      e.addEventListener("mouseup", () => {
        e.style.cursor = 'grab'
      })
    })

    this.slides = [
      { img: "assets/images/slide-thit-bo.png" },
      { img: "assets/images/slide-support.png" },
      { img: "assets/images/slide-gia-vi.png" },
      { img: "assets/images/slide-trai-cay.png" },
    ]

    this.slideConfig = {
      arrows: true,
      dots: true,
      autoplay: true,
      autoplaySpeed: 3000,
    }

    this.categoryConfig = {
      arrows: true,
      dots: true,
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

    this.promotionProductConfig = {
      arrows: true,
      autoplay: true,
      autoplaySpeed: 8000,
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
