import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { AdminCategoriesService } from 'src/app/services/admin/admin-categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit{
  categories: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  message: any = {}
  defaultSave: any = {}
  filters: any = {
    flag: false,
    pageNumber: 1,
    active: null,
    activeCd: null
  }

  constructor(private adminCategoriesService: AdminCategoriesService) { }

  ngOnInit(): void {
    // Xử lý phần lọc dữ liệu
    this.handleFilter()

    // Hiện tại dữ liệu
    this.findAll()
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
            const id = edit[i].getAttribute("id")
            this.edit(id, i)
            this.checkInput()
            flagEdit[i] = false
          }
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
          this.delete(id, i)
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
      filterTable.innerHTML += `
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="active" type="checkbox" key="active" value-checked="true" value-unchecked="false" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active" style="user-select: none;">Trạng thái danh mục</label>
          <span class="label-filter"></span>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="active-detail" type="checkbox" key="activeCd" value-checked="true" value-unchecked="false" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active-detail" style="user-select: none;">Trạng thái danh mục chi tiết</label>
          <span class="label-filter"></span>
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
    const table: HTMLElement | any = document.querySelector(".table-categories")
    const row: HTMLElement | any = table.querySelectorAll("tr")

    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminCategoriesService.filter(this.filters).subscribe((response: any) => {
      this.categories = response.categories
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
    const table: HTMLElement | any = document.querySelector(".table-categories")
    const row: HTMLElement | any = table.querySelectorAll("tr")

    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminCategoriesService.findAll(this.pageNumber, sizePage).subscribe((response: any) => {
      this.categories = response.categories
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
    const rowSeeDetail: HTMLElement | any = document.querySelectorAll(".row-see-detail")

    const tr = document.querySelectorAll(".tr-categoryupdateForm")
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

    // Xóa tất cả bảng xem chi tiết danh mục
    for (let i = 0; i < rowSeeDetail.length; i++) {
      rowSeeDetail[i].remove()
    }
  }

  private seeDetail(i: number) {
    const seeDetail: any = document.querySelectorAll(".see-detail")[i]
    const icon: any = seeDetail.querySelector("i")
    const detailRow = seeDetail.parentNode.parentNode

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
      newCell.colSpan = "5"

      newCell.innerHTML += `
        <h5 style="text-align: left; background-color: ${color};">Size</h5>
      `
      var table = document.createElement('table');
      table.classList.add('table', 'table-bordered', 'mt-1', 'text-center');
      table.style.verticalAlign = "middle"
      table.style.backgroundColor = color
      table.innerHTML = `
        <tr>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Mã số</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Tên loại</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Hình ảnh</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Trạng thái</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;"></th>
        </tr>
      `;
      this.adminCategoriesService.findAllCategoryDetailByCategory(this.categories[i].id).subscribe((response: any) => {
        for (let i = 0; i < response.length; i++) {
          table.innerHTML += `
            <tr>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${response[i].id}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${response[i].size}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">
                <img src="${response[i].imageUrl}" width="50" height="50">
              </td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">
                ${response[i].active ? '<span style="margin: 2px; padding: 2px 4px; border-radius: 6px; background-color: rgb(89, 255, 47); white-space: nowrap; color: white; user-select: none;">Hoạt động</span>' : '<span style="margin: 2px; padding: 2px 4px; border-radius: 6px; background-color: lightcoral; white-space: nowrap; color: white; user-select: none;">Bị khóa</span>'}
              </td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">
                <span class="removeProductD" id="${response[i].id}" style="margin: 2px; padding: 3px 6px; border-radius: 6px; background-color: lightcoral; white-space: nowrap; color: white; user-select: none; cursor: pointer;"><i class="fa-regular fa-trash-can"></i> Xóa</span>
              </td>
            </tr>
          `
        }
        newCell.appendChild(table);
        detailRow.parentNode.insertBefore(newRow, detailRow.nextSibling);

        // Xóa danh mục chi tiết
        const removeProductD = document.querySelectorAll(".removeProductD")
        for (let i = 0; i < removeProductD.length; i++) {
          const cloneElement = this.cloneElement(removeProductD[i])
          cloneElement.addEventListener("click", () => {
            const id: any = cloneElement.getAttribute("id")
            const row = cloneElement.parentNode?.parentNode
            if (id) {
              this.deleteCategoryDetail(id, row)
            }
          })
        }
      })
    } else {
      seeDetail.innerHTML = '<i class="fa-solid fa-eye" flag="true"></i> Xem'
      seeDetail.style.backgroundColor = 'green'
      detailRow.nextSibling.remove()
    }
  }

  private deleteCategoryDetail(id: number, row: any) {
    const rowSeeDetail = row.parentNode.parentNode.parentNode.parentNode
    const idResetForm = rowSeeDetail.getAttribute("id-resetForm")
    const indexResetForm = rowSeeDetail.getAttribute("index-resetForm")

    Swal.fire({
      text: `Bạn chắc muốn xóa danh mục chi tiết này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          this.adminCategoriesService.deleteCategoryDetail(id).subscribe((response: any) => {
            if (response.status == "200") {
              row.remove()
              this.resetForm(idResetForm, indexResetForm)
              Swal.fire({
                text: "Xóa danh mục chi tiết thành công.",
                icon: "success",
                confirmButtonText: "Đồng ý",
              });
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

  private edit(id: number, i: number) {
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

    // Xử lý phần thêm form Type
    const ctnTypes: HTMLElement | any = document.querySelectorAll(".ctnTypes")[i]
    const addFormType: HTMLElement | any = document.querySelectorAll(".addFormType")[i]

    this.adminCategoriesService.findAllCategoryDetailByCategory(id).subscribe((response: any) => {
      ctnTypes.innerHTML = ''
      for (let i = 0; i < response.length; i++) {
        ctnTypes.innerHTML += `<div class="typeId mt-2"></div>`
        ctnTypes.innerHTML += `<span>Mã số: ${response[i].id}</span>`
        var typeCategory: any = document.createElement("div")
        typeCategory.setAttribute("class", "type-category old-types")
        typeCategory.setAttribute("category-detail-id", response[i].id)
        typeCategory.style = "display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;"

        typeCategory.innerHTML += `
          <div class="form-group">
            <label>Tên loại của danhh mục</label>
            <input type="text" value="${response[i].size}" class="form-control inpForm inpSize">
          </div>

          <div class="form-group mx-3">
            <label>Hình ảnh</label>
            <div class="ctnImages" style="position: relative; display: flex; justify-content: flex-end; width: 66px; height: 66px;">
              <i class="fa-solid fa-x removeImages" style="display: none; font-size: 12px; position: absolute; color: gray; cursor: pointer; padding: 2px; background-color: white; opacity: 0.8;"></i>
              <img class="uploadImages" src="${response[i].imageUrl}" width="100%" height="100%" style="cursor: pointer; border: solid 1px lightgray;">
            </div>
            <input type="file" class="fileImages" style="display: none;">
          </div>
        `
        typeCategory.innerHTML += (response[i].active == true) ?
          '<div class="form-group"><label>Trạng thái</label><select class="form-select inpForm inpActiveCd"><option value="true">Hoạt động</option><option value="false">Bị khóa</option></select></div>' :
          '<div class="form-group"><label>Trạng thái</label><select class="form-select inpForm inpActiveCd"><option value="true">Hoạt động</option><option value="false" selected>Bị khóa</option></select></div>'
        ctnTypes.appendChild(typeCategory)

        const ctnImages: HTMLElement | any = document.querySelectorAll(".ctnImages")[i]
        this.defaultSave[`ctnImage_${i}`] = ctnImages.innerHTML
      }

      // mặc định
      const actionFormType = () => {
        // xóa form type
        const removeFormType = document.querySelectorAll(".removeFormType")

        removeFormType.forEach((event, i) => {
          const cloneElement = this.cloneElement(event)
          cloneElement.addEventListener("click", () => {
            const oldTypes = document.querySelectorAll(".old-types")
            var formType: any = cloneElement.parentNode?.parentNode
            i += oldTypes.length
            formType.remove()

            const typeCategory: any = ctnTypes.querySelectorAll(".type-category")
            if (typeCategory.length <= 0) {
              addFormType.click()
            }

            const ctnImages: any = document.querySelectorAll(".ctnImages")
            for (let i = 0; i < ctnImages.length; i++) {
              this.handleUploadImages(i)
            }
          })
        })

        const inpForm = document.querySelectorAll(".inpForm")
        inpForm.forEach((event: any) => {
          event.addEventListener("focus", () => {
            event.style.boxShadow = '0 0 0 2px rgb(255, 222, 170)'
            event.style.borderColor = 'rgb(255, 222, 170)'
          })
          event.addEventListener("blur", () => {
            event.style.boxShadow = 'none'
            event.style.borderColor = 'lightgray'
          })
        })

        const ctnImages: any = document.querySelectorAll(".ctnImages")
        for (let i = 0; i < ctnImages.length; i++) {
          this.handleUploadImages(i)
        }
      }
      actionFormType()

      // có sự kiện thêm form type
      addFormType.addEventListener("click", () => {
        var typeCategory: any = document.createElement("div")
        typeCategory.setAttribute("class", "type-category mt-3")
        typeCategory.style = "display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;"
        typeCategory.innerHTML += `
            <div class="form-group">
              <label>Tên loại của danh mục</label>
              <input type="text" class="form-control inpForm inpSize">
            </div>

            <div class="form-group mx-3">
              <label>Hình ảnh</label>
              <div class="ctnImages" style="position: relative; display: flex; justify-content: flex-end; width: 66px; height: 66px;">
                <i class="fa-solid fa-x removeImages" style="display: none; font-size: 12px; position: absolute; color: gray; cursor: pointer; padding: 2px; background-color: white; opacity: 0.8;"></i>
                <img class="uploadImages" width="100%" height="100%" style="cursor: pointer; border: solid 1px lightgray;">
              </div>
              <input type="file" class="fileImages inpImage" style="display: none;">
            </div>

            <div class="form-group">
              <label>Trạng thái</label>
              <select class="form-select inpForm inpActiveCd">
                <option value="true">Hoạt động</option>
                <option value="false">Bị khóa</option>
              </select>
            </div>

            <div class="form-group mt-4" style="margin-left: 10px;">
              <i class="fa-solid fa-trash-can removeFormType" style="padding: 10px; background-color: lightcoral; border: none; color: white; user-select: none; cursor: pointer; border-radius: 10px; white-space: nowrap; font-size: 20px;"></i>
            </div>
        `
        ctnTypes.appendChild(typeCategory)

        const ctnImages: HTMLElement | any = document.querySelectorAll(".ctnImages")
        this.defaultSave[`ctnImage_${ctnImages.length - 1}`] = ctnImages[ctnImages.length - 1].innerHTML
        actionFormType()
      })
    })
  }

  private update(i: number) {
    const formData = new FormData()
    const inpId: HTMLElement | any = document.querySelectorAll(".inpId")[i]
    const inpName: HTMLElement | any = document.querySelectorAll(".inpName")[i]
    const fileImage: HTMLElement | any = document.querySelectorAll(".fileImage")[i]
    const ctnTypes: HTMLElement | any = document.querySelectorAll(".ctnTypes")[i]
    const typeCategory: any = ctnTypes.querySelectorAll(".type-category")
    const inpSize: any = ctnTypes.querySelectorAll(".inpSize")
    const inpActiveCd: any = ctnTypes.querySelectorAll(".inpActiveCd")
    const fileImages: any = ctnTypes.querySelectorAll(".fileImages")
    const inpActive: HTMLElement | any = document.querySelectorAll(".inpActive")[i]
    const index = i

    if (this.validateForm(i)) {
      formData.append("id", inpId.value)
      formData.append("name", inpName.value.trim())
      formData.append("fileImage", fileImage.files[0])
      formData.append("active", inpActive.value)

      const btnSave: HTMLElement | any = document.querySelectorAll(".btnSave")[i]
      const btnReset: HTMLElement | any = document.querySelectorAll(".btnReset")[i]
      btnSave.disabled = true
      btnReset.disabled = true
      btnSave.innerHTML = '<span class="loader2"></span> Lưu thay đổi'

      // tắt bảng xem danh mục chi tiết
      var rowSeeDetail: any = document.querySelectorAll(".tr-categoryupdateForm")[i]
      var seeDetail: any = document.querySelectorAll(".see-detail")[i]
      var flagSeeDetail = seeDetail.querySelector("i").getAttribute("flag")

      if (flagSeeDetail) {
        if (flagSeeDetail == 'false') {
          seeDetail.innerHTML = '<i class="fa-solid fa-eye" flag="true"></i> Xem'
          seeDetail.style.backgroundColor = 'green'
          rowSeeDetail.nextSibling.remove()
        }
      }

      this.adminCategoriesService.update(formData).subscribe((response: any) => {
        if (response.status == "200") {
          const categoryId = response.categoryId
          const formDataCategoryD = new FormData()

          if (typeCategory.length) {
            for (let i = 0; i < typeCategory.length; i++) {
              formDataCategoryD.set("size", inpSize[i].value)
              formDataCategoryD.set("fileImage", fileImages[i].files[0])
              formDataCategoryD.set("active", inpActiveCd[i].value)
              formDataCategoryD.set("category", categoryId)
              const categoryDetailid = typeCategory[i].getAttribute("category-detail-id")

              if (!categoryDetailid) {
                // Thêm mới form loại danh mục
                formDataCategoryD.delete("id")
                this.adminCategoriesService.addCategoryDetail(formDataCategoryD).subscribe((response: any) => {
                  if (response.status == '200') {

                  } else if (response.status == '401') {
                    alert("Lỗi khi thêm mới danh mục chi tiết! Vui lòng nhập lại")
                    this.resetForm(categoryId, index)
                  }
                })
              } else {
                // cập nhật form loại danh mục
                formDataCategoryD.set("id", categoryDetailid)
                this.adminCategoriesService.updateCategoryDetail(formDataCategoryD).subscribe((response: any) => {
                  if (response.status == '200') {

                  } else if (response.status == '401') {
                    alert("Lỗi khi thêm mới danh mục chi tiết! Vui lòng nhập lại")
                    this.resetForm(categoryId, index)
                    console.log(response)
                  }
                })
              }

              // thông báo và làm mới form khi lưu thay đổi
              if (i == typeCategory.length - 1) {
                setTimeout(() => {
                  btnSave.disabled = false
                  btnReset.disabled = false
                  btnSave.innerHTML = 'Lưu thay đổi'

                  var changeMessage: NodeListOf<HTMLElement> | null = document.querySelectorAll(".change-message")
                  if (changeMessage) {
                    changeMessage.forEach((e) => {
                      e.innerText = 'Cập nhật danh mục thành công !'
                      setTimeout(() => {
                        e.innerText = ''
                      }, 2000);
                    })
                  }
                  this.resetForm(categoryId, index)
                }, 2000);
              }
            }
          } else {
            btnSave.disabled = false
            btnSave.innerHTML = 'Lưu thay đổi'

            var changeMessage: NodeListOf<HTMLElement> | null = document.querySelectorAll(".change-message")
            if (changeMessage) {
              changeMessage.forEach((e) => {
                e.innerText = 'Cập nhật danh mục thành công !'
                setTimeout(() => {
                  e.innerText = ''
                }, 2000);
              })
            }
          }
        } else if (response.status == '401') {
          this.message = response
          btnSave.disabled = false
          btnSave.innerHTML = 'Lưu thay đổi'
        }
      })
    }
  }

  private validateForm(i: number) {
    const action: any = document.querySelectorAll(".action")[i]
    const inpForm: any = action.querySelectorAll(".inpForm")
    const inpNumber: any = action.querySelectorAll(".inpNumber")
    const oldType: any = action.querySelectorAll(".old-types")
    const inpImage: any = action.querySelectorAll(".inpImage")
    const uploadImages: any = action.querySelectorAll(".uploadImages")
    var check = true

    inpForm.forEach((event: any) => {
      if (event.value == '') {
        event.style.boxShadow = "0 0 0 2px lightcoral"
        check = false
      }
    })

    uploadImages.forEach((e: any, i: number) => {
      if (oldType.length && i > (oldType.length - 1)) {
        const index = i - (oldType.length)
        console.log(index)
        if (inpImage[index].files.length == 0) {
          e.style.border = 'solid 2px lightcoral'
          check = false
        }
      }
    })

    inpNumber.forEach((event: any) => {
      if (event.value < 0) {
        event.style.boxShadow = "0 0 0 2px lightcoral"
        check = false
      }
    })

    return check
  }

  private handleUploadImages(i: number) {
    const ctnImages: HTMLElement | any = document.querySelectorAll(".ctnImages")[i]
    const uploadImages: HTMLElement | any = document.querySelectorAll(".uploadImages")[i]
    const fileImages: HTMLElement | any = document.querySelectorAll(".fileImages")[i]
    const removeImages: HTMLElement | any = document.querySelectorAll(".removeImages")[i]

    const cloneUploadImages: any = this.cloneElement(uploadImages)
    const cloneFileImages: any = this.cloneElement(fileImages)
    const cloneRemoveImages: any = this.cloneElement(removeImages)

    cloneUploadImages?.addEventListener("click", () => {
      if (cloneFileImages) cloneFileImages.click()
    })

    // xóa hình
    cloneRemoveImages.addEventListener("click", () => {
      cloneFileImages.value = ''
      ctnImages.innerHTML = this.defaultSave[`ctnImage_${i}`]
      this.handleUploadImages(i)
    })

    if (cloneFileImages) {
      cloneFileImages.addEventListener("change", () => {
        const checkImage = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
        const maxSize = 10 * 1024 * 1024; // 10 MB

        if (cloneFileImages.files && cloneFileImages.files[0]) {
          if (cloneFileImages.files[0].size <= maxSize && checkImage.test(cloneFileImages.files[0].name)) {
            cloneUploadImages.style.border = 'solid 1px lightgray'
            cloneRemoveImages.style.display = "block"
            cloneUploadImages.src = URL.createObjectURL(cloneFileImages.files[0]);
          } else {
            cloneFileImages.value = ''
            ctnImages.innerHTML = this.defaultSave[`ctnImage_${i}`]
            this.message.images = 'Vui lòng chọn một hình ảnh có định dạng hợp lệ và kích thước không quá 10 MB.';
            this.handleUploadImages(i)
          }
        }
      })
    }
  }

  private resetForm(id: number, i: number) {
    const removeImage: HTMLElement | any = document.querySelectorAll(".removeImage")[i]
    const uploadImage: HTMLElement | any = document.querySelectorAll(".uploadImage")[i]
    const fileImage: HTMLElement | any = document.querySelectorAll(".fileImage")[i]
    const inpName: HTMLElement | any = document.querySelectorAll(".inpName")[i]
    const inpActive: HTMLElement | any = document.querySelectorAll(".inpActive")[i]
    const btnReset: HTMLElement | any = document.querySelectorAll(".btnReset")[i]
    const ctnTypes: HTMLElement | any = document.querySelectorAll(".ctnTypes")[i]

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

      this.adminCategoriesService.findAllCategoryDetailByCategory(id).subscribe((response: any) => {
        ctnTypes.innerHTML = ''
        for (let i = 0; i < response.length; i++) {
          ctnTypes.innerHTML += `<div class="typeId mt-2"></div>`
          ctnTypes.innerHTML += `<span>Mã số: ${response[i].id}</span>`
          var typeCategory: any = document.createElement("div")
          typeCategory.setAttribute("class", "type-category old-types")
          typeCategory.setAttribute("category-detail-id", response[i].id)
          typeCategory.style = "display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;"

          typeCategory.innerHTML += `
            <div class="form-group">
              <label>Tên loại của danhh mục</label>
              <input type="text" value="${response[i].size}" class="form-control inpForm inpSize">
            </div>

            <div class="form-group mx-3">
              <label>Hình ảnh</label>
              <div class="ctnImages" style="position: relative; display: flex; justify-content: flex-end; width: 66px; height: 66px;">
                <i class="fa-solid fa-x removeImages" style="display: none; font-size: 12px; position: absolute; color: gray; cursor: pointer; padding: 2px; background-color: white; opacity: 0.8;"></i>
                <img class="uploadImages" src="${response[i].imageUrl}" width="100%" height="100%" style="cursor: pointer; border: solid 1px lightgray;">
              </div>
              <input type="file" class="fileImages" style="display: none;">
            </div>
          `
          typeCategory.innerHTML += (response[i].active == true) ?
            '<div class="form-group mx-3"><label>Trạng thái</label><select class="form-select inpForm inpActiveCd"><option value="true">Hoạt động</option><option value="false">Bị khóa</option></select></div>' :
            '<div class="form-group mx-3"><label>Trạng thái</label><select class="form-select inpForm inpActiveCd"><option value="true">Hoạt động</option><option value="false" selected>Bị khóa</option></select></div>'
          ctnTypes.appendChild(typeCategory)

          const ctnImages: HTMLElement | any = document.querySelectorAll(".ctnImages")[i]
          this.defaultSave[`ctnImage_${i}`] = ctnImages.innerHTML
        }

        const inpForm = document.querySelectorAll(".inpForm")
        inpForm.forEach((event: any) => {
          event.addEventListener("focus", () => {
            event.style.boxShadow = '0 0 0 2px rgb(255, 222, 170)'
            event.style.borderColor = 'rgb(255, 222, 170)'
          })
          event.addEventListener("blur", () => {
            event.style.boxShadow = 'none'
            event.style.borderColor = 'lightgray'
          })
        })

        const ctnImages: any = document.querySelectorAll(".ctnImages")
        for (let i = 0; i < ctnImages.length; i++) {
          this.handleUploadImages(i)
        }
      })
      this.categories[i].imageUrl = response.category.imageUrl
      this.categories[i].name = response.category.name
      this.categories[i].active = response.category.active
      this.message = {}

      btnReset.disabled = false
      btnReset.innerHTML = 'Khôi phục'
    })

  }

  private delete(id: number, i: number) {
    Swal.fire({
      text: `Bạn chắc muốn xóa danh mục này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          this.adminCategoriesService.delete(id).subscribe((response: any) => {
            if (response.status == "200") {
              Swal.fire({
                text: "Xóa danh mục thành công.",
                icon: "success",
                confirmButtonText: "Đồng ý",
              });
              // tắt bảng xem danh mục chi tiết
              var rowSeeDetail: any = document.querySelectorAll(".tr-categoryupdateForm")[i]
              var seeDetail: any = document.querySelectorAll(".see-detail")[i]
              var flagSeeDetail = seeDetail.querySelector("i").getAttribute("flag")

              if (flagSeeDetail) {
                if (flagSeeDetail == 'false') {
                  seeDetail.innerHTML = '<i class="fa-solid fa-eye" flag="true"></i> Xem'
                  seeDetail.style.backgroundColor = 'green'
                  rowSeeDetail.nextSibling.remove()
                }
              }

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
    const inpImage = document.querySelectorAll(".inpImage")

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
