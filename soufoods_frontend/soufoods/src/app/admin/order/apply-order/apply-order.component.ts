import { ShipService } from './../../../services/ship/ship.service';
import Swal from 'sweetalert2';
import { AdminOrderService } from './../../../services/admin/admin-order.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-apply-order',
  templateUrl: './apply-order.component.html',
  styleUrls: ['./apply-order.component.css']
})
export class ApplyOrderComponent implements OnInit {
  orders: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  message: any = {}
  filters: any = {
    flag: false,
    saerch: null,
    orderDate: null,
    status: 'Chờ xử lý',
    pageNumber: 1
  }

  constructor(private adminOrderService: AdminOrderService, private shipService: ShipService) { }

  ngOnInit(): void {
    this.handleFilter()

    this.findAll()
  }

  private resetFunctions() {
    const loadDataTime = setInterval(() => {
      // Duyệt đơn hàng
      const apply: HTMLElement | any = document.querySelectorAll(".apply")
      for (let i = 0; i < apply.length; i++) {
        const cloneElement = this.cloneElement(apply[i])
        cloneElement.addEventListener("click", () => {
          const id = apply[i].getAttribute("id")
          this.orderApply(id, cloneElement)
        })
      }

      // Hủy đơn hàng
      const cancel: HTMLElement | any = document.querySelectorAll(".cancel")
      for (let i = 0; i < cancel.length; i++) {
        const cloneElement = this.cloneElement(cancel[i])
        cloneElement.addEventListener("click", () => {
          const id = cancel[i].getAttribute("id")
          this.orderCancel(id)
        })
      }

      // Ẩn - hiện chi tiết danh mục
      const seeDetail: HTMLElement | any = document.querySelectorAll(".see-detail")
      for (let i = 0; i < seeDetail.length; i++) {
        const cloneElement = this.cloneElement(seeDetail[i])
        cloneElement.addEventListener("click", () => {
          this.seeDetail(i)
        })
      }

      // Nếu có dữ liệu thì xóa vòng lặp đi
      if (this.total > 0) {
        clearInterval(loadDataTime)
      } else {
        clearInterval(loadDataTime)
      }
    }, 200)
  }

  private findAll() {
    const sizePage = 10;
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-orders")
    const row: HTMLElement | any = table.querySelectorAll("tr")

    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminOrderService.findAllByApply(this.pageNumber, sizePage).subscribe((response: any) => {
      this.orders = response.orders
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      if (this.total == 0) {
        for (let i = 1; i < row.length; i++) {
          row[i].remove()
        }
      }

      this.resetFunctions()
      loading.style.display = 'none'
      table.style.display = 'block'
    })
  }

