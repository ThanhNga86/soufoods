import { UserAuthService } from './../services/auth/user-auth.service';
import { VoucherService } from './../services/voucher/voucher.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css']
})
export class VoucherComponent implements OnInit {
  vouchers: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  countC: number = 0

  constructor(private voucherService: VoucherService, private userAuthService: UserAuthService) { }

  ngOnInit(): void {
    const arrCart: any[] = JSON.parse(localStorage.getItem("carts") + "") || []
    this.countC = arrCart.length
    
    this.findAll()
  }

  private findAll() {
    const loadingData: any = document.querySelector(".loading-data")
    const ctnVouchers: any = document.querySelector(".ctnVouchers")
    loadingData.style.display = "block"
    ctnVouchers.style.display = "none"
    const credentials = this.userAuthService.getCredentials()

    this.voucherService.findAll(this.pageNumber, credentials.sub).subscribe((response: any) => {
      this.vouchers = response.vouchers
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      this.handleBtnCopyCode()
      loadingData.style.display = "none"
      ctnVouchers.style.display = "block"
      if (this.total == 0)
        this.vouchers = response.vouchers
    })
  }

  private handleBtnCopyCode() {
    setTimeout(() => {
      const btnCopyCode: any = document.querySelectorAll(".btnCopyCode")

      btnCopyCode.forEach((e: any) => {
        e.addEventListener("click", () => {
          e.disabled = true
          e.innerHTML = `<i class="fa-solid fa-check"></i>`
          const code: any = e.parentNode.querySelector(".code").innerHTML
          const textarea = document.createElement('textarea');
          textarea.value = code;

          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';

          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');

          document.body.removeChild(textarea);
          setTimeout(() => {
            e.innerHTML = 'Copy'
            e.disabled = false
          }, 2000);
        })
      })
    }, 300);
  }

  public setPageNumber(pageNumber: number) {
    this.pageNumber = pageNumber

    window.scrollTo({
      top: 0,
      behavior: 'smooth' // hiệu ứng cuộn trơn tru hơn
    })

    this.findAll()
  }
}
