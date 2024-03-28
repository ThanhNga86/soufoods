import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { AdminCategoriesService } from 'src/app/services/admin/admin-categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  categories: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  message: any = {}
  defaultSave: any = {}
  filters: any = {
    flag: false,
    pageNumber: 1,
    active: null
  }

  constructor(private adminCategoriesService: AdminCategoriesService) { }

  ngOnInit(): void {
    // Xử lý phần lọc dữ liệu
    this.handleFilter()

    // Hiện tại dữ liệu
    this.findAll()

    this.resetFunctions()
  }

  private resetFunctions() {
    const loadDataTime = setInterval(() => {
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
          this.update(i)
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

      // Xóa danh mục
      const remove: HTMLElement | any = document.querySelectorAll(".remove")
      for (let i = 0; i < remove.length; i++) {
        const cloneElement = this.cloneElement(remove[i])
        cloneElement.addEventListener("click", () => {
          const id = remove[i].getAttribute("id")
          this.delete(id)
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

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
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
          <label class="form-check-label label-filter">Trạng thái hoạt động</label>
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

  private filter() {
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-categories")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminCategoriesService.filter(this.filters).subscribe((response: any) => {
      this.categories = response.categories
      this.total = response.total
      this.totalPage = Array.from({ length: response.totalPage }, (_, index) => index + 1);

      loading.style.display = 'none'
      table.style.display = 'block'
    })
  }

  public findAll() {
    const sizePage = 20
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-categories")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminCategoriesService.findAll(this.pageNumber, sizePage).subscribe((response: any) => {
      this.categories = response.categories
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

  private edit(i: number) {
    const fileImage: HTMLElement | any = document.querySelectorAll(".fileImage")[i]
    const uploadImage: HTMLElement | any = document.querySelectorAll(".uploadImage")[i]
    const removeImage: HTMLElement | any = document.querySelectorAll(".removeImage")[i]

    this.defaultSave.image = uploadImage.src

    uploadImage.addEventListener("click", () => {

      if (fileImage) fileImage.click();
    })

    // xóa hình
    removeImage.addEventListener("click", () => {
      fileImage.value = ''
      uploadImage.src = this.defaultSave.image
      removeImage.style.display = 'none'
    })

    // Thay đổi hình ảnh mới
    fileImage.addEventListener("change", () => {
      const checkImage = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
      const maxSize = 10 * 1024 * 1024; // 10 MB
      if (fileImage.files && fileImage.files[0]) {
        if (fileImage.files[0].size <= maxSize && checkImage.test(fileImage.files[0].name)) {
          removeImage.style.display = "block"
          uploadImage.src = URL.createObjectURL(fileImage.files[0]);
          this.message.image = ''
        } else {
          fileImage.value = ''
          uploadImage.src = this.defaultSave.image
          this.message.image = 'Vui lòng chọn một hình ảnh có định dạng hợp lệ và kích thước không quá 10 MB.';
        }
      }
    })
  }

  private update(i: number) {
    const formData = new FormData()
    const inpId: HTMLElement | any = document.querySelectorAll(".inpId")[i]
    const inpName: HTMLElement | any = document.querySelectorAll(".inpName")[i]
    const fileImage: HTMLElement | any = document.querySelectorAll(".fileImage")[i]
    const inpActive: HTMLElement | any = document.querySelectorAll(".inpActive")[i]

    formData.append("id", inpId.value)
    formData.append("name", inpName.value)
    formData.append("fileImage", fileImage.files[0])
    formData.append("active", inpActive.value)

    const btnSave: HTMLElement | any = document.querySelectorAll(".btnSave")[i]
    btnSave.disabled = true
    btnSave.innerHTML = '<span class="loader2"></span> Lưu thay đổi'

    this.adminCategoriesService.update(formData).subscribe((response: any) => {
      if (response.status == 200) {
        this.resetForm(inpId.value, i)
        // thông báo khi lưu thay đổi
        var changeMessage: NodeListOf<HTMLElement> | null = document.querySelectorAll(".change-message")
        if (changeMessage) {
          changeMessage.forEach((e) => {
            e.innerText = 'Cập nhật danh mục thành công !'
            setTimeout(() => {
              e.innerText = ''
            }, 2000);
          })
        }
      } else if (response.status == '401') {
        this.message = response
      }
      btnSave.disabled = false
      btnSave.innerHTML = 'Lưu thay đổi'
    })
  }

  private resetForm(id: number, i: number) {
    const removeImage: HTMLElement | any = document.querySelectorAll(".removeImage")[i]
    const uploadImage: HTMLElement | any = document.querySelectorAll(".uploadImage")[i]
    const fileImage: HTMLElement | any = document.querySelectorAll(".fileImage")[i]
    const inpName: HTMLElement | any = document.querySelectorAll(".inpName")[i]
    const inpActive: HTMLElement | any = document.querySelectorAll(".inpActive")[i]
    const btnReset: HTMLElement | any = document.querySelectorAll(".btnReset")[i]

    btnReset.disabled = true
    btnReset.innerHTML = '<span class="loader2"></span> Khôi phục'

    this.adminCategoriesService.findById(id).subscribe((response: any) => {
      fileImage.value = ''
      removeImage.style.display = 'none'
      inpName.value = response.category.name
      uploadImage.src = response.category.imageUrl
      inpActive.innerHTML = inpActive.innerHTML.replaceAll('selected=""', '')
      if (response.category.active) {
        inpActive.innerHTML = inpActive.innerHTML.replaceAll('value="true"', 'value="true" selected=""')
      } else {
        inpActive.innerHTML = inpActive.innerHTML.replaceAll('value="false"', 'value="false" selected=""')
      }

      this.categories[i].imageUrl = response.category.imageUrl
      this.categories[i].name = response.category.name
      this.categories[i].active = response.category.active
      this.message = {}

      btnReset.disabled = false
      btnReset.innerHTML = 'Khôi phục'
    })
  }

  private delete(id: number) {
    Swal.fire({
      text: `Bạn chắc muốn xóa danh mục này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          this.adminCategoriesService.delete(id).subscribe((response: any) => {
            if (response.status == 200) {
              Swal.fire({
                text: "Xóa danh mục thành công.",
                icon: "success",
                confirmButtonText: "Đồng ý",
              });
              this.findAll()
              this.resetFunctions()
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


  private checkInput() {
    const inpForm = document.querySelectorAll(".inpForm")
    const inpImage = document.querySelectorAll(".inpImage")

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

    inpImage.forEach((event: any) => {
      event.addEventListener("change", () => {
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
