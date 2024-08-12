import { ShipService } from './../services/ship/ship.service';
import { OrderService } from './../services/order/order.service';
import { UserAuthService } from 'src/app/services/auth/user-auth.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  status: string = 'Chờ xử lý'
  count: any = {}

  constructor(private orderService: OrderService, private userAuthService: UserAuthService, private shipService: ShipService) { }

  ngOnInit(): void {
    this.findAll()
  }

  private resetFunctions() {
    const loadDataTime = setInterval(() => {
      // Ẩn - hiện chi tiết danh mục
      const seeDetail: HTMLElement | any = document.querySelectorAll(".see-detail")
      for (let i = 0; i < seeDetail.length; i++) {
        const cloneElement = this.cloneElement(seeDetail[i])
        cloneElement.addEventListener("click", () => {
          const id: any = cloneElement.getAttribute("id")
          this.seeDetail(id, i)
        })
      }

      // Hủy đơn hàng
      const cancel: HTMLElement | any = document.querySelectorAll(".cancel")
      for (let i = 0; i < cancel.length; i++) {
        const cloneElement = this.cloneElement(cancel[i])
        cloneElement.addEventListener("click", () => {
          const id = cancel[i].getAttribute("id")
          this.orderCancel(id, cloneElement)
        })
      }

      // Nếu có dữ liệu thì xóa vòng lặp đi
      if (this.total > 0) {
        clearInterval(loadDataTime)
      } else {
        clearInterval(loadDataTime)
      }
    }, 300)
  }

  private orderCount() {
    this.orderService.findAllByUser(this.userAuthService.getToken()).subscribe((response: any) => {
      this.count = {
        wait: 0,
        processed: 0,
        delivering: 0
      }

      for (let i = 0; i < response.length; i++) {
        if (response[i].status == 'Chờ xử lý') {
          this.count.wait += 1
        }

        if (response[i].status == 'Đã xử lý') {
          this.count.processed += 1
        }

        if (response[i].status == 'Đang giao') {
          this.count.delivering += 1
        }
      }
    })
  }

  private findAll() {
    const itemStatus: any = document.querySelectorAll(".item-status")
    this.findAllByStatus(this.status) // mặc định

    itemStatus.forEach((e: any) => {
      e.addEventListener("click", () => {
        const status = e.getAttribute("status")
        this.pageNumber = 1
        e.disabled = true

        this.status = status
        this.findAllByStatus(this.status)
      })
    })
  }

  private findAllByStatus(status: any) {
    const loadingData: HTMLElement | any = document.querySelector(".loading-data")
    const tableOrder: HTMLElement | any = document.querySelectorAll(".table-orders")
    const rowSeeDetail: HTMLElement | any = document.querySelectorAll(".row-see-detail")
    const paging: HTMLElement | any = document.querySelector("#paging")
    const itemStatus: any = document.querySelectorAll(".item-status")
    const formData = new FormData()

    loadingData.style.display = 'block'
    tableOrder.forEach((e: any) => {
      e.style.display = 'none'
    })
    if (paging) { paging.style.display = 'none' }

    formData.set("status", status)
    formData.set("token", this.userAuthService.getToken())
    formData.set("pageNumber", this.pageNumber + "")

    this.orderCount()

    this.orderService.findAllByStatus(formData).subscribe((response: any) => {
      this.orders = response.orders
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      this.resetFunctions()
      loadingData.style.display = 'none'
      tableOrder.forEach((e: any) => {
        e.style.display = 'block'
      })
      itemStatus.forEach((e: any) => {
        e.disabled = false
      })
      if (paging) { paging.style.display = 'flex' }

      const btnPage: any = document.querySelector(".btnPage")
      if (btnPage) {
        btnPage.disabled = false
        btnPage.innerHTML = 'Xem thêm đơn hàng <i class="fa-solid fa-angle-down"></i>'
      }
    })

    // Xóa tất cả bảng xem chi tiết
    for (let i = 0; i < rowSeeDetail.length; i++) {
      rowSeeDetail[i].remove()
    }
  }

  private seeDetail(id: any, i: number) {
    const seeDetail: any = document.querySelectorAll(".see-detail")[i]
    const icon: any = seeDetail.querySelector("i")
    const detailRow = seeDetail.parentNode.parentNode.parentNode
    const index = this.orders.findIndex(e => e.id == id)
    seeDetail.innerHTML = `<span class="loader2"></span> Xem`
    seeDetail.disabled = true
    var provisional = 0;
    var discount = 0;
    var paymentTotal = 0;

    if (icon.getAttribute('flag') == 'true') {
      const newRow = document.createElement("tr");
      newRow.setAttribute("class", "row-see-detail")
      newRow.setAttribute("id-resetForm", seeDetail.getAttribute("id"))
      newRow.setAttribute("index-resetForm", i + "")
      const newCell: any = newRow.insertCell(0);
      var color = 'rgb(247,224,212)'
      newCell.style.backgroundColor = color
      newCell.colSpan = "5"
      newCell.innerHTML += `
        <h5 style="text-align: left; background-color: ${color};">Chi tiết đơn hàng</h5>
        <div style="text-align: left; background-color: ${color};">Email đặt hàng: ${this.orders[index].email}</div>
        <div style="text-align: left; background-color: ${color};">Địa chỉ nhận hàng: ${this.orders[index].address.replaceAll("||", ",")}</div>
        <div style="text-align: left; background-color: ${color};">Số điện thoại: ${this.orders[index].phone}</div>
        ${(this.orders[index].note != '' && this.orders[index].note != 'undefined') ? `<div style="text-align: left; background-color: ${color};">Ghi chú: ${this.orders[index].note}</div>` : ''}
      `

      var ctnProducts = document.createElement('div');
      ctnProducts.style.backgroundColor = color
      ctnProducts.innerHTML += `
      <div class="title-product row mx-0 px-0" style="display: flex; justify-content: center; align-items: center; font-size: 14px; padding-bottom: 5px; border-bottom: solid 1px white; font-weight: 500; text-align: right;">
        <div class="title-cart col-4" style="text-align: left;">SẢN PHẨM</div>
        <div class="title-cart text-center col-3">GIÁ</div>
        <div class="title-cart text-center col-2">SỐ LƯỢNG</div>
        <div class="title-cart title-total-cart col-3">TỔNG CỘNG</div>
      </div>
      `

      this.orderService.findAllByOrder(this.orders[index].id).subscribe((response: any) => {
        for (let i = 0; i < response.length; i++) {
          var price = response[i].price * (100 - response[i].discount) / 100
          var total = price * response[i].quantity
          ctnProducts.innerHTML += `
          <div class="productD" style="display: flex; justify-content: center; align-items: center; padding: 10px 5px; border-bottom: solid 1px white;">
            <div class="product col-4" style="display: flex; align-items: center; flex-wrap: wrap;">
              <a href="/collections/product?id=${response[i].productDetail.product.id}&name=${response[i].productDetail.product.name}" class="image" style="margin-right: 5px; background-color: white; height: 68px; width: 68px; background-image: url(../../assets/images/loading-image.gif); background-position: 70% 100%; background-size: cover; background-repeat: no-repeat; object-position: center center; overflow: hidden; position: relative;">
                <img src="${response[i].productDetail.product.imageUrl}" style="max-width: 100%; width: 100%; height: 100%; opacity: 0; object-fit: contain; object-position: center center;">
              </a>
              <div class="size-name" style="text-align: left;">
                <div class="name" style="max-width: 230px; font-weight: 480;">${response[i].productDetail.product.name}</div>
                ${(response[i].productDetail.product.name != response[i].productDetail.size) ? `<div class="size" style="color: grey; font-size: 14px;">Size: ${response[i].productDetail.size}</div>` : ''}
              </div>
            </div>

            <div class="ctnPrice text-center col-3" style="text-align: right;">
              <div class="price" style="color: orange;">${(response[i].productDetail.price * (100 - response[i].productDetail.discount) / 100).toLocaleString("vi-VN")} đ</div>
            </div>

            <div class="ctnQuantity text-center col-2" style="text-align: right;">
              <span>${response[i].quantity}</span>
            </div>

            <div class="ctnTotal col-3" style="text-align: right;">
              <div class="total" style="color: orange;">${(total).toLocaleString("vi-VN")} đ</div>
            </div>
          </div>
          `
          provisional += total
          paymentTotal += total
        }
        newCell.appendChild(ctnProducts);
        this.loadingImage()

        newCell.innerHTML += `
          <div style="background-color: ${color}; display: flex; justify-content: space-between; align-items: center; center; font-weight: 500;">
            <div>Tạm tính: </div>
            <div style="font-size: medium; color: orange;">${provisional.toLocaleString("vi-VN")} đ</div>
          </div>
        `

        if (this.orders[index].voucher != null) {
          if (this.orders[index].voucher.discountType) {
            discount = provisional - (provisional - this.orders[index].voucher.discount);
          } else {
            discount = provisional - (provisional * (100 - this.orders[index].voucher.discount) / 100);
          }
          paymentTotal -= discount;

          newCell.innerHTML += `
            <div style="background-color: ${color}; display: flex; justify-content: space-between; align-items: center; font-weight: 500;">
              <div>Mã giảm giá: ${this.orders[index].voucher.discountCode}</div>
              <div style="font-size: medium; color: orange;">-${discount.toLocaleString("vi-VN")} đ</div>
            </div>
          `
        }

        paymentTotal += this.orders[index].shipFee
        newCell.innerHTML += `
          <div style="background-color: ${color}; display: flex; justify-content: space-between; align-items: center; center; font-weight: 500;">
            <div>Phí vận chuyển: </div>
            <div style="font-size: medium; color: orange;">${(this.orders[index].shipFee != 0) ? this.orders[index].shipFee.toLocaleString("vi-VN") : 'Miễn phí'} đ</div>
          </div>
        `

        newCell.innerHTML += `
          <div style="background-color: ${color}; display: flex; justify-content: space-between; align-items: center; center; font-weight: 500;">
            <div>Tổng thanh toán: </div>
            <div style="font-size: 18px; color: orange;">${paymentTotal.toLocaleString("vi-VN")} đ</div>
          </div>
        `
        detailRow.parentNode.insertBefore(newRow, detailRow.nextSibling);

        seeDetail.innerHTML = '<i class="fa-solid fa-arrow-up" flag="false"></i> Hồi'
        seeDetail.style.backgroundColor = 'rgb(253, 142, 105)'
        seeDetail.disabled = false
      })
    } else {
      seeDetail.innerHTML = '<i class="fa-solid fa-eye" flag="true"></i> Xem'
      seeDetail.style.backgroundColor = 'green'
      seeDetail.disabled = false
      detailRow.nextSibling.remove()
    }
  }

  private orderCancel(id: any, btn: any) {
    Swal.fire({
      text: `Bạn chắc muốn hủy đơn hàng này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          btn.disabled = true
          if(this.status == 'Chờ xử lý') {
            this.orderService.orderCancel(id).subscribe((response: any) => {
              if (response.status == "200") {
                Swal.fire({
                  text: "Hủy đơn hàng thành công.",
                  icon: "success",
                  confirmButtonText: "Đồng ý",
                });

                this.setPageNumber(this.pageNumber)
              } else {
                if (response.error) {
                  Swal.fire({
                    text: response.error,
                    icon: "error",
                    confirmButtonText: "Đồng ý",
                  });
                }
              }
              btn.disabled = false
            })
          }
          else if(this.status == 'Đã xử lý') {
            this.shipService.orderCancel(id).subscribe((response: any) => {
              if (response.status == "200") {
                Swal.fire({
                  text: "Hủy đơn hàng thành công.",
                  icon: "success",
                  confirmButtonText: "Đồng ý",
                });

                this.setPageNumber(this.pageNumber)
              } else {
                if (response.error) {
                  Swal.fire({
                    text: response.error,
                    icon: "error",
                    confirmButtonText: "Đồng ý",
                  });
                }
              }
              btn.disabled = false
            })
          }
        }
      })
  }

  public setPageNumber(pageNumber: number) {
    const rowSeeDetail: HTMLElement | any = document.querySelectorAll(".row-see-detail")

    const tr = document.querySelectorAll(".tr-orderupdateForm")
    if (tr.length <= 1 && this.pageNumber > 1) {
      this.pageNumber -= 1
    } else {
      this.pageNumber = pageNumber
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth' // hiệu ứng cuộn trơn tru hơn
    })

    this.findAllByStatus(this.status)

    // Xóa tất cả bảng xem chi tiết
    for (let i = 0; i < rowSeeDetail.length; i++) {
      rowSeeDetail[i].remove()
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
