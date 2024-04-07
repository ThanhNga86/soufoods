import Swal from 'sweetalert2';
import { AdminCategoriesService } from './../../../services/admin/admin-categories.service';
import { AdminProductsService } from './../../../services/admin/admin-products.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  message: any = {}
  defaultSave: any = {}
  arrImages: any[] = []
  categories: any[] = []

  constructor(private adminProductsService: AdminProductsService, private adminCategoriesService: AdminCategoriesService) { }

  ngOnInit(): void {
    // Xử lý phần hình đại diện
    this.handlerUploadImage()

    // Xử lý phần nhiều hình khác
    this.handlerUploadImages()

    // Xử lý phần thêm form type
    this.handlerAddFormType()

    // Xử lý phần category detail
    this.handlerCategoryDetail()

    // Xử lý phần input sẽ tắt message nếu input đó lỗi
    this.checkInput()

    // Thêm sản phẩm
    const btnSave = document.querySelectorAll(".btnSave")
    for (let i = 0; i < btnSave.length; i++) {
      btnSave[i].addEventListener("click", () => {
        this.add()
      })
    }

    // Làm mới form
    const btnReset: any = document.querySelector(".btnReset")
    btnReset.addEventListener("click", () => {
      this.resetForm()
    })

    // Lấy tất cả dữ liệu của categories
    this.adminCategoriesService.findAllCategory().subscribe((response: any) => {
      this.categories = response
    })
  }

  public add() {
    const formData = new FormData()
    const btnSave: any = document.querySelector(".btnSave")
    const inpName: any = document.querySelector(".inpName")
    const fileImage: any = document.querySelector(".fileImage")
    const inpTypeP: any = document.querySelector(".inpTypeP")
    const inpDescribes: any = document.querySelector(".inpDescribes")
    const typeProduct: any = document.querySelectorAll(".type-product")
    const inpSize: any = document.querySelectorAll(".inpSize")
    const inpPrice: any = document.querySelectorAll(".inpPrice")
    const inpQuantity: any = document.querySelectorAll(".inpQuantity")
    const inpDiscount: any = document.querySelectorAll(".inpDiscount")
    const inpActivePd: any = document.querySelectorAll(".inpActivePd")
    const inpActive: any = document.querySelector(".inpActive")
    const categoryDetail: any = document.querySelector(".categoryDetail")
    const ctnCategoryDetail: any = document.querySelector(".ctnCategoryDetail")

    if (this.validateForm()) {
      btnSave.disabled = true
      btnSave.innerHTML = '<span class="loader2"></span> Thêm mới'
      formData.append("name", inpName.value)
      formData.append("fileImage", fileImage.files[0])

      for (let i = 0; i < this.arrImages.length; i++) {
        formData.append("fileImages", this.arrImages[i].files)
        console.log(this.arrImages[i].files)
      }
      if (inpTypeP.value != '') {
        formData.append("type", inpTypeP.value)
      }
      formData.append("describes", inpDescribes.value.replaceAll(/\n/g, "<br>"))
      formData.append("categoryDetail", categoryDetail.value)
      formData.append("active", inpActive.value)

      this.adminProductsService.add(formData).subscribe((response: any) => {
        if (response.status == '200') {
          const productId = response.productId
          const formDataProductD = new FormData()

          // Thêm form loại sản phẩm
          for (let i = 0; i < typeProduct.length; i++) {
            formDataProductD.set("size", inpSize[i].value)
            formDataProductD.set("price", inpPrice[i].value)
            formDataProductD.set("quantity", inpQuantity[i].value)
            formDataProductD.set("discount", inpDiscount[i].value)
            formDataProductD.set("active", inpActivePd[i].value)
            formDataProductD.set("product", productId)

            this.adminProductsService.addProductDetail(formDataProductD).subscribe((response: any) => {
              if (response.status == '200') {
                if (i == typeProduct.length - 1) {
                  Swal.fire("", "Thêm sản phẩm thành công", "success")
                  ctnCategoryDetail.style.display = "none"
                  this.resetForm()
                }
              } else if (response.status == '401') {
                this.adminProductsService.delete(productId).subscribe(() => {
                  alert("Lỗi khi thêm mới sản phẩm chi tiết! Vui lòng nhập lại")
                  this.resetForm()
                })
                console.log(response)
              }
            })
          }
        } else if (response.status == '401') {
          this.message = response
        }
        btnSave.disabled = false
        btnSave.innerHTML = 'Thêm mới'
      })
    }
  }

  private validateForm() {
    const inpForm = document.querySelectorAll(".inpForm")
    const inpNumber: any = document.querySelectorAll(".inpNumber")
    const fileImage: any = document.querySelector(".fileImage")
    const uploadImage: any = document.querySelector(".uploadImage")
    var check = true

    if (fileImage.files.length == 0) {
      uploadImage.style.border = 'solid 2px lightcoral'
      check = false
    }

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

  private handlerCategoryDetail() {
    const category: any = document.querySelector(".category")
    const ctnCategoryDetail: any = document.querySelector(".ctnCategoryDetail")
    const categoryDetail: any = document.querySelector(".categoryDetail")

    category.addEventListener("change", () => {
      categoryDetail.innerHTML = ""
      this.adminCategoriesService.findAllCategoryDetailByCategory(category.value).subscribe((response: any) => {
        ctnCategoryDetail.style.display = "block"

        for (let i = 0; i < response.length; i++) {
          categoryDetail.innerHTML += `
            <option value="" hidden>Chọn loại danh mục sản phẩm</option>
            <option value="${response[i].id}">${response[i].size}</option>
          `
        }
      })
    })
  }

  private handlerAddFormType() {
    const ctnTypes: HTMLElement | any = document.querySelector(".ctnTypes")
    const addFormType: HTMLElement | any = document.querySelector(".addFormType")

    // mặc định
    ctnTypes.innerHTML = `
      <div class="type-product" style="display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;">
        <div class="form-group">
          <label>Tên loại của sản phẩm</label>
          <input type="text" class="form-control inpForm inpSize" style="width: 250px;">
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
          <span class="pricePromotional"></span>
        </div>

        <div class="form-group">
          <label>Trạng thái</label>
          <select class="form-select inpForm inpActivePd">
            <option value="true">Đang bán</option>
            <option value="false">Ngừng bán</option>
          </select>
        </div>
      </div>
    `
    const actionFormType = () => {
      const inpForm = document.querySelectorAll(".inpForm")
      inpForm.forEach((event: any) => {
        event.addEventListener("focus", () => {
          event.style.boxShadow = '0 0 0 2px rgba(13, 110, 253, .25)'
        })
        event.addEventListener("blur", () => {
          event.style.boxShadow = 'none'
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
    }
    actionFormType()

    // có sự kiện thêm form type
    addFormType.addEventListener("click", () => {
      var typeProduct: any = document.createElement("div")
      typeProduct.setAttribute("class", "type-product mt-3")
      typeProduct.style = "display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;"
      typeProduct.innerHTML += `
        <div class="form-group">
          <label>Tên loại của sản phẩm</label>
          <input type="text" class="form-control inpForm inpSize" style="width: 250px;">
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
      ctnTypes.appendChild(typeProduct)

      const removeFormType = document.querySelectorAll(".removeFormType")
      removeFormType.forEach((event, i) => {
        event.addEventListener("click", () => {
          var formType: any = event.parentNode?.parentNode
          formType.remove()
        })
      })

      actionFormType()
    })
  }

  private handlerUploadImage() {
    const ctnPoster: HTMLElement | any = document.querySelector(".ctnPoster")
    const uploadImage: HTMLElement | any = document.querySelector(".uploadImage")
    const fileImage: HTMLElement | any = document.querySelector(".fileImage")
    const removeImage: HTMLElement | any = document.querySelector(".removeImage")

    this.defaultSave.ctnPoster = ctnPoster.innerHTML

    uploadImage?.addEventListener("click", () => {
      if (fileImage) fileImage.click()
    })

    // xóa hình
    removeImage.addEventListener("click", () => {
      fileImage.value = ''
      ctnPoster.innerHTML = this.defaultSave.ctnPoster
      this.handlerUploadImage()
    })

    if (fileImage) {
      const checkImage = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
      const maxSize = 10 * 1024 * 1024; // 10 MB
      fileImage.addEventListener("change", () => {
        if (fileImage.files && fileImage.files[0]) {
          if (fileImage.files[0].size <= maxSize && checkImage.test(fileImage.files[0].name)) {
            uploadImage.style.border = 'solid 1px lightgray'
            removeImage.style.display = "block"
            uploadImage.src = URL.createObjectURL(fileImage.files[0]);
          } else {
            fileImage.value = ''
            ctnPoster.innerHTML = this.defaultSave.ctnPoster
            this.message.image = 'Vui lòng chọn một hình ảnh có định dạng hợp lệ và kích thước không quá 10 MB.';
            this.handlerUploadImage()
          }
        }
      })
    }
  }

  private handlerUploadImages() {
    const fileImages: HTMLElement | any = document.querySelector(".fileImages")
    const uploadImages: HTMLElement | any = document.querySelector(".uploadImages")
    const ctnImages: HTMLElement | any = document.querySelector(".ctnImages")
    const checkImage = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    const maxSize = 10 * 1024 * 1024; // 10 MB
    var flagFile = true

    uploadImages.addEventListener("click", () => {
      if (fileImages) fileImages.click()
    })

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

      const btnClose = document.querySelectorAll(".btn-close")
      btnClose.forEach((event) => {
        event.addEventListener("click", (e: any) => {
          var showImage = e.target.parentNode
          showImage.remove()
          for (let i = 0; i < this.arrImages.length; i++) {
            if (this.arrImages[i].id == showImage.id) {
              this.arrImages.splice(i, 1)
              break;
            }
          }
        })
      })
    })
  }

  private resetForm() {
    const ctnPoster: HTMLElement | any = document.querySelector(".ctnPoster")
    const fileImage: HTMLElement | any = document.querySelector(".fileImage")
    const ctnImages: HTMLElement | any = document.querySelector(".ctnImages")
    const inpTypeP: HTMLElement | any = document.querySelector(".inpTypeP")
    const formTypeProduct: any = document.querySelectorAll(".type-product")
    const inpDiscount: HTMLElement | any = formTypeProduct[0].querySelector(".inpDiscount")
    const pricePromotional: HTMLElement | any = formTypeProduct[0].querySelector(".pricePromotional")
    const category: HTMLElement | any = document.querySelector(".category")
    const inpForm = document.querySelectorAll(".inpForm")
    const inpActivePd: any = document.querySelectorAll(".inpActivePd")[0]

    this.message = {}

    fileImage.value = ''
    ctnPoster.innerHTML = this.defaultSave.ctnPoster

    ctnImages.innerHTML = ''
    this.arrImages = []

    inpTypeP.value = ''
    inpForm.forEach((event: any) => {
      event.value = ''
      event.style.boxShadow = 'none'
    })
    inpActivePd.selectedIndex = 0

    for (let i = 1; i < formTypeProduct.length; i++) {
      formTypeProduct[i].remove()
    }
    inpDiscount.value = '0'
    pricePromotional.innerHTML = ''

    category.selectedIndex = 0;
    this.handlerUploadImage()
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
