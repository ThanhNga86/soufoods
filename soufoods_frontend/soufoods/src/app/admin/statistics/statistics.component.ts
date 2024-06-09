import { AdminStaticsService } from './../../services/admin/admin-statics.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent {
  statistics: any = {}
  sellingProducts: any = {
    pageNumber: 1,
    total: 0,
    totalPage: [],
    products: []
  }
  biggestBuyer: any = {
    pageNumber: 1,
    total: 0,
    totalPage: [],
    users: []
  }

  constructor(private adminStaticsService: AdminStaticsService) { }

  ngOnInit(): void {
    this.statisticsByRevenue()

    this.staticsBySellingProducts()

    this.staticsByBiggestBuyer()
  }

  private statisticsByRevenue() {
    // Thống kê doanh thu hôm qua
    this.adminStaticsService.staticsByYesterday().subscribe((response: any) => {
      this.statistics.yesterday = response
    })

    // Thống kê doanh thu hôm nay
    this.adminStaticsService.staticsByToday().subscribe((response: any) => {
      if (response.revenue == null) {
        this.statistics.today = null
      } else {
        this.statistics.today = response
      }
    })

    // Thống kê doanh thu tuần này
    this.adminStaticsService.staticsByWeek().subscribe((response: any) => {
      if (response.revenue == null) {
        this.statistics.week = null
      } else {
        this.statistics.week = response
      }
    })

    // Thống kê doanh thu tháng này
    this.adminStaticsService.staticsByMonth().subscribe((response: any) => {
      if (response.revenue == null) {
        this.statistics.month = null
      } else {
        this.statistics.month = response
      }
    })

    // Thống kê tổng doanh thu
    this.adminStaticsService.staticsByTotal('null', 'null').subscribe((response: any) => {
      if (response.revenue == null) {
        this.statistics.total = null
      } else {
        this.statistics.total = response
      }
    })

    const inpFormDate: any = document.querySelector(".inpFormDate")
    const inpToDate: any = document.querySelector(".inpToDate")

    inpFormDate.addEventListener("change", () => {
      if (inpFormDate.value == '' && inpToDate.value == '') {
        this.adminStaticsService.staticsByTotal('null', 'null').subscribe((response: any) => {
          if (response.revenue == null) {
            this.statistics.total = null
          } else {
            this.statistics.total = response
          }
        })
      }

      if (inpFormDate.value == '') {
        inpFormDate.style.boxShadow = 'none'
        inpFormDate.style.border = 'none'
        inpToDate.style.boxShadow = 'none'
        inpToDate.style.border = 'none'
      } else {
        inpFormDate.style.boxShadow = 'none'
        if (inpToDate.value == '') {
          inpToDate.style.boxShadow = '0 0 0 2px lightcoral'
        } else {
          inpToDate.style.boxShadow = 'none'
          this.adminStaticsService.staticsByTotal(inpFormDate.value, inpToDate.value).subscribe((response: any) => {
            if (response.revenue == null) {
              this.statistics.total = null
            } else {
              this.statistics.total = response
            }
          })
        }
      }
    })

    inpToDate.addEventListener("change", () => {
      if (inpFormDate.value == '' && inpToDate.value == '') {
        this.adminStaticsService.staticsByTotal('null', 'null').subscribe((response: any) => {
          if (response.revenue == null) {
            this.statistics.total = null
          } else {
            this.statistics.total = response
          }
        })
      }

      if (inpToDate.value == '') {
        inpFormDate.style.boxShadow = 'none'
        inpFormDate.style.border = 'none'
        inpToDate.style.boxShadow = 'none'
        inpToDate.style.border = 'none'
      } else {
        inpToDate.style.boxShadow = 'none'
        if (inpFormDate.value == '') {
          inpFormDate.style.boxShadow = '0 0 0 2px lightcoral'
        } else {
          inpFormDate.style.boxShadow = 'none'
          this.adminStaticsService.staticsByTotal(inpFormDate.value, inpToDate.value).subscribe((response: any) => {
            if (response.revenue == null) {
              this.statistics.total = null
            } else {
              this.statistics.total = response
            }
          })
        }
      }
    })
  }

  private staticsBySellingProducts() {
    const loadingProducts: HTMLElement | any = document.querySelector(".loading-products")
    const tableProducts: HTMLElement | any = document.querySelector(".table-products")
    loadingProducts.style.display = 'block'
    tableProducts.style.display = 'none'

    this.adminStaticsService.staticsBySellingProducts(this.sellingProducts.pageNumber).subscribe((response: any) => {
      this.sellingProducts.products = response.products
      this.sellingProducts.total = response.total
      this.sellingProducts.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      loadingProducts.style.display = 'none'
      tableProducts.style.display = 'block'
    })
  }

  private staticsByBiggestBuyer() {
    const loadingUsers: HTMLElement | any = document.querySelector(".loading-users")
    const tableUsers: HTMLElement | any = document.querySelector(".table-users")
    loadingUsers.style.display = 'block'
    tableUsers.style.display = 'none'

    this.adminStaticsService.staticsByBiggestBuyer(this.biggestBuyer.pageNumber).subscribe((response: any) => {
      this.biggestBuyer.users = response.users
      this.biggestBuyer.total = response.total
      this.biggestBuyer.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);
console.log(response);

      loadingUsers.style.display = 'none'
      tableUsers.style.display = 'block'
    })
  }

  public setPageNumberByProducts(pageNumber: number) {
    this.sellingProducts.pageNumber = pageNumber
    this.staticsBySellingProducts()
  }

  public setPageNumberByUsers(pageNumber: number) {
    this.biggestBuyer.pageNumber = pageNumber
    this.staticsBySellingProducts()
  }
}