  private handleFilter() {
    const filter: HTMLElement | null = document.querySelector(".filter")
    const search: HTMLInputElement | null = document.querySelector(".search");
    var loadTimeout: any = null

    if (search) {
      search?.addEventListener("input", () => {
        // http request filter đến server
        this.filters.search = (search.value != '') ? search.value.trim() : null
        this.filters.flag = true

        if (loadTimeout != null) {
          clearTimeout(loadTimeout)
        }

        loadTimeout = setTimeout(() => {
          this.setPageNumber(1)
        }, 300);
      });
    }

    if (filter) {
      var filterTable: HTMLElement | any = filter.querySelector(".filter-table")
      // Thêm các lọc
      filterTable.innerHTML += `
        <div class="form-group">
          <label class="label-filter">Ngày đặt hàng</label><br>
          <input class="input-date w-100" type="date">
        </div>
      `

      const inputDate: any = document.querySelector(".input-date")
      inputDate.addEventListener("change", () => {
        this.filters.orderDate = (inputDate.value == '') ? 'null' : inputDate.value;
        this.filters.flag = true
        this.setPageNumber(1)
      })

      var flagFilter = true
      filter.addEventListener("click", () => {
        var icon = filter.querySelector("i")

        if (flagFilter) {
          // mở form bộ lọc X và ngăn chặn event click đến thẻ cha
          icon?.setAttribute("class", "fa-regular fa-circle-xmark")
          if (filterTable) {
            filterTable.addEventListener("click", (e: any) => {
              e.stopPropagation()
            })
            filterTable.style.display = 'block'
          }
        } else { // tắt form bộ lọc
          icon?.setAttribute("class", "fa-solid fa-filter")
          if (filterTable) {
            filterTable.style.display = 'none'
          }
        }
        flagFilter = !flagFilter
      })
    }

    // thêm dữ liệu đầu vào bộ lọc
    var inputFilter: any = document.querySelectorAll(".input-filter")
    var labelFilter: any = document.querySelectorAll(".label-filter")
    for (let i = 0; i < inputFilter.length; i++) {
      inputFilter[i].addEventListener("change", () => {
        var removeFilter = labelFilter[i].querySelector(".remove-filter")
        if (removeFilter) {
          removeFilter.remove()
        }
        labelFilter[i].innerHTML = `${labelFilter[i].innerHTML} <i class="fa-regular fa-rectangle-xmark remove-filter" key=${inputFilter[i].getAttribute("key")} title="Tắt lọc" style="margin-left: 3px; color: red; cursor: pointer;"></i>`

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
        // http request filter đến server
        this.filters.flag = true
        this.setPageNumber(1)

        // Tắt từng filter
        const removeFilters: any = document.querySelectorAll(".remove-filter")

        removeFilters.forEach((e: any, i: number) => {
          const cloneElement = this.cloneElement(removeFilters[i])
          cloneElement.addEventListener("click", () => {
            var inputFilter: any = cloneElement.parentNode?.parentNode?.querySelector(".input-filter")
            for (const key in this.filters) {
              if (key == cloneElement.getAttribute("key")) {
                this.filters[key] = null
                cloneElement.remove()
                inputFilter.checked = false
                this.setPageNumber(1)
                break;
              }
            }
          })
        });
      })
    }
  }

  private filter() {
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-orders")
    const row: HTMLElement | any = table.querySelectorAll("tr")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminOrderService.filterByWaitStatus(this.filters).subscribe((response: any) => {
      this.orders = response.orders
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      if (this.total == 0) {
        for (let i = 1; i < row.length; i++) {
          row[i].remove()
        }
      }

      this.resetFunctions()
      loading.style.display = 'none'
      table.style.display = 'block'
    })
  }

