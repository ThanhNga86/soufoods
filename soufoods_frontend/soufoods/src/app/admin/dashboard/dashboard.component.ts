import { AccountService } from './../../services/account/account.service';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { AdminStaticsService } from './../../services/admin/admin-statics.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  account: any = {}
  dashboard: any = {}

  constructor(private adminStaticsService: AdminStaticsService, private userAuthService: UserAuthService, private accountService: AccountService) {}

  ngOnInit(): void {
    this.statistics()

    this.getAccount()
  }

  private statistics() {
    // Thống kê khách hàng
    this.adminStaticsService.staticsByUser().subscribe((response: any) => {
      this.dashboard.user = response
    })

    // Thống kê danh mục
    this.adminStaticsService.staticsByCategory().subscribe((response: any) => {
      this.dashboard.category = response
    })

    // Thống kê sản phẩm
    this.adminStaticsService.staticsByProduct().subscribe((response: any) => {
      this.dashboard.product = response
    })

    // Thống kê đơn hàng
    this.adminStaticsService.staticsByOrder().subscribe((response: any) => {
      this.dashboard.order = response
    })

    // Thống kê đánh giá
    this.adminStaticsService.staticsByReview().subscribe((response: any) => {
      this.dashboard.review = response
    })

    // Thống kê mã giảm giá
    this.adminStaticsService.staticsByVoucher().subscribe((response: any) => {
      this.dashboard.voucher = response
    })
  }

  private getAccount() {
    const credentials = this.userAuthService.getCredentials();
    this.accountService.findByEmail(credentials.sub).subscribe((response: any) => {
      if (response.status == '200') {
        this.account = response.user
        if (this.account.address != null) {
          this.account.address = this.account.address.split('||')
        }
      } else {
        console.error("Không tìm thấy email này.")
      }
    })
  }
}
