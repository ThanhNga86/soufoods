import { VoucherService } from './../../services/voucher/voucher.service';
import { FavoriteService } from './../../services/favorite/favorite.service';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu-account',
  templateUrl: './menu-account.component.html',
  styleUrls: ['./menu-account.component.css']
})
export class MenuAccountComponent implements OnInit {

  constructor(private userAuthService: UserAuthService, private voucherService: VoucherService, private favoriteService: FavoriteService) { }

  ngOnInit(): void {
    const btnMenu: NodeListOf<HTMLElement> | any = document.querySelectorAll(".item-menu");

    btnMenu.forEach((btn: any) => {
      const li: any = btn.querySelector("li");
      if (String(btn.href).includes(window.location.href)) {
        li.style.backgroundColor = 'rgb(223, 223, 223)';
      }
    });

    this.handleCounter()
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

    // Đếm số mã giảm giá
    const countVoucher = document.querySelectorAll(".count-voucher")
    const credentials = this.userAuthService.getCredentials()
    this.voucherService.findAll(1, credentials.sub).subscribe((response: any) => {
      countVoucher.forEach((e: any) => {
        e.innerHTML = response.total
      })
    })
  }

  public logout() {
    this.userAuthService.logout()
    location.href = ''
  }
}