  private orderApply(id: any, btn: any) {
    Swal.fire({
      text: `Bạn chắc muốn duyệt đơn hàng này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          btn.disabled = true
          this.shipService.orderApply(id).subscribe((response: any) => {
            if (response.status == "200") {
              Swal.fire({
                text: "Duyệt đơn hàng thành công.",
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
      })
  }

  private orderCancel(id: any) {
    Swal.fire({
      text: `Bạn chắc muốn hủy đơn hàng này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          this.adminOrderService.orderCancel(id).subscribe((response: any) => {
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
          })
        }
      })
  }

  private seeDetail(i: number) {
    const seeDetail: any = document.querySelectorAll(".see-detail")[i]
    const icon: any = seeDetail.querySelector("i")
    const detailRow = seeDetail.parentNode.parentNode.parentNode
    var provisional = 0;
    var discount = 0;
    var paymentTotal = 0;

    if (icon.getAttribute('flag') == 'true') {
      seeDetail.innerHTML = '<i class="fa-solid fa-arrow-up" flag="false"></i> Hồi'
      seeDetail.style.backgroundColor = 'rgb(253, 142, 105)'
      const newRow = document.createElement("tr");
      newRow.setAttribute("class", "row-see-detail")
      newRow.setAttribute("id-resetForm", seeDetail.getAttribute("id"))
      newRow.setAttribute("index-resetForm", i + "")
      const newCell: any = newRow.insertCell(0);
      var color = 'rgb(247,224,212)'
      newCell.style.backgroundColor = color
      newCell.colSpan = "9"

      newCell.innerHTML += `
        <h5 style="text-align: left; background-color: ${color};">Chi tiết đơn hàng</h5>
        <div style="text-align: left; background-color: ${color};">Email đặt hàng: ${this.orders[i].email}</div>
        ${(this.orders[i].note != '' && this.orders[i].note != 'undefined') ? `<div style="text-align: left; background-color: ${color};">Ghi chú: ${this.orders[i].note}</div>` : ''}
      `
      var table = document.createElement('table');
      table.classList.add('table', 'table-bordered', 'mt-1', 'text-center');
      table.style.verticalAlign = "middle"
      table.style.backgroundColor = color
      table.innerHTML = `
        <tr>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Mã số</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Tên sản phẩm</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Loại sản phẩm</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Hình ảnh</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Giá</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Số lượng</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Tổng cộng</th>
        </tr>
      `;
      this.adminOrderService.findAllByOrder(this.orders[i].id).subscribe((response: any) => {
        for (let i = 0; i < response.length; i++) {
          var price = response[i].price * (100 - response[i].discount) / 100
          var total = price * response[i].quantity
          table.innerHTML += `
            <tr>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${response[i].id}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${response[i].productDetail.product.name}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${(response[i].productDetail.product.name != response[i].productDetail.size) ? response[i].productDetail.size : ''}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">
                <img src="${response[i].productDetail.product.imageUrl}" width="68" height="68">
              </td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${price.toLocaleString("vi-VN")} đ</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${response[i].quantity}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${total.toLocaleString("vi-VN")} đ</td>
            </tr>
          `
          provisional += total
          paymentTotal += total
        }
        newCell.appendChild(table);

        newCell.innerHTML += `
          <div style="background-color: ${color}; display: flex; justify-content: space-between; align-items: center; center; font-weight: 500;">
            <div>Tạm tính: </div>
            <div style="font-size: medium; color: orange;">${provisional.toLocaleString("vi-VN")} đ</div>
          </div>
        `

        if (this.orders[i].voucher != null) {
          if (this.orders[i].voucher.discountType) {
            discount = provisional - (provisional - this.orders[i].voucher.discount);
          } else {
            discount = provisional - (provisional * (100 - this.orders[i].voucher.discount) / 100);
          }
          paymentTotal -= discount;

          newCell.innerHTML += `
            <div style="background-color: ${color}; display: flex; justify-content: space-between; align-items: center; font-weight: 500;">
              <div>Mã giảm giá: ${this.orders[i].voucher.discountCode}</div>
              <div style="font-size: medium; color: orange;">-${discount.toLocaleString("vi-VN")} đ</div>
            </div>
          `
        }

        paymentTotal += this.orders[i].shipFee
        newCell.innerHTML += `
          <div style="background-color: ${color}; display: flex; justify-content: space-between; align-items: center; center; font-weight: 500;">
            <div>Phí vận chuyển: </div>
            <div style="font-size: medium; color: orange;">${(this.orders[i].shipFee != 0)? this.orders[i].shipFee.toLocaleString("vi-VN"):'Miễn phí'} đ</div>
          </div>
        `

        newCell.innerHTML += `
          <div style="background-color: ${color}; display: flex; justify-content: space-between; align-items: center; center; font-weight: 500;">
            <div>Tổng thanh toán: </div>
            <div style="font-size: 18px; color: orange;">${paymentTotal.toLocaleString("vi-VN")} đ</div>
          </div>
        `
        detailRow.parentNode.insertBefore(newRow, detailRow.nextSibling);
      })
    } else {
      seeDetail.innerHTML = '<i class="fa-solid fa-eye" flag="true"></i> Xem'
      seeDetail.style.backgroundColor = 'green'
      detailRow.nextSibling.remove()
    }
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

    if (this.filters.flag) {
      this.filters.pageNumber = pageNumber
      this.filter()
    } else {
      this.findAll()
    }

    // Xóa tất cả bảng xem chi tiết
    for (let i = 0; i < rowSeeDetail.length; i++) {
      rowSeeDetail[i].remove()
    }
  }

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }
}
