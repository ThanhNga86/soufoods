import { CategoryService } from './../../services/advice/category.service';
import { CartService } from './../../services/shopping-cart/cart.service';
import { ProductService } from './../../services/product/product.service';
import { FavoriteService } from './../../services/favorite/favorite.service';
import { NgForm } from '@angular/forms';
import { UserAuthService } from './../../services/auth/user-auth.service';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  categories: any[] = []
  message: any = {}
  product: any

  constructor(private userAuthService: UserAuthService, private productService: ProductService, private categoryService: CategoryService, private favoriteService: FavoriteService, private cartService: CartService) { }

  ngOnInit(): void {
    // lấy tất cả danh mục
    this.categoryService.findAll().subscribe((response: any) => {
      for (let i = 0; i < response.length; i++) {
        this.categoryService.findAllByCategory(response[i].id).subscribe((responseCd: any) => {
          response[i].categoryDetail = responseCd

          if (i == response.length - 1) {
            this.categories = response

            setTimeout(() => {
              // Thay đổi mũi tên của menu-mini
              const btnMenuMini: NodeListOf<HTMLElement> = document.querySelectorAll(".menu-mini");
              btnMenuMini.forEach((btn: HTMLElement, i: number) => {
                btn.addEventListener("click", () => {
                  const ariaExpanded: string | null = btnMenuMini[i].getAttribute("aria-expanded");
                  const right: HTMLElement | null = btnMenuMini[i].querySelector(".right");
                  if (ariaExpanded === 'true') {
                    if (right) right.style.transform = 'rotate(90deg)';
                  } else {
                    if (right) right.style.transform = 'rotate(0deg)';
                  }
                });
              });
            }, 300);
          }
        })
      }
    })

    setTimeout(() => {
      // Thay đổi mũi tên của menu-mini
      const btnMenuMini: NodeListOf<HTMLElement> = document.querySelectorAll(".menu-mini");
      btnMenuMini.forEach((btn: HTMLElement, i: number) => {
        btn.addEventListener("click", () => {
          const ariaExpanded: string | null = btnMenuMini[i].getAttribute("aria-expanded");
          const right: HTMLElement | null = btnMenuMini[i].querySelector(".right");
          if (ariaExpanded === 'true') {
            if (right) right.style.transform = 'rotate(90deg)';
          } else {
            if (right) right.style.transform = 'rotate(0deg)';
          }
        });
      });

      // menu hover
      const menuHover = document.querySelectorAll(".menu-hover")
      const menuBar = document.querySelectorAll(".menu-bar")
      const dropdownMenuHover = document.querySelectorAll(".dropdown-menu-hover")
      for (let i = 0; i < menuHover.length; i++) {
        this.hoverMenu(menuHover[i], menuBar[i], dropdownMenuHover[i])
      }

      this.checkInput()

      this.handleScroll()

      this.cartService.findAll()
    }, 300);

    this.handleUrlBlock()

    this.handleProductSearch()

    this.handleCounter()
  }

  private handleProductSearch() {
    const formSearch: any = document.querySelectorAll(".formSearch")
    const inpProductSearch: any = document.querySelectorAll(".inpProductSearch")
    const btnProductSearch: any = document.querySelectorAll(".btnProductSearch")
    const searchResultProduct: any = document.querySelectorAll(".search-resultProduct")
    var loadTimeout: any = null

    formSearch.forEach((e: any, i: number) => {
      inpProductSearch[i].addEventListener("input", () => {
        if (loadTimeout != null) {
          clearTimeout(loadTimeout)
        }

        const value = inpProductSearch[i].value
        if (value != '') {
          btnProductSearch[i].innerHTML = `<span class="loader2" style="border: 5px dotted orange"></span>`
          searchResultProduct[i].innerHTML = ''
          searchResultProduct[i].classList.remove('show')

          loadTimeout = setTimeout(() => {
            const search = { search: value }
            this.productService.productSearch(search).subscribe((response: any) => {
              for (let j = 0; j < response.products.length; j++) {
                this.handleProductDetailBySearch(response.products[j], searchResultProduct[i])

                if (j == response.products.length - 1) {
                  searchResultProduct[i].classList.add('show')
                  btnProductSearch[i].innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`
                }
              }

              if (response.total == 0) {
                searchResultProduct[i].classList.add('show')
                btnProductSearch[i].innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`
                searchResultProduct[i].innerHTML = `
                <div style="padding: 10px; color: grey;">Không có sản phẩm nào khớp với lựa chọn của bạn.</div>
                `
              }
            })
          }, 300);
        } else {
          searchResultProduct[i].classList.remove('show')
          searchResultProduct[i].innerHTML = ""
          btnProductSearch[i].innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`
        }
      })

      inpProductSearch[i].addEventListener("blur", () => {
        setTimeout(() => {
          if (inpProductSearch[i].value != '') {
            searchResultProduct[i].classList.remove('show')
          }
        }, 200);
      })

      inpProductSearch[i].addEventListener("focus", () => {
        if (inpProductSearch[i].value != '') {
          searchResultProduct[i].classList.add('show')
        }
      })

      e.addEventListener("submit", () => {
        const value = inpProductSearch[i].value
        if (value != '') {
          location.href = `/search?query=${value}`
        }
      })
    })
  }

  private handleProductDetailBySearch(response: any, searchResultProduct: any) {
    this.productService.findAllByProduct(response.id).subscribe((responseD: any) => {
      response.productDetail = responseD
      // lấy size đầu tiên và điều kiện còn hàng
      for (let j = 0; j < responseD.length; j++) {
        if (responseD[j].quantity != 0) {
          var productSearch = ''
          productSearch += `
          <a style="padding: 5px; display: flex; font-size: 14px; text-decoration: none; color: black;" href="/collections/product?id=${response.id}&name=${response.name}">
            <div>
              <div class="image-search" style="margin-right: 6px; background-color: white; height: 80px; width: 80px; background-image: url(../../../assets/images/loading-image.gif); background-position: 70% 100%; background-size: cover; background-repeat: no-repeat; object-position: center center; overflow: hidden; position: relative;">
                <img src="${response.imageUrl}" style="max-width: 100%; width: 100%; height: 100%; opacity: 0; object-fit: cover; object-position: center center;">
              </div>
            </div>
            <div class="name-size">
              <div>${response.name}</div>
          `

          if (responseD[j].size != response.name) {
            productSearch += `
            <div class="size" style="color: grey;">${responseD[j].size}</div>
            `
          }

          if (responseD[j].discount > 0) {
            productSearch += `
            <del style="color: grey;">${responseD[j].price.toLocaleString("vi-VN")} đ</del>
            <span class="price" style="margin-left: 5px; color: orange;">${Number(responseD[j].price * (100 - responseD[j].discount) / 100).toLocaleString("vi-VN")} đ</span>
            `
          } else {
            productSearch += `
            <span class="price" style="color: orange;">${responseD[j].price.toLocaleString("vi-VN")} đ</span>
            `
          }

          productSearch += `
            </div>
          </a>
          `
          searchResultProduct.innerHTML += productSearch

          const images: any = document.querySelectorAll(".image-search")
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
          break;
        }
      }
    })
  }

  private handleUrlBlock() {
    setTimeout(() => {
      const actionBlock: any = document.querySelectorAll(".action-block")
      for (let i = 0; i < actionBlock.length; i++) {
        const url = location.href
        const urlBlock = actionBlock[i].getAttribute("block")

        if (url.includes(urlBlock)) {
          actionBlock[i].removeAttribute("data-bs-toggle")
          actionBlock[i].href = urlBlock
        }
      }
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
                location.href = ""
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
    location.href = ""
  }

  private handleScroll() {
    const header: any = document.querySelector(".header")
    const scrollUp: any = document.querySelector(".scrollUp")
    const searchResultProduct: any = document.querySelector(".search-resultProduct-web")

    var valueDefault = 0
    window.addEventListener("scroll", () => {
      const valueScroll = window.scrollY

      // Hiển ẩn phần menu
      if (valueScroll < (header.scrollHeight)) {
        header.style.position = ''
        header.style.top = ''
      } else {
        if (valueScroll < (valueDefault - 5)) {
          header.style.position = 'fixed'
          header.style.top = '0'
        }

        if (valueScroll > (valueDefault + 10)) {
          header.style.position = 'fixed'
          header.style.top = '-100px'
          searchResultProduct.classList.remove('show')
        }
      }
      valueDefault = window.scrollY

      // Hiển ẩn chuột cuộn lên
      if (valueScroll < 300) {
        scrollUp.style.display = 'none'
      } else {
        scrollUp.style.display = 'block'
      }
    })

    scrollUp.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // hiệu ứng cuộn trơn tru hơn
      })
    })
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
}
