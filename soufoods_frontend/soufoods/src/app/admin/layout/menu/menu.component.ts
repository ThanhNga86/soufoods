import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private userAuthService: UserAuthService, private router: Router) { }

  ngOnInit(): void {
    // Lấy thông tin đã xác thực đưa lên menu-user
    const username: HTMLElement | null = document.querySelector(".username")
    const credentials: any = this.userAuthService.getCredentials()
    if (credentials && username) {
      username.innerHTML = `Hello, ${credentials.name}`
    }

    // Viếng thăm các thẻ a đã chọn
    const btnMenu: NodeListOf<HTMLElement> | any = document.querySelectorAll(".menu-section");

    btnMenu.forEach((btn: any) => {
      const li: any = btn.querySelector("li");
      if (String(btn.href).includes(window.location.href)) {
        li.style.backgroundColor = 'rgb(246, 166, 68)';
      }
    });

    // Thay đổi mũi tên của menu-mini
    const btnMenuMini: NodeListOf<HTMLElement> = document.querySelectorAll(".menu-mini");

    btnMenuMini.forEach((btn: HTMLElement, i: number) => {
      btn.addEventListener("click", () => {
        const ariaExpanded: string | null = btnMenuMini[i].getAttribute("aria-expanded");
        const right: HTMLElement | null = btnMenuMini[i].querySelector(".right");
        if (ariaExpanded === 'true') {
          if (right) right.style.transform = 'rotate(90deg)';
        } else {
          if (right) right.style.transform = 'rotate(360deg)';
        }
      });
    });

    // Tắt - mở menu đứng
    const modeMenu: HTMLElement | null = document.querySelector(".mode-menu");
    const standMenu: HTMLElement | null = document.querySelector(".stand-menu");
    const onOffMenus: NodeListOf<HTMLElement> | null = document.querySelectorAll(".on-off-menu");
    onOffMenus.forEach((event: HTMLElement) => {
      event.style.paddingLeft = '240px';
    })
    let flagModeMenu: boolean = true;

    if (modeMenu && standMenu && onOffMenus) {
      modeMenu.addEventListener("click", () => {
        if (flagModeMenu) {
          standMenu.style.display = "none";

          onOffMenus.forEach((event: HTMLElement) => {
            event.style.paddingLeft = '0';
          })
        } else {
          standMenu.style.display = "";

          onOffMenus.forEach((event: HTMLElement) => {
            event.style.paddingLeft = '240px';
          })
        }
        flagModeMenu = !flagModeMenu;
      });
    }
  }

  isAuthenticated(): boolean {
    return this.userAuthService.authenticated();
  }

  logout(): void {
    this.userAuthService.logout()
    this.router.navigateByUrl("/account/login")
  }
}
