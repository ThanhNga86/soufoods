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
    setTimeout(() => {
      const userMenu: HTMLElement | null = document.querySelector(".user-menu")
      const menuBar: HTMLElement | null = document.querySelector(".menu-bar")
      const dropdownMmenuUser : HTMLElement | null = document.querySelector(".dropdown-menu-user")
      const username: HTMLElement | null = document.querySelector(".username")
      const credentials: any = this.userAuthService.getCredentials()

      if (credentials && username) {
        username.innerHTML = `Chào ${credentials.name}`
      }

      this.hoverMenu(userMenu, menuBar, dropdownMmenuUser)
    }, 200);

    // Viếng thăm các thẻ a đã chọn
    const btnMenu: NodeListOf<HTMLElement> | any = document.querySelectorAll(".menu-section");

    btnMenu.forEach((btn: any) => {
      const li: any = btn.querySelector("li");
      if (String(btn.href).includes(window.location.href)) {
        li.style.backgroundColor = 'rgb(255, 190, 111)';
        const liParent = li.parentNode.parentNode
        if(liParent.getAttribute("id")) {
          const btnMMenuMini: NodeListOf<HTMLElement> | any = document.querySelectorAll(".menu-mini");
          btnMMenuMini.forEach((btn: any) => {
            const dataTarget: string = btn.getAttribute("data-bs-target")

            if(dataTarget.includes(liParent.getAttribute("id"))) {
              btn.style.backgroundColor = 'rgb(255, 190, 111)';
            }
          })
        }
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
          if (right) right.style.transform = 'rotate(0deg)';
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

  private hoverMenu(menu: any, menuBar: any, dropdown: any){
    menu?.addEventListener("mouseover", () => {
      if(!dropdown?.classList.contains("show")) {
        dropdown?.classList.add("show")
      }
    })

    menuBar?.addEventListener("mouseover", () => {
      if(!dropdown?.classList.contains("show")) {
        dropdown?.classList.add("show")
      }
    })

    dropdown?.addEventListener("mouseover", () => {
      if(!dropdown?.classList.contains("show")) {
        dropdown?.classList.add("show")
      }
    })

    menu?.addEventListener("mouseout", () => {
      if(dropdown?.classList.contains("show")) {
        dropdown?.classList.remove("show")
      }
    })

    dropdown?.addEventListener("mouseout", () => {
      if(dropdown?.classList.contains("show")) {
        dropdown?.classList.remove("show")
      }
    })
  }

  logout(): void {
    this.userAuthService.logout()
    this.router.navigateByUrl("/account/login")
  }
}
