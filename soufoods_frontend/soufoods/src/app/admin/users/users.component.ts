import { NgForm } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminUsersService } from 'src/app/services/admin/admin-users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  message: any = {}
  filters: any = {
    flag: false,
    pageNumber: 1,
    active: null
  }

  constructor(private adminUsersService: AdminUsersService) { }

  ngOnInit(): void {
    this.handleFilter()

    this.findAll();

    this.resetFunctions()
  }

  private resetFunctions() {
    const loadDataTime = setInterval(() => {
      this.checkInput()

      if (this.total > 0) {
        clearInterval(loadDataTime)
      } else {
        clearInterval(loadDataTime)
      }
    }, 300)
  }

  private handleFilter() {
    const filter: HTMLElement | null = document.querySelector(".filter")
    const search: HTMLInputElement | null = document.querySelector(".search");

    if (search) {
      search?.addEventListener("input", () => {
        // http request filter đến server
        this.filters.search = (search.value != '') ? search.value.trim() : null
        this.filters.flag = true
        this.setPageNumber(1)
      });
    }

    if (filter) {
      var filterTable: HTMLElement | any = filter.querySelector(".filter-table")
      filterTable.innerHTML += `
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" type="checkbox" key="active" value-checked="true" value-unchecked="false" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label label-filter">Trạng thái tài khoản</label>
        </div>
      `

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
      inputFilter[i].addEventListener("click", () => {
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

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }

  public findAll(): void {
    const sizePage: number = 20
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-users")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminUsersService.findAll(this.pageNumber, sizePage).subscribe((response: any) => {
      this.users = response.users
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      loading.style.display = 'none'
      table.style.display = 'block'
    })
  }

  public filter(): void {
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-users")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminUsersService.filter(this.filters).subscribe((response: any) => {
      this.users = response.users
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      loading.style.display = 'none'
      table.style.display = 'block'
    })
  }

  public setPageNumber(pageNumber: number) {
    this.pageNumber = pageNumber
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

    this.resetFunctions()
  }

  public update(updateForm: NgForm, i: number): any {
    const btnSave: HTMLElement | any = document.querySelectorAll(".btnSave")[i]
    btnSave.disabled = true

    this.adminUsersService.update(updateForm).subscribe((response: any) => {
      if (response.status == 200) {
        btnSave.disabled = false
        // cập nhật lại user trong users
        this.users[i].email = updateForm.value.email
        this.users[i].firstName = updateForm.value.firstName
        this.users[i].lastName = updateForm.value.lastName
        this.users[i].phone = updateForm.value.phone
        this.users[i].address = updateForm.value.address
        if (updateForm.value.active == 'true') {
          this.users[i].active = true
        } else if (updateForm.value.active == 'false') {
          this.users[i].active = false
        }

        // thông báo khi lưu thay đổi
        var changeMessage: NodeListOf<HTMLElement> | null = document.querySelectorAll(".change-message")
        if (changeMessage) {
          changeMessage.forEach((e) => {
            e.innerText = 'Cập nhật người dùng thành công !'
            setTimeout(() => {
              e.innerText = ''
            }, 2000);
          })
        }
      } else if (response.status == '401') {
        this.message = response
        btnSave.disabled = false
      }
    }, (error: any) => {
      console.error(error)
    })
  }

  public delete(email: any) {
    Swal.fire({
      text: `Bạn chắc muốn xóa người dùng này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result) => {
        if (result.isConfirmed) {
          this.adminUsersService.delete(email).subscribe((response: any) => {
            if (response.status == 200) {
              Swal.fire({
                text: "Xóa người dùng thành công.",
                icon: "success",
                confirmButtonText: "Đồng ý",
              });
              this.findAll()
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

  public resetForm(email: any, updateForm: NgForm) {
    this.adminUsersService.findByEmail(email).subscribe((response: any) => {
      if (response.status == '200') {
        updateForm.setValue({
          email: response.user.email,
          password: response.user.password,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone,
          address: response.user.address,
          active: response.user.active.toString(),
          account: response.user.account.toString()
        }); // Cập nhật giá trị trong NgForm
        this.message = {}
      }
    });
  }

  private checkInput() {
    const inpForm = document.querySelectorAll(".inpForm")

    inpForm.forEach((event: any) => {
      event.addEventListener("input", () => {
        if (event.value != '') {
          const name = event.getAttribute("name")
          for (const key in this.message) {
            if (key == name) {
              this.message[key] = ''
            }
          }
        }
      })
    })
  }
}
