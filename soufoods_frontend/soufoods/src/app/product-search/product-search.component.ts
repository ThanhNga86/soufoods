import { UserAuthService } from './../services/auth/user-auth.service';
import { FavoriteService } from './../services/favorite/favorite.service';
import { CartService } from './../services/shopping-cart/cart.service';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from './../services/product/product.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit {
  products: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  filterMaxPrice: number = 0
  filters: any = {
    flag: false,
    pageNumber: 1,
    search: null,
    quantity: null,
    discount: null,
    minPrice: 0,
    maxPrice: 0
  }

  constructor(private productService: ProductService, private cartService: CartService, private favoriteService: FavoriteService, private userAuthService: UserAuthService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.filters.search = params['query'];
    });

    this.handleFilter()
  }

  private findAllProduct() {
    const ctnProducts: any = document.querySelector(".ctnProducts")
    const loadingProduct: any = document.querySelector(".loading-product")
    ctnProducts.style.display = "none"
    loadingProduct.style.display = "block"

    this.productService.filterProductBySearch(this.filters).subscribe((response: any) => {
      for (let i = 0; i < response.products.length; i++) {
        this.handleProductDetail(response.products[i])

        if (i == response.products.length - 1) {
          this.products = response.products

          this.loadingImage()

          this.handleSeeProduct()
        }
      }
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      if (this.total == 0) {
        this.products = response.products
      }
      ctnProducts.style.display = "block"
      loadingProduct.style.display = "none"
    })
  }

  private handleFilter() {
    const inputFilter: any = document.querySelectorAll(".input-filter")
    const activeQuantity: any = document.querySelectorAll(".active-quantity")
    const activeDiscount: any = document.querySelectorAll(".active-discount")

    activeQuantity.forEach((e: any, i: number) => {
      e.addEventListener("change", () => {
        for (let j = 0; j < activeQuantity.length; j++) {
          if (i != j) {
            activeQuantity[j].disabled = false
            activeQuantity[j].checked = false
          }
        }
      })
    })

    activeDiscount.forEach((e: any, i: number) => {
      e.addEventListener("change", () => {
        for (let j = 0; j < activeDiscount.length; j++) {
          if (i != j) {
            activeDiscount[j].disabled = false
            activeDiscount[j].checked = false
          }
        }
      })
    })

    for (let i = 0; i < inputFilter.length; i++) {
      inputFilter[i].addEventListener("change", () => {
        const keyFilter = inputFilter[i].getAttribute("key")
        const valueChecked = inputFilter[i].getAttribute("value-checked")
        const valueUnChecked = inputFilter[i].getAttribute("value-unchecked")
        for (const key in this.filters) {
          if (key == keyFilter) {
            if (inputFilter[i].checked) {
              this.filters[key] = valueChecked
            } else {
              this.filters[key] = valueUnChecked
            }
          }
        }
      })
    }

    this.productService.maxPrice(this.filters.search).subscribe((response: any) => {
      this.filterMaxPrice = response.maxPrice
      this.filters.maxPrice = response.maxPrice

      const rangevalue: any = document.querySelector(".slider-container .price-slider");
      const rangeInputvalue: any = document.querySelectorAll(".range-input input");
      const minInputRange: any = document.querySelector(".min-input-range");
      const maxInputRange: any = document.querySelector(".max-input-range");
      var priceGap = 0;

      // Thêm trình xử lý sự kiện vào các phần tử đầu vào giá
      const priceInputvalue: any = document.querySelectorAll(".price-input input");
      for (let i = 0; i < priceInputvalue.length; i++) {
        // Thêm trình xử lý sự kiện vào các phần tử đầu vào trong phạm vi
        for (let i = 0; i < rangeInputvalue.length; i++) {
          rangeInputvalue[i].addEventListener("input", (e: any) => {
            var minVal = parseInt(rangeInputvalue[0].value);
            var maxVal = parseInt(rangeInputvalue[1].value);

            var diff = maxVal - minVal

            // Kiểm tra xem khoảng cách giá có bị vượt quá không
            if (diff < priceGap) {
              // Kiểm tra xem đầu vào có phải là đầu vào phạm vi tối thiểu không
              if (e.target.className === "min-range") {
                rangeInputvalue[0].value = maxVal - priceGap;
              }
              else {
                rangeInputvalue[1].value = minVal + priceGap;
              }
            } else {
              // Cập nhật giá đầu vào và tiến độ phạm vi
              priceInputvalue[0].value = minVal;
              priceInputvalue[1].value = maxVal;
              rangevalue.style.left = `${(minVal / rangeInputvalue[0].max) * 100}%`;
              rangevalue.style.right = `${100 - (maxVal / rangeInputvalue[1].max) * 100}%`;
            }

            minInputRange.innerHTML = minVal.toLocaleString("vi-VN") + 'đ'
            maxInputRange.innerHTML = maxVal.toLocaleString("vi-VN") + 'đ'

            this.filters.minPrice = minVal
            this.filters.maxPrice = maxVal
          });
        }
      }

      // lấy tất cả các sản phẩm đã lọc
      this.findAllProduct()
    })

    // bộ lọc
    const btnFilters: any = document.querySelector(".btnFilters")
    const btnCloseFilter: any = document.querySelector(".btnCloseFilter")

    btnFilters.addEventListener("click", () => {
      this.filters.flag = true
      this.setPageNumber(1)
    })

    // tắt lọc
    btnCloseFilter.addEventListener("click", () => {
      btnCloseFilter.style.display = "none"

      this.productService.maxPrice(this.filters.search).subscribe((responseD: any) => {
        this.filters.flag = false
        this.filters.pageNumber = 1
        this.filters.minPrice = 0
        this.filterMaxPrice = responseD.maxPrice
        this.filters.maxPrice = responseD.maxPrice

        const rangevalue: any = document.querySelector(".price-slider");
        const rangeInputvalue: any = document.querySelectorAll(".range-input input");
        const minInputRange: any = document.querySelector(".min-input-range");
        const maxInputRange: any = document.querySelector(".max-input-range");
        rangeInputvalue[0].value = "0"
        rangeInputvalue[1].value = responseD.maxPrice
        rangevalue.style = "height: 100%; left: 0%; right: 0%; position: absolute; border-radius: 5px; background-color: #62c56a;"
        minInputRange.innerHTML = this.filters.minPrice.toLocaleString("vi-VN") + 'đ'
        maxInputRange.innerHTML = this.filters.maxPrice.toLocaleString("vi-VN") + 'đ'

        const inputFilter = document.querySelectorAll(".input-filter")
        inputFilter.forEach((e: any) => {
          e.checked = false
        })

        this.setPageNumber(1)
      })
    })
  }

  private filter() {
    const ctnProducts: any = document.querySelector(".ctnProducts")
    const loadingProduct: any = document.querySelector(".loading-product")
    const btnFilters: any = document.querySelector(".btnFilters")
    const btnCloseFilter: any = document.querySelector(".btnCloseFilter")

    ctnProducts.style.display = "none"
    loadingProduct.style.display = "block"
    btnFilters.disabled = true
    btnFilters.innerHTML = `<span class="loader2"></span> Bộ lọc`
    btnCloseFilter.style.display = "block"

    this.productService.filterProductBySearch(this.filters).subscribe((response: any) => {
      for (let i = 0; i < response.products.length; i++) {
        this.handleProductDetail(response.products[i])

        if (i == response.products.length - 1) {
          this.products = response.products

          this.loadingImage()

          this.handleSeeProduct()
        }
      }
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      if (this.total == 0) {
        this.products = response.products
      }

      ctnProducts.style.display = "block"
      loadingProduct.style.display = "none"
      btnFilters.disabled = false
      btnFilters.innerHTML = `Bộ lọc`
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

  public setPageNumber(pageNumber: number) {
    this.pageNumber = pageNumber

    window.scrollTo({
      top: 0,
      behavior: 'smooth' // hiệu ứng cuộn trơn tru hơn
    })

    if (this.filters.flag) {
      this.filters.pageNumber = pageNumber
      this.filter()
    } else {
      this.findAllProduct()
    }
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
}
