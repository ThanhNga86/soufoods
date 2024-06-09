import Swal from 'sweetalert2';
import { AdminVouchersService } from './../../../services/admin/admin-vouchers.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.css']
})
export class VouchersComponent implements OnInit {
  vouchers: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  message: any = {}
  defaultSave: any = {}
  filters: any = {
    flag: false,
    pageNumber: 1,
    search: null,
    active: null,
    freeShip: null,
    expiration: null,
    expirationDate: null,
  }

  constructor(private adminVouchersService: AdminVouchersService) { }


  ngOnInit(): void {
    this.handleFilter()

    this.findAll()
  }

  private resetFunctions() {
    var loadDataTime = setInterval(() => {
      // Hiển thị form cập nhật dữ liệu
      const edit: HTMLElement | any = document.querySelectorAll(".edit")
      const flagEdit = new Array()
      for (let i = 0; i < edit.length; i++) {
        flagEdit.push(true)
        const cloneElement = this.cloneElement(edit[i])
        cloneElement.addEventListener("click", () => {
          if (flagEdit[i]) {
            this.edit(i)
            this.checkInput()
            flagEdit[i] = false
          }
        })
      }

      // Cập nhật dữ liệu form lên server
      const btnSave: HTMLElement | any = document.querySelectorAll(".btnSave")
      for (let i = 0; i < btnSave.length; i++) {
        const cloneElement = this.cloneElement(btnSave[i])
        cloneElement.addEventListener("click", () => {
          const id: any = cloneElement.getAttribute("id")
          const tdId = document.querySelectorAll(".td-id")
          for (let j = 0; j < tdId.length; j++) {
            if (id == tdId[j].getAttribute("id")) {
              this.update(j)
            }
          }
        })
      }

      // Làm mới lại dữ liệu form ban đầu
      const btnReset: HTMLElement | any = document.querySelectorAll(".btnReset")
      for (let i = 0; i < btnReset.length; i++) {
        const cloneElement = this.cloneElement(btnReset[i])
        cloneElement.addEventListener("click", () => {
          const id = btnReset[i].getAttribute("id")
          this.resetForm(id, i)
        })
      }

      // Xóa voucher
      const remove: HTMLElement | any = document.querySelectorAll(".remove")
      for (let i = 0; i < remove.length; i++) {
        const cloneElement = this.cloneElement(remove[i])
        cloneElement.addEventListener("click", () => {
          const id = remove[i].getAttribute("id")
          this.delete(id)
        })
      }

      if (this.total > 0) {
        clearInterval(loadDataTime)
      } else {
        clearInterval(loadDataTime)
      }
    }, 200)
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

        if(loadTimeout != null) {
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
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="active-voucher" type="checkbox" key="active" value-checked="true" value-unchecked="false" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active-voucher" style="user-select: none;">Trạng thái mã giảm giá</label>
          <span class="label-filter"></span>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="active-freeShip" type="checkbox" key="freeShip" value-checked="true" value-unchecked="false" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active-freeShip" style="user-select: none;">Trạng thái free ship</label>
          <span class="label-filter"></span>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="active-expiration" type="checkbox" key="expiration" value-checked="1" value-unchecked="0" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active-expiration" style="user-select: none;">Trạng thái thời hạn</label>
          <span class="label-filter"></span>
        </div>
        <div class="form-group">
          <label class="label-filter">Ngày hết hạn</label><br>
          <input class="input-date w-100" type="date">
        </div>
      `
      const inputDate: any = document.querySelector(".input-date")
      inputDate.addEventListener("change", () => {
        this.filters.expirationDate = (inputDate.value == '') ? 'null' : inputDate.value;
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
    const table: HTMLElement | any = document.querySelector(".table-vouchers")
    const row: HTMLElement | any = table.querySelectorAll("tr")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminVouchersService.filter(this.filters).subscribe((response: any) => {
      this.vouchers = response.vouchers
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

  public findAll() {
    const sizePage = 10
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-vouchers")
    const row: HTMLElement | any = table.querySelectorAll("tr")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminVouchersService.findAll(this.pageNumber, sizePage).subscribe((response: any) => {
      this.vouchers = response.vouchers
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

  public setPageNumber(pageNumber: number) {
    const tr = document.querySelectorAll(".tr-voucherupdateForm")
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
  }

  private edit(i: number) {
    // Xử lý phần thay đổi giá trị giảm giá
    const toPercent: any = document.querySelectorAll(".toPercent")[i]
    const toPrice: any = document.querySelectorAll(".toPrice")[i]
    const inpDiscount: any = document.querySelectorAll(".inpDiscount")[i]

    if (toPercent && toPrice) {
      toPercent.addEventListener("click", () => {
        toPrice.classList.replace("btn-secondary", "btn-outline-secondary")
        toPercent.classList.replace("btn-outline-secondary", "btn-secondary")
        inpDiscount.setAttribute("flag", "false")
        inpDiscount.setAttribute("placeholder", "Nhập phần trăm giảm giá")
      })

      toPrice.addEventListener("click", () => {
        toPercent.classList.replace("btn-secondary", "btn-outline-secondary")
        toPrice.classList.replace("btn-outline-secondary", "btn-secondary")
        inpDiscount.setAttribute("flag", "true")
        inpDiscount.setAttribute("placeholder", "Nhập giá giảm")
      })
    }
  }

  private update(i: number) {
    const btnSave: any = document.querySelectorAll(".btnSave")[i]
    const btnReset: any = document.querySelectorAll(".btnReset")[i]
    const formData = new FormData();
    const inpId: any = document.querySelectorAll(".inpId")[i]
    const inpExpiration: any = document.querySelectorAll(".inpExpiration")[i]
    const inpDiscount: any = document.querySelectorAll(".inpDiscount")[i]
    const inpPriceMin: any = document.querySelectorAll(".inpPriceMin")[i]
    const inpFreeShip: any = document.querySelectorAll(".inpFreeShip")[i]
    const inpMessageType: any = document.querySelectorAll(".inpMessageType")[i]
    const inpActive: any = document.querySelectorAll(".inpActive")[i]
    btnSave.disabled = true
    btnReset.disabled = true
    btnSave.innerHTML = '<span class="loader2"></span> Lưu Thay đổi'

    formData.append("id", inpId.value)
    if (inpExpiration.value == '') {
      formData.append("expiration", '2000-01-01')
    } else {
      formData.append("expiration", inpExpiration.value)
    }

    if (inpDiscount.getAttribute("flag") == "false") { // giảm theo %
      formData.append("discount", inpDiscount.value)
      formData.append("discountType", "false")
    } else { // giảm theo giá
      formData.append("discount", inpDiscount.value)
      formData.append("discountType", "true")
    }

    formData.append("priceMin", inpPriceMin.value)

    if (inpFreeShip.checked) {
      formData.append("freeShip", "true")
    } else {
      formData.append("freeShip", "false")
    }

    if (inpMessageType.checked) {
      formData.append("messageType", "email")
    } else {
      formData.append("messageType", "local")
    }
    formData.append("active", inpActive.value)

    this.adminVouchersService.update(formData).subscribe((response: any) => {
      if (response.status == '200') {
        this.resetForm(inpId.value, i)
        var changeMessage: NodeListOf<HTMLElement> | null = document.querySelectorAll(".change-message")
        if (changeMessage) {
          changeMessage.forEach((e) => {
            e.innerText = 'Cập nhật mã giảm giá thành công !'
            setTimeout(() => {
              e.innerText = ''
            }, 2000);
          })
        }

        if (inpActive.value == 'true') {
          const btnCloneModal: any = document.querySelectorAll(".btn-close")[i]
          btnCloneModal.click()

          this.setPageNumber(this.pageNumber)
        }
      } else {
        this.message = response
      }
      btnSave.disabled = false
      btnReset.disabled = false
      btnSave.innerHTML = 'Lưu Thay đổi'
    })
  }

  private resetForm(id: number, i: number) {
    const btnReset: any = document.querySelectorAll(".btnReset")[i]
    const inpExpiration: any = document.querySelectorAll(".inpExpiration")[i]
    const inpDiscount: any = document.querySelectorAll(".inpDiscount")[i]
    const toPercent: any = document.querySelectorAll(".toPercent")[i]
    const toPrice: any = document.querySelectorAll(".toPrice")[i]
    const inpFreeShip: any = document.querySelectorAll(".inpFreeShip")[i]
    const inpPriceMin: any = document.querySelectorAll(".inpPriceMin")[i]
    const showPriceMin: any = document.querySelectorAll(".showPriceMin")[i]
    const inpMessageType: any = document.querySelectorAll(".inpMessageType")[i]
    const inpActive: any = document.querySelectorAll(".inpActive")[i]

    btnReset.disabled = true
    btnReset.innerHTML = '<span class="loader2"></span> Khôi phục'

    this.adminVouchersService.findById(id).subscribe((response: any) => {
      const voucher = response.voucher
      console.log(response.voucher.expiration)
      if (inpExpiration && inpDiscount && inpFreeShip && inpPriceMin && inpMessageType) {
        inpExpiration.value = voucher.expiration.substring(0, 10)

        inpDiscount.value = voucher.discount
        if (voucher.discountType == true) {
          toPrice.classList.replace("btn-outline-secondary", "btn-secondary")
          toPercent.classList.replace("btn-secondary", "btn-outline-secondary")
          inpDiscount.setAttribute("flag", "true")
          inpDiscount.setAttribute("placeholder", "Nhập giá giảm")
        } else {
          toPercent.classList.replace("btn-outline-secondary", "btn-secondary")
          toPrice.classList.replace("btn-secondary", "btn-outline-secondary")
          inpDiscount.setAttribute("flag", "false")
          inpDiscount.setAttribute("placeholder", "Nhập phần trăm giảm giá")
        }

        inpPriceMin.value = voucher.priceMin
        showPriceMin.innerHTML = Number(inpPriceMin.value).toLocaleString("vi-VN") + ' đ'
        if (voucher.freeShip) {
          inpFreeShip.checked = true
        } else {
          inpFreeShip.checked = false
        }

        if (voucher.messageType == 'email') {
          inpMessageType.checked = true
          const remove: any = document.querySelectorAll(".remove")
          remove.forEach((e: any) => {
            if (e.getAttribute("id") == id) {
              e.remove()
            }
          })
        } else {
          inpMessageType.checked = false
        }

        this.vouchers[i].expiration = voucher.expiration
        this.vouchers[i].discount = voucher.discount
        this.vouchers[i].discountType = voucher.discountType
        this.vouchers[i].priceMin = voucher.priceMin
        this.vouchers[i].freeShip = voucher.freeShip
        this.vouchers[i].messageType = voucher.messageType
        setTimeout(() => {
          this.edit(i)
        }, 100);
      }
      inpActive.value = voucher.active
      this.vouchers[i].active = voucher.active

      this.message = {}
      btnReset.disabled = false
      btnReset.innerHTML = 'Khôi phục'
    })
  }

  private delete(id: number) {
    Swal.fire({
      text: `Bạn chắc muốn xóa mã giảm giá này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          this.adminVouchersService.delete(id).subscribe((response: any) => {
            if (response.status == "200") {
              Swal.fire({
                text: "Xóa mã giảm giá thành công.",
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

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }

  private checkInput() {
    const inpForm = document.querySelectorAll(".inpForm")
    const inpDate = document.querySelectorAll(".inpDate")
    const inpPriceMin: any = document.querySelectorAll(".inpPriceMin")
    const showPriceMin: any = document.querySelectorAll(".showPriceMin")

    inpForm.forEach((event: any) => {
      event.addEventListener("input", () => {
        const name = event.getAttribute("name")
        for (const key in this.message) {
          if (key == name) {
            this.message[key] = ''
          }
        }
      })
    })

    inpDate.forEach((event: any) => {
      event.addEventListener("change", () => {
        const name = event.getAttribute("name")
        for (const key in this.message) {
          if (key == name) {
            this.message[key] = ''
          }
        }
      })
    })

    inpPriceMin.forEach((e: any, i: number) => {
      const cloneElement: any = this.cloneElement(e)
      cloneElement.addEventListener("input", () => {
        if (cloneElement.value != '') {
          showPriceMin[i].innerHTML = Number(cloneElement.value).toLocaleString("vi-VN") + ' đ'
        } else {
          showPriceMin[i].innerHTML = ''
        }
      })
    })
  }
}
