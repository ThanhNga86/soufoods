import { AccountService } from './../../../services/account/account.service';
import { UserAuthService } from './../../../services/auth/user-auth.service';
import { AddressService } from './../../../services/address/address.service';
import { AdminCategoriesService } from 'src/app/services/admin/admin-categories.service';
import { ImagesService } from './../../../services/image/images.service';
import { AdminProductsService } from './../../../services/admin/admin-products.service';
import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = []
  categories: any[] = []
  categoryDetails: any[] = []
  arrImages: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  message: any = {}
  defaultSave: any = {}
  filters: any = {
    flag: false,
    pageNumber: 1,
    search: null,
    quantity: null,
    discount: null,
    active: null,
    activePd: null,
    categoryId: null,
    categoryDetailId: null
  }

  constructor(private adminProductsService: AdminProductsService, private imagesService: ImagesService, private adminCategoriesService: AdminCategoriesService) { }

  ngOnInit(): void {
    this.handleFilter()

    this.findAll()

    // Lấy tất cả dữ liệu của categories
    this.adminCategoriesService.findAllCategory().subscribe((response: any) => {
      this.categories = response
    })

    // Lấy tất cả dữ liệu của category detail
    this.adminCategoriesService.findAllCategoryDetail().subscribe((response: any) => {
      this.categoryDetails = response
    })
  }

  private resetFunctions() {
    var loadDataTime = setInterval(() => {
      // Ẩn - hiện chi tiết sản phẩm
      const seeDetail: HTMLElement | any = document.querySelectorAll(".see-detail")
      for (let i = 0; i < seeDetail.length; i++) {
        const cloneElement = this.cloneElement(seeDetail[i])
        cloneElement.addEventListener("click", () => {
          this.seeDetail(i)
        })
      }

      // Hiển thị tất cả các hình ảnh
      this.showAndHiddenImages()

      // Hiển thị form cập nhật dữ liệu
      const edit: HTMLElement | any = document.querySelectorAll(".edit")
      const flagEdit = new Array()
      for (let i = 0; i < edit.length; i++) {
        flagEdit.push(true)
        const cloneElement = this.cloneElement(edit[i])
        cloneElement.addEventListener("click", () => {
          const id = edit[i].getAttribute("id")
          if (flagEdit[i]) {
            this.edit(id, i)
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

      // Xóa sản phẩm
      const remove: HTMLElement | any = document.querySelectorAll(".remove")
      for (let i = 0; i < remove.length; i++) {
        const cloneElement = this.cloneElement(remove[i])
        cloneElement.addEventListener("click", () => {
          const id = remove[i].getAttribute("id")
          this.delete(id, i)
        })
      }

      // Xử lý phần xem nhiều hình ảnh
      if (this.total > 0) {
        clearInterval(loadDataTime)
      } else {
        clearInterval(loadDataTime)
      }
    }, 200)
  }

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
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
          <input class="form-check-input input-filter" id="active-product" type="checkbox" key="active" value-checked="true" value-unchecked="false" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active-product" style="user-select: none;">Trạng thái sản phẩm</label>
          <span class="label-filter"></span>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="active-productDetail" type="checkbox" key="activePd" value-checked="true" value-unchecked="false" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active-productDetail" style="user-select: none;">Trạng thái sản phẩm chi tiết</label>
          <span class="label-filter"></span>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="active-quantity" type="checkbox" key="quantity" value-checked="1" value-unchecked="0" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active-quantity" style="user-select: none;">Trạng thái lượng hàng</label>
          <span class="label-filter"></span>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="active-discount" type="checkbox" key="discount" value-checked="1" value-unchecked="0" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active-discount" style="user-select: none;">Trạng thái giá khuyến mãi</label>
          <span class="label-filter"></span>
        </div>
      `

      this.adminCategoriesService.findAllCategory().subscribe((response: any) => {
        const filterCategory: any = document.createElement('select');
        filterCategory.classList.add('form-select', 'formFilterCategory');
        filterCategory.style.boxShadow = 'none'
        filterCategory.innerHTML += `
          <select class="form-select filterCategory">
          <option value="null">Chọn danh mục sản phẩm</option>
        `
        for (let i = 0; i < response.length; i++) {
          filterCategory.innerHTML += `
            <option value="${response[i].id}">${response[i].name}</option>
          `
        }
        filterTable.appendChild(filterCategory);

        // lọc danh mục sản phẩm
        filterCategory.addEventListener("change", () => {
          var optionFirst = filterCategory.querySelectorAll("option")[0]
          optionFirst.innerHTML = filterCategory.value == 'null' ? 'Chọn danh mục sản phẩm' : 'Tắt lọc'
          this.filters.categoryId = filterCategory.value
          this.filters.categoryDetailId = null
          this.filters.flag = true
          this.setPageNumber(1)

          // lọc danh mục chi tiết
          const formFilterCategoryDetail = document.querySelector(".formFilterCategoryDetail")
          if (formFilterCategoryDetail) {
            formFilterCategoryDetail.remove()
          }

          if (filterCategory.value != 'null') {
            this.adminCategoriesService.findAllCategoryDetailByCategory(filterCategory.value).subscribe((response: any) => {
              const filterCategoryDetail = document.createElement('select');
              filterCategoryDetail.classList.add('form-select', 'formFilterCategoryDetail', 'mt-2');
              filterCategoryDetail.style.boxShadow = 'none'
              filterCategoryDetail.innerHTML += `
                  <select class="form-select filterCategoryDetail">
                  <option value="null">Chọn loại danh mục sản phẩm</option>
                `
              for (let i = 0; i < response.length; i++) {
                filterCategoryDetail.innerHTML += `
                  <option value="${response[i].id}">${response[i].size}</option>
                `
              }
              filterTable.appendChild(filterCategoryDetail);

              filterCategoryDetail.addEventListener("change", () => {
                var optionFirst = filterCategoryDetail.querySelectorAll("option")[0]
                optionFirst.innerHTML = filterCategoryDetail.value == 'null' ? 'Chọn loại danh mục sản phẩm' : 'Tắt lọc'
                this.filters.categoryDetailId = filterCategoryDetail.value
                this.filters.flag = true
                this.setPageNumber(1)
              })
            })
          } else {
            if (formFilterCategoryDetail) {
              formFilterCategoryDetail.remove()
            }
            this.filters.categoryDetailId = null
            this.filters.flag = true
            this.setPageNumber(1)
          }
        })
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
    const table: HTMLElement | any = document.querySelector(".table-products")
    const row: HTMLElement | any = table.querySelectorAll("tr")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminProductsService.filter(this.filters).subscribe((response: any) => {
      for (let i = 0; i < response.products.length; i++) {
        this.imagesService.findAllByProduct(response.products[i].id).subscribe((responseImages: any) => {
          response.products[i].images = responseImages
          if (i == response.products.length - 1) {
            this.products = response.products
          }
        })
      }
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

  private findAll() {
    const sizePage = 10
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-products")
    const row: HTMLElement | any = table.querySelectorAll("tr")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminProductsService.findAll(this.pageNumber, sizePage).subscribe((response: any) => {
      for (let i = 0; i < response.products.length; i++) {
        this.imagesService.findAllByProduct(response.products[i].id).subscribe((responseImages: any) => {
          response.products[i].images = responseImages
          if (i == response.products.length - 1) {
            this.products = response.products
          }
        })
      }
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

  private showAndHiddenImages() {
    const viewDetailImage = document.querySelectorAll(".viewDetailImage")

    for (let i = 0; i < viewDetailImage.length; i++) {
      viewDetailImage[i].addEventListener("click", () => {
        showHiddenImage("show", i)
      })
    }

    const closeImages = document.querySelectorAll(".hidden-detailImage")
    for (let i = 0; i < closeImages.length; i++) {
      closeImages[i].addEventListener("click", () => {
        showHiddenImage("hidden", i)
      })
    }

    const showImages = document.querySelectorAll(".show-images")
    for (let i = 0; i < showImages.length; i++) {
      showImages[i].addEventListener("click", (e: any) => {
        if (e.target.classList.contains('row')) {
          showHiddenImage("hidden", i)
        }
      })
    }

    const showDetailImages = document.querySelectorAll(".show-detailImage")
    for (let i = 0; i < showDetailImages.length; i++) {
      showDetailImages[i].addEventListener("click", () => {
        showHiddenImage("hidden", i)
      })
    }

    function showHiddenImage(action: any, i: number) {
      const showDetailImage: any = document.querySelectorAll(".show-detailImage")
      const showImage: any = document.querySelectorAll(".show-images")

      if (action == 'show') {
        showDetailImage[i].style.display = 'block'
        showImage[i].style.display = 'block'
        document.body.style.overflow = 'hidden'
      } else {
        showDetailImage[i].style.display = 'none'
        showImage[i].style.display = 'none'
        document.body.style.overflow = 'auto'
      }
    }
  }

  private seeDetail(i: number) {
    const seeDetail: any = document.querySelectorAll(".see-detail")[i]
    const icon: any = seeDetail.querySelector("i")
    const detailRow = seeDetail.parentNode.parentNode.parentNode

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
        <div style="text-align: left; background-color: ${color};">
          <h5>Mô tả sản phẩm</h5>
          ${this.products[i].describes}
        </div>
      `

      newCell.innerHTML += `
        <h5 style="text-align: left; background-color: ${color};">Size</h5>
      `
      var table = document.createElement('table');
      table.classList.add('table', 'table-bordered', 'mt-1', 'text-center');
      table.style.backgroundColor = color
      table.innerHTML = `
        <tr>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Mã số</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Tên loại</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Số lượng</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Trạng thái</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Giá gốc</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Giảm giá</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">Giá sản phẩm</th>
          <th style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;"></th>
        </tr>
      `;
      this.adminProductsService.findAllProductDetailByProduct(this.products[i].id).subscribe((response: any) => {
        for (let i = 0; i < response.length; i++) {
          table.innerHTML += `
            <tr>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${response[i].id}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${response[i].size}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse; width: 120px;">
                ${response[i].quantity == 0 ? '<div style="margin: 2px; padding: 2px; border-radius: 6px; background-color: lightcoral; white-space: nowrap; color: white; user-select: none; font-size: 14px;">Hết hàng</div>' : Number(response[i].quantity).toLocaleString("vi-VN")}
              </td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">
                ${response[i].active ? '<span style="margin: 2px; padding: 2px 4px; border-radius: 6px; background-color: rgb(89, 255, 47); white-space: nowrap; color: white; user-select: none;">Đang bán</span>' : '<span style="margin: 2px; padding: 2px 4px; border-radius: 6px; background-color: lightcoral; white-space: nowrap; color: white; user-select: none;">Ngừng bán</span>'}
              </td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${Number(response[i].price).toLocaleString("vi-VN")} đ</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${response[i].discount == 0 ? '' : response[i].discount + '%'}</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">${Number(response[i].price * (100 - response[i].discount) / 100).toLocaleString("vi-VN")} đ</td>
              <td style="background-color: ${color}; border: solid 1px white; border-collapse: collapse;">
                <span class="removeProductD" id="${response[i].id}" style="margin: 2px; padding: 3px 6px; border-radius: 6px; background-color: lightcoral; white-space: nowrap; color: white; user-select: none; cursor: pointer;"><i class="fa-regular fa-trash-can"></i> Xóa</span>
              </td>
            </tr>
          `
        }
        newCell.appendChild(table);
        detailRow.parentNode.insertBefore(newRow, detailRow.nextSibling);

        // Xóa sản phẩm chi tiết
        const removeProductD = document.querySelectorAll(".removeProductD")
        for (let i = 0; i < removeProductD.length; i++) {
          const cloneElement = this.cloneElement(removeProductD[i])
          cloneElement.addEventListener("click", () => {
            const id: any = cloneElement.getAttribute("id")
            const row = cloneElement.parentNode?.parentNode
            if (id) {
              this.deleteProductD(id, row)
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

  public setPageNumber(pageNumber: number) {
    const rowSeeDetail: HTMLElement | any = document.querySelectorAll(".row-see-detail")

    const tr = document.querySelectorAll(".tr-productupdateForm")
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

    // Xóa tất cả bảng xem chi tiết sản phẩm
    for (let i = 0; i < rowSeeDetail.length; i++) {
      rowSeeDetail[i].remove()
    }
  }

  public edit(id: number, i: number) {
    // Chuyển đổi input describes <br> thành \n
    this.products[i].describes = this.products[i].describes.replaceAll('<br>', '\n')

    // Xử lý phần hình đại diện
    const fileImage: HTMLElement | any = document.querySelectorAll(".fileImage")[i]
    const uploadImage: HTMLElement | any = document.querySelectorAll(".uploadImage")[i]
    const removeImage: HTMLElement | any = document.querySelectorAll(".removeImage")[i]

    this.defaultSave.image = uploadImage.src
    this.defaultSave.oldImage = uploadImage.getAttribute("old-image")

    uploadImage.addEventListener("click", () => {
      if (fileImage) {
        fileImage.click();
      }
    })

    // xóa hình đại diện
    removeImage.addEventListener("click", () => {
      fileImage.value = ''
      uploadImage.src = this.defaultSave.image
      uploadImage.setAttribute("old-image", this.defaultSave.oldImage)
      removeImage.style.display = 'none'
    })

    if (fileImage) {
      fileImage.addEventListener("change", () => {
        const checkImage = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
        const maxSize = 10 * 1024 * 1024; // 10 MB
        if (fileImage.files && fileImage.files[0]) {
          if (fileImage.files[0].size <= maxSize && checkImage.test(fileImage.files[0].name)) {
            uploadImage.removeAttribute("old-image")
            removeImage.style.display = "block"
            uploadImage.src = URL.createObjectURL(fileImage.files[0]);
            this.message.image = ''
          } else {
            removeImage.style.display = "none"
            fileImage.value = ''
            uploadImage.src = this.defaultSave.image
            this.message.image = 'Vui lòng chọn một hình ảnh có định dạng hợp lệ và kích thước không quá 10 MB.';
          }
        }
      })
    }

    // Xử lý phần nhiều hình ảnh
    const fileImages: any = document.querySelectorAll(".fileImages")[i]
    const uploadImages: any = document.querySelectorAll(".uploadImages")[i]
    const ctnImages: any = document.querySelectorAll(".ctnImages")[i]
    const checkImage = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    const maxSize = 10 * 1024 * 1024; // 10 MB
    var flagFile = true

    uploadImages.addEventListener("click", () => {
      if (fileImages) {
        fileImages.click()
      }
    })

    // Xóa nhiều hình phần mặc định
    const removeImages = () => {
      const btnClose = document.querySelectorAll(".btn-close")
      btnClose.forEach((event: any) => {
        event.addEventListener("click", () => {
          var showImage = event.parentNode
          showImage.remove()
          for (let i = 0; i < this.arrImages.length; i++) {
            if (this.arrImages[i].id == showImage.id) {
              this.arrImages.splice(i, 1)
              break;
            }
          }
        })
      })
    }
    removeImages()

    if (fileImages) {
      fileImages.addEventListener("change", () => {
        if (fileImages.files && fileImages.files[0]) {
          for (let i = 0; i < fileImages.files.length; i++) {
            if (fileImages.files[i].size <= maxSize && checkImage.test(fileImages.files[i].name)) {
              var showImage: HTMLElement | any = document.createElement("div");
              showImage.style = `position: relative; display: flex; justify-content: flex-end; width: 100px; height: 100px; padding: 3px;`
              var rdNumber = Math.floor(Math.random() * 100000)
              const rdId = String(new Date().getTime()).substring(8) + rdNumber
              showImage.setAttribute("id", rdId)
              showImage.innerHTML = `
                <button type="button" class="btn-close" aria-label="Close" style="width: 8px; height: 8px; background-color: white; position: absolute;"></button>
                <img width="100%">
              `
              ctnImages.appendChild(showImage);
              showImage.querySelector("img").src = URL.createObjectURL(fileImages.files[i]);
              this.arrImages.push({
                id: showImage.id,
                files: fileImages.files[i]
              })

              flagFile = true
            } else {
              flagFile = false;
            }
          }

          if (!flagFile) {
            this.message.images = 'Vui lòng chọn một hình ảnh có định dạng hợp lệ và kích thước không quá 10 MB.'
          }
        }

        // Xóa nhiều hình
        removeImages()
      })
    }

    // Xử lý phần thay đổi category detail
    const category: any = document.querySelectorAll(".category")[i]
    const categoryDetail: any = document.querySelectorAll(".categoryDetail")[i]

    category.addEventListener("change", () => {
      categoryDetail.innerHTML = ""
      this.adminCategoriesService.findAllCategoryDetailByCategory(category.value).subscribe((response: any) => {
        for (let i = 0; i < response.length; i++) {
          categoryDetail.innerHTML += `
            <option value="" hidden>Chọn loại danh mục sản phẩm</option>
            <option value="${response[i].id}">${response[i].size}</option>
          `
        }
      })
    })

    // Xử lý phần thêm form Type
    const ctnTypes: HTMLElement | any = document.querySelectorAll(".ctnTypes")[i]
    const addFormType: HTMLElement | any = document.querySelectorAll(".addFormType")[i]

    this.adminProductsService.findAllProductDetailByProduct(id).subscribe((response: any) => {
      ctnTypes.innerHTML = ''
      for (let i = 0; i < response.length; i++) {
        ctnTypes.innerHTML += `<div class="typeId mt-2"></div>`
        ctnTypes.innerHTML += `<span>Mã số: ${response[i].id}</span>`
        ctnTypes.innerHTML += (response[i].quantity == 0) ? '<span class="outStock" style="margin-left: 3px; background-color: lightcoral; color: white; user-select: none; border-radius: 3px; white-space: nowrap;">Hết hàng</span>' : '<span class="outStock" style="margin-left: 3px; background-color: lightcoral; color: white; user-select: none; border-radius: 3px; white-space: nowrap;"></span>'
        var typeProduct: any = document.createElement("div")
        typeProduct.setAttribute("class", "type-product old-types")
        typeProduct.setAttribute("product-detail-id", response[i].id)
        typeProduct.style = "display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;"

        typeProduct.innerHTML += `
          <div class="form-group">
            <label>Tên loại của sản phẩm</label>
            <input type="text" value="${response[i].size}" class="form-control inpForm inpSize">
          </div>

          <div class="form-group mx-4">
            <label>Giá gốc</label>
            <input type="number" value="${response[i].price}" class="form-control inpForm inpNumber inpPrice">
            <span class="pricePromotional">Giá bán: ${Number(response[i].price * (100 - response[i].discount) / 100).toLocaleString("vi-VN")} đ</span>
          </div>

          <div class="form-group">
            <label>Số lượng</label>
            <input type="number" value="${Number(response[i].quantity).toLocaleString("vi-VN")}" class="form-control inpForm inpNumber inpQuantity">
          </div>

          <div class="form-group mx-4">
            <label>Khuyến mãi</label>
            <input type="number" value="${response[i].discount}" class="form-control inpForm inpNumber inpDiscount" value="0">
            <span class="pricePromotional"></span>
          </div>
        `
        typeProduct.innerHTML += (response[i].active == true) ?
          '<div class="form-group"><label>Trạng thái</label><select class="form-select inpForm inpActivePd"><option value="true">Đang bán</option><option value="false">Ngừng bán</option></select></div>' :
          '<div class="form-group"><label>Trạng thái</label><select class="form-select inpForm inpActivePd"><option value="true">Đang bán</option><option value="false" selected>Ngừng bán</option></select></div>'
        ctnTypes.appendChild(typeProduct)
      }

      // mặc định
      const actionFormType = () => {
        // xóa form type
        const removeFormType = document.querySelectorAll(".removeFormType")
        const typeId = document.querySelectorAll(".typeId")
        const outStock = document.querySelectorAll(".outStock")

        removeFormType.forEach((event, i) => {
          const cloneElement = this.cloneElement(event)
          cloneElement.addEventListener("click", () => {
            const oldTypes = document.querySelectorAll(".old-types")
            var formType: any = cloneElement.parentNode?.parentNode
            i += oldTypes.length

            if (outStock[i] && typeId[i]) {
              outStock[i].remove()
              typeId[i].remove()
            }
            formType.remove()

            const typeProduct: any = ctnTypes.querySelectorAll(".type-product")
            if (typeProduct.length <= 0) {
              addFormType.click()
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

        const inpNumber: any = document.querySelectorAll(".inpNumber")
        inpNumber.forEach((event: any) => {
          event.addEventListener("blur", () => {
            if (event.value < 0) {
              event.style.boxShadow = "0 0 0 2px lightcoral"
            } else {
              event.style.boxShadow = "none"
            }
          })
        })

        // thay đổi giá khuyến mãi
        const inpDiscount = document.querySelectorAll(".inpDiscount")
        inpDiscount.forEach((event: any) => {
          event.addEventListener("input", () => {
            if (event.value < 0) {
              event.value = 0
            }

            const inpPrice = event.parentNode.parentNode.querySelector(".inpPrice")
            const pricePromotional = event.parentNode.parentNode.querySelector(".pricePromotional")
            if (inpPrice.value != '' && event.value != '') {
              pricePromotional.innerHTML = `Giá bán: ${Number(inpPrice.value * (100 - event.value) / 100).toLocaleString("vi-VN")} đ`
            } else {
              pricePromotional.innerHTML = ''
            }
          })

          event.addEventListener("blur", () => {
            const inpPrice = event.parentNode.parentNode.querySelector(".inpPrice")
            const pricePromotional = event.parentNode.parentNode.querySelector(".pricePromotional")
            if (event.value == '' || event.value <= 0) {
              event.value = 0
              event.style.boxShadow = 'none'
              pricePromotional.innerHTML = `Giá bán: ${Number(inpPrice.value * (100 - event.value) / 100).toLocaleString("vi-VN")} đ`
            }
          })
        })

        const inpPrice = document.querySelectorAll(".inpPrice")
        inpPrice.forEach((event: any) => {
          event.addEventListener("input", () => {
            const inpDiscount = event.parentNode.parentNode.querySelector(".inpDiscount")
            const pricePromotional = event.parentNode.parentNode.querySelector(".pricePromotional")
            if (event.value > 0 && event.value != '' && inpDiscount.value >= 0) {
              pricePromotional.innerHTML = `Giá bán: ${Number(event.value * (100 - inpDiscount.value) / 100).toLocaleString("vi-VN")} đ`
            } else {
              pricePromotional.innerHTML = ''
            }
          })
        })

        const inpQuantity = document.querySelectorAll(".inpQuantity")
        inpQuantity.forEach((event: any, i: number) => {
          event.addEventListener("input", () => {
            if (event.value == 0 && event.value != '') {
              outStock[i].innerHTML = 'Hết hàng'
            } else {
              outStock[i].innerHTML = ''
            }
          })
        })
      }
      actionFormType()

      // có sự kiện thêm form type
      addFormType.addEventListener("click", () => {
        var newDiv: any = document.createElement("div")
        newDiv.setAttribute("class", "typeId mt-3")
        var newOutStock: any = document.createElement("span")
        newOutStock.setAttribute("class", "outStock")
        newOutStock.style = "background-color: lightcoral; color: white; user-select: none; border-radius: 3px; white-space: nowrap;"

        var typeProduct: any = document.createElement("div")
        typeProduct.setAttribute("class", "type-product")
        typeProduct.style = "display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;"
        typeProduct.innerHTML += `
            <div class="form-group">
              <label>Tên loại của sản phẩm</label>
              <input type="text" class="form-control inpForm inpSize">
            </div>

            <div class="form-group mx-4">
              <label>Giá gốc</label>
              <input type="number" class="form-control inpForm inpNumber inpPrice">
              <span class="pricePromotional"></span>
            </div>

            <div class="form-group">
              <label>Số lượng</label>
              <input type="number" class="form-control inpForm inpNumber inpQuantity">
            </div>

            <div class="form-group mx-4">
              <label>Khuyến mãi</label>
              <input type="number" class="form-control inpForm inpNumber inpDiscount" value="0">
            </div>

            <div class="form-group" style="margin-right: 20px;">
              <label>Trạng thái</label>
              <select class="form-select inpForm inpActivePd">
                <option value="true">Đang bán</option>
                <option value="false">Ngừng bán</option>
              </select>
            </div>

            <div class="form-group mt-3">
              <i class="fa-solid fa-trash-can removeFormType" style="padding: 10px; background-color: lightcoral; border: none; color: white; user-select: none; cursor: pointer; border-radius: 10px; white-space: nowrap; font-size: 20px;"></i>
            </div>
        `
        ctnTypes.appendChild(newDiv)
        ctnTypes.appendChild(newOutStock)
        ctnTypes.appendChild(typeProduct)

        actionFormType()
      })
    })
  }

  private update(i: number) {
    const formData = new FormData()
    const btnSave: any = document.querySelectorAll(".btnSave")[i]
    const btnReset: any = document.querySelectorAll(".btnReset")[i]
    const inpId: any = document.querySelectorAll(".inpId")[i]
    const inpName: any = document.querySelectorAll(".inpName")[i]
    const fileImage: any = document.querySelectorAll(".fileImage")[i]
    const updateForm = document.querySelectorAll(".updateForm")[i]
    const imgsP = updateForm.querySelectorAll(".imgsP")
    const inpTypeP: any = document.querySelectorAll(".inpTypeP")[i]
    const inpDescribes: any = document.querySelectorAll(".inpDescribes")[i]
    const ctnTypes: any = document.querySelectorAll(".ctnTypes")[i]
    const typeProduct: any = ctnTypes.querySelectorAll(".type-product")
    const inpSize: any = ctnTypes.querySelectorAll(".inpSize")
    const inpPrice: any = ctnTypes.querySelectorAll(".inpPrice")
    const inpQuantity: any = ctnTypes.querySelectorAll(".inpQuantity")
    const inpDiscount: any = ctnTypes.querySelectorAll(".inpDiscount")
    const inpActivePd: any = ctnTypes.querySelectorAll(".inpActivePd")
    const categoryDetail: any = document.querySelectorAll(".categoryDetail")[i]
    const inpActive: any = document.querySelectorAll(".inpActive")[i]
    const index = i

    if (this.validateForm(i)) {
      btnSave.disabled = true
      btnReset.disabled = true
      btnSave.innerHTML = '<span class="loader2"></span> Lưu thay đổi'

      formData.append("id", inpId.value)
      formData.append("name", inpName.value.trim())
      for (let i = 0; i < imgsP.length; i++) {
        const oldImage: any = imgsP[i].getAttribute("old-image")
        if (oldImage) {
          formData.append("oldImages", oldImage)
        } else {
          formData.append("oldImages", "removeAll")
        }
      }
      formData.append("fileImage", fileImage.files[0])
      for (let i = 0; i < this.arrImages.length; i++) {
        formData.append("fileImages", this.arrImages[i].files)
      }
      formData.append("type", inpTypeP.value.trim())
      formData.append("describes", inpDescribes.value.replaceAll(/\n/g, "<br>").trim())
      formData.append("active", inpActive.value)
      formData.append("categoryDetail", categoryDetail.value)

      // tắt bảng xem sản phẩm chi tiết
      var rowSeeDetail: any = document.querySelectorAll(".tr-productupdateForm")[i]
      var seeDetail: any = document.querySelectorAll(".see-detail")[i]
      var flagSeeDetail = seeDetail.querySelector("i").getAttribute("flag")

      if (flagSeeDetail) {
        if (flagSeeDetail == 'false') {
          seeDetail.innerHTML = '<i class="fa-solid fa-eye" flag="true"></i> Xem'
          seeDetail.style.backgroundColor = 'green'
          rowSeeDetail.nextSibling.remove()
        }
      }

      this.adminProductsService.update(formData).subscribe((response: any) => {
        if (response.status == '200') {
          const productId = response.productId
          const formDataProductD = new FormData()

          if (typeProduct.length) {
            for (let i = 0; i < typeProduct.length; i++) {
              formDataProductD.set("size", inpSize[i].value.trim())
              formDataProductD.set("price", inpPrice[i].value)
              formDataProductD.set("quantity", inpQuantity[i].value)
              formDataProductD.set("discount", inpDiscount[i].value)
              formDataProductD.set("product", productId)
              formDataProductD.set("active", inpActivePd[i].value)
              const productDetailid = typeProduct[i].getAttribute("product-detail-id")

              if (!productDetailid) {
                // Thêm mới form loại sản phẩm
                formDataProductD.delete("id")
                this.adminProductsService.addProductDetail(formDataProductD).subscribe((response: any) => {
                  if (response.status == '200') {

                  } else if (response.status == '401') {
                    alert("Lỗi khi thêm mới sản phẩm chi tiết! Vui lòng nhập lại")
                    this.resetForm(productId, index)
                  }
                })
              } else {
                // cập nhật form loại sản phẩm
                formDataProductD.set("id", productDetailid)
                this.adminProductsService.updateProductDetail(formDataProductD).subscribe((response: any) => {
                  if (response.status == '200') {

                  } else if (response.status == '401') {
                    alert("Lỗi khi thêm mới sản phẩm chi tiết! Vui lòng nhập lại")
                    this.resetForm(productId, index)
                  }
                })
              }

              // thông báo và làm mới form khi lưu thay đổi
              if (i == typeProduct.length - 1) {
                setTimeout(() => {
                  var changeMessage: NodeListOf<HTMLElement> | null = document.querySelectorAll(".change-message")
                  if (changeMessage) {
                    changeMessage.forEach((e) => {
                      e.innerText = 'Cập nhật sản phẩm thành công !'
                      setTimeout(() => {
                        e.innerText = ''
                      }, 2000);
                    })
                  }
                  btnSave.disabled = false
                  btnReset.disabled = false
                  btnSave.innerHTML = 'Lưu thay đổi'
                  this.resetForm(productId, index)
                }, 1000);

              }
            }
          } else {
            btnSave.disabled = false
            btnSave.innerHTML = 'Lưu thay đổi'

            var changeMessage: NodeListOf<HTMLElement> | null = document.querySelectorAll(".change-message")
            if (changeMessage) {
              changeMessage.forEach((e) => {
                e.innerText = 'Cập nhật sản phẩm thành công !'
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
    const inpForm = action.querySelectorAll(".inpForm")
    const inpNumber: any = action.querySelectorAll(".inpNumber")
    var check = true

    inpForm.forEach((event: any) => {
      if (event.value == '') {
        event.style.boxShadow = "0 0 0 2px lightcoral"
        check = false
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

  private resetForm(id: number, i: number) {
    const inpName: HTMLElement | any = document.querySelectorAll(".inpName")[i]
    const removeImage: HTMLElement | any = document.querySelectorAll(".removeImage")[i]
    const uploadImage: HTMLElement | any = document.querySelectorAll(".uploadImage")[i]
    const fileImage: HTMLElement | any = document.querySelectorAll(".fileImage")[i]
    const fileImages: HTMLElement | any = document.querySelectorAll(".fileImages")[i]
    const ctnImages = document.querySelectorAll(".ctnImages")[i]
    const inpTypeP: any = document.querySelectorAll(".inpTypeP")[i]
    const inpDescribes: any = document.querySelectorAll(".inpDescribes")[i]
    const ctnTypes: any = document.querySelectorAll(".ctnTypes")[i]
    const category: any = document.querySelectorAll(".category")[i]
    const categoryDetail: any = document.querySelectorAll(".categoryDetail")[i]
    const inpActive: HTMLElement | any = document.querySelectorAll(".inpActive")[i]
    const btnReset: HTMLElement | any = document.querySelectorAll(".btnReset")[i]

    btnReset.disabled = true
    btnReset.innerHTML = '<span class="loader2"></span> Khôi phục'

    this.adminProductsService.findById(id).subscribe((response: any) => {
      const product = response.product
      inpName.value = product.name
      fileImage.value = ''
      removeImage.style.display = 'none'
      uploadImage.src = product.imageUrl
      fileImages.value = ''
      this.arrImages = []

      this.imagesService.findAllByProduct(product.id).subscribe((responseImages: any) => {
        this.products[i].images = responseImages
        ctnImages.innerHTML = ''
        var length = 0
        for (let image of this.products[i].images) {
          ctnImages.innerHTML += `
            <div class="show-image" style="position: relative; display: flex; justify-content: flex-end; width: 100px; height: 100px; padding: 3px;">
              <button type="button" class="btnRmImage btn-close" style="width: 8px; height: 8px; background-color: white; position: absolute;" aria-label="Close"></button>
              <img class="imgsP" old-image="${image.name}" src="${image.url}" width="100%">
            </div>
          `

          if (length == this.products[i].images.length - 1) {
            // Xóa nhiều hình ảnh
            const btnClose = document.querySelectorAll(".btn-close")
            btnClose.forEach((event) => {
              const cloneElement: any = this.cloneElement(event)
              cloneElement.addEventListener("click", () => {
                var showImage = cloneElement.parentNode
                showImage.remove()
                for (let i = 0; i < this.arrImages.length; i++) {
                  if (this.arrImages[i].id == showImage.id) {
                    this.arrImages.splice(i, 1)
                    break;
                  }
                }
              })
            })
          }
          length++
        }

        this.adminProductsService.findAllProductDetailByProduct(id).subscribe((response: any) => {
          ctnTypes.innerHTML = ''
          for (let i = 0; i < response.length; i++) {
            ctnTypes.innerHTML += `<div class="typeId mt-2"></div>`
            ctnTypes.innerHTML += `<span>Mã số: ${response[i].id}</span>`
            ctnTypes.innerHTML += (response[i].quantity == 0) ? '<span class="outStock" style="margin-left: 3px; background-color: lightcoral; color: white; user-select: none; border-radius: 3px; white-space: nowrap;">Hết hàng</span>' : '<span class="outStock" style="margin-left: 3px; background-color: lightcoral; color: white; user-select: none; border-radius: 3px; white-space: nowrap;"></span>'
            var typeProduct: any = document.createElement("div")
            typeProduct.setAttribute("class", "type-product old-types")
            typeProduct.setAttribute("product-detail-id", response[i].id)
            typeProduct.style = "display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;"

            typeProduct.innerHTML += `
              <div class="form-group">
                <label>Tên loại của sản phẩm</label>
                <input type="text" value="${response[i].size}" class="form-control inpForm inpSize">
              </div>

              <div class="form-group mx-4">
                <label>Giá gốc</label>
                <input type="number" value="${response[i].price}" class="form-control inpForm inpNumber inpPrice">
                <span class="pricePromotional">Giá bán: ${Number(response[i].price * (100 - response[i].discount) / 100).toLocaleString("vi-VN")} đ</span>
              </div>

              <div class="form-group">
                <label>Số lượng</label>
                <input type="number" value="${Number(response[i].quantity).toLocaleString("vi-VN")}" class="form-control inpForm inpNumber inpQuantity">
              </div>

              <div class="form-group mx-4">
                <label>Khuyến mãi</label>
                <input type="number" value="${response[i].discount}" class="form-control inpForm inpNumber inpDiscount" value="0">
                <span class="pricePromotional"></span>
              </div>
            `
            typeProduct.innerHTML += (response[i].active == true) ?
              '<div class="form-group"><label>Trạng thái</label><select class="form-select inpForm inpActivePd"><option value="true">Đang bán</option><option value="false">Ngừng bán</option></select></div>' :
              '<div class="form-group"><label>Trạng thái</label><select class="form-select inpForm inpActivePd"><option value="true">Đang bán</option><option value="false" selected>Ngừng bán</option></select></div>'
            ctnTypes.appendChild(typeProduct)
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
        })
      })

      inpTypeP.value = product.type
      inpDescribes.value = product.describes.replaceAll('<br>', '\n')

      category.value = product.categoryDetail.category.id
      categoryDetail.innerHTML = ""
      this.adminCategoriesService.findAllCategoryDetailByCategory(category.value).subscribe((response: any) => {
        for (let i = 0; i < response.length; i++) {
          categoryDetail.innerHTML += `
            <option value="" hidden>Chọn loại danh mục sản phẩm</option>
            <option value="${response[i].id}">${response[i].size}</option>
          `
        }
        categoryDetail.value = product.categoryDetail.id
      })
      inpActive.value = product.active

      this.products[i].id = product.id
      this.products[i].name = product.name
      this.products[i].image = product.image
      this.products[i].imageUrl = product.imageUrl
      this.products[i].type = product.type
      this.products[i].describes = product.describes
      this.products[i].categoryDetail = product.categoryDetail
      this.products[i].active = product.active

      btnReset.disabled = false
      btnReset.innerHTML = 'Khôi phục'
    })
  }

  private delete(id: number, i: number) {
    Swal.fire({
      text: `Bạn chắc muốn xóa sản phẩm này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          this.adminProductsService.delete(id).subscribe((response: any) => {
            if (response.status == "200") {
              Swal.fire({
                text: "Xóa sản phẩm thành công.",
                icon: "success",
                confirmButtonText: "Đồng ý",
              });
              // tắt bảng xem sản phẩm chi tiết
              var rowSeeDetail: any = document.querySelectorAll(".tr-productupdateForm")[i]
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

  private deleteProductD(id: number, row: any) {
    const rowSeeDetail = row.parentNode.parentNode.parentNode.parentNode
    const idResetForm = rowSeeDetail.getAttribute("id-resetForm")
    const indexResetForm = rowSeeDetail.getAttribute("index-resetForm")

    Swal.fire({
      text: `Bạn chắc muốn xóa sản phẩm chi tiết này?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: 'Hủy'
    })
      .then((result: any) => {
        if (result.isConfirmed) {
          this.adminProductsService.deleteProductDetail(id).subscribe((response: any) => {
            if (response.status == "200") {
              row.remove()
              this.resetForm(idResetForm, indexResetForm)
              Swal.fire({
                text: "Xóa sản phẩm chi tiết thành công.",
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
