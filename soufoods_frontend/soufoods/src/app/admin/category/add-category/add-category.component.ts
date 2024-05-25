import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { AdminCategoriesService } from 'src/app/services/admin/admin-categories.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {
  message: any = {}
  arrImages: any[] = []
  defaultSave: any = {}

  constructor(private adminCategoriesService: AdminCategoriesService) { }
  ngOnInit(): void {
    // Xử lý phần hình ảnh
    this.handleUploadImage()

    // Thêm mới danh mục
    const btnSave: any = document.querySelector(".btnSave")
    btnSave.addEventListener("click", () => {
      this.add()
    })

    // Xử lý phần thêm form type
    this.handlerAddFormType()

    // Làm mới form
    const btnReset: any = document.querySelector(".btnReset")
    btnReset.addEventListener("click", () => {
      this.resetForm()
    })

    this.checkInput()
  }

  public add() {
    const btnSave: HTMLElement | any = document.querySelector(".btnSave")
    const btnReset: HTMLElement | any = document.querySelector(".btnReset")
    const formData = new FormData()
    const inpName: any = document.querySelector(".inpName")
    const fileImage: any = document.querySelector(".fileImage")
    const inpActive: HTMLElement | any = document.querySelector(".inpActive")
    const typeCategory: any = document.querySelectorAll(".type-category")
    const inpSize: any = document.querySelectorAll(".inpSize")
    const fileImages: any = document.querySelectorAll(".fileImages")
    const inpActiveCd: any = document.querySelectorAll(".inpActiveCd")

    if (this.validateForm()) {
      formData.append("name", inpName.value.trim())
      formData.append("fileImage", fileImage.files[0])
      formData.append("active", inpActive.value)
      btnSave.disabled = true
      btnReset.disabled = true
      btnSave.innerHTML = '<span class="loader2"></span> Thêm mới'

      this.adminCategoriesService.add(formData).subscribe((response: any) => {
        if (response.status == '200') {
          const categoryId = response.categoryId
          const formDataCategoryD = new FormData()

          // Thêm form loại sản phẩm
          for (let i = 0; i < typeCategory.length; i++) {
            formDataCategoryD.set("size", inpSize[i].value.trim())
            formDataCategoryD.set("active", inpActiveCd[i].value)
            formDataCategoryD.set("fileImage", fileImages[i].files[0])
            formDataCategoryD.set("category", categoryId)

            this.adminCategoriesService.addCategoryDetail(formDataCategoryD).subscribe((response: any) => {
              if (response.status == '200') {
                if (i == typeCategory.length - 1) {
                  Swal.fire("", "Thêm danh mục thành công.", "success")
                  this.resetForm()
                }
              } else if (response.status == '401') {
                this.adminCategoriesService.delete(categoryId).subscribe(() => {
                  alert("Lỗi khi thêm mới danh mục chi tiết! Vui lòng nhập lại")
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
        btnReset.disabled = false
        btnSave.innerHTML = 'Thêm mới'
      })
    }
  }

  private validateForm() {
    const inpForm = document.querySelectorAll(".inpForm")
    const inpNumber: any = document.querySelectorAll(".inpNumber")
    const fileImage: any = document.querySelector(".fileImage")
    const uploadImage: any = document.querySelector(".uploadImage")
    const fileImages: any = document.querySelectorAll(".fileImages")
    const uploadImages: any = document.querySelectorAll(".uploadImages")
    var check = true

    if (fileImage.files.length == 0) {
      uploadImage.style.border = 'solid 2px lightcoral'
      check = false
    }

    fileImages.forEach((e: any, i: number) => {
      if (e.files.length == 0) {
        uploadImages[i].style.border = 'solid 2px lightcoral'
        check = false
      }
    })

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

  private handleUploadImage() {
    const ctnImage: HTMLElement | any = document.querySelector(".ctnImage")
    const uploadImage: HTMLElement | any = document.querySelector(".uploadImage")
    const fileImage: HTMLElement | any = document.querySelector(".fileImage")
    const removeImage: HTMLElement | any = document.querySelector(".removeImage")

    this.defaultSave.ctnImage = ctnImage.innerHTML

    uploadImage?.addEventListener("click", () => {
      if (fileImage) fileImage.click()
    })

    // xóa hình
    removeImage.addEventListener("click", () => {
      fileImage.value = ''
      ctnImage.innerHTML = this.defaultSave.ctnImage
      this.handleUploadImage()
    })

    if (fileImage) {
      fileImage.addEventListener("change", () => {
        const checkImage = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
        const maxSize = 10 * 1024 * 1024; // 10 MB

        if (fileImage.files && fileImage.files[0]) {
          if (fileImage.files[0].size <= maxSize && checkImage.test(fileImage.files[0].name)) {
            uploadImage.style.border = 'solid 1px lightgray'
            removeImage.style.display = "block"
            uploadImage.src = URL.createObjectURL(fileImage.files[0]);
          } else {
            fileImage.value = ''
            ctnImage.innerHTML = this.defaultSave.ctnImage
            this.message.image = 'Vui lòng chọn một hình ảnh có định dạng hợp lệ và kích thước không quá 10 MB.';
            this.handleUploadImage()
          }
        }
      })
    }
  }

  private handlerAddFormType() {
    const ctnTypes: HTMLElement | any = document.querySelector(".ctnTypes")
    ctnTypes.style.width = "50%"
    const addFormType: HTMLElement | any = document.querySelector(".addFormType")

    // mặc định
    ctnTypes.innerHTML = `
      <div class="type-category" style="display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;">
        <div class="form-group">
          <label>Tên loại của danh mục</label>
          <input type="text" class="form-control inpForm inpSize" style="width: 300px;">
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
      </div>
    `
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

    const ctnImages: HTMLElement | any = document.querySelectorAll(".ctnImages")
    this.defaultSave[`ctnImage_0`] = ctnImages[0].innerHTML
    this.handleUploadImages(0)

    // có sự kiện thêm form type
    addFormType.addEventListener("click", () => {
      var typeProduct: any = document.createElement("div")
      typeProduct.setAttribute("class", "type-category mt-3")
      typeProduct.style = "display: flex; border: solid 1px lightgray; padding: 5px 10px 10px 10px;"
      typeProduct.innerHTML += `
        <div class="form-group">
          <label>Tên loại của danh mục</label>
          <input type="text" class="form-control inpForm inpSize" style="width: 300px;">
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

        <div class="form-group mt-4" style="margin-left: 10px">
          <i class="fa-solid fa-trash-can removeFormType" style="padding: 10px; background-color: lightcoral; border: none; color: white; user-select: none; cursor: pointer; border-radius: 10px; white-space: nowrap; font-size: 20px;"></i>
        </div>
    `
      ctnTypes.appendChild(typeProduct)

      const ctnImages: HTMLElement | any = document.querySelectorAll(".ctnImages")
      this.defaultSave[`ctnImage_${ctnImages.length - 1}`] = ctnImages[ctnImages.length - 1].innerHTML
      for (let i = 0; i < ctnImages.length; i++) {
        this.handleUploadImages(i)
      }

      const removeFormType = document.querySelectorAll(".removeFormType")
      removeFormType.forEach((event, i) => {
        const cloneElement = this.cloneElement(event)
        cloneElement.addEventListener("click", () => {
          var formType: any = cloneElement.parentNode?.parentNode
          formType.remove()

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
    })
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

  private resetForm() {
    const inpForm: NodeListOf<HTMLElement> | null = document.querySelectorAll(".inpForm")
    const fileImage: HTMLElement | any = document.querySelector(".fileImage")
    const ctnImage: HTMLElement | any = document.querySelector(".ctnImage")
    const ctnImages: HTMLElement | any = document.querySelector(".ctnImages")
    const formTypeCategory: any = document.querySelectorAll(".type-category")
    const inpActiveCd: any = document.querySelectorAll(".inpActiveCd")[0]

    ctnImage.innerHTML = this.defaultSave.ctnImage
    ctnImages.innerHTML = this.defaultSave['ctnImage_0']

    fileImage.value = ''
    inpForm.forEach((event: any) => {
      event.value = ''
    })

    for (let i = 1; i < formTypeCategory.length; i++) {
      formTypeCategory[i].remove()
    }
    inpActiveCd.selectedIndex = 0

    this.message = {}
    this.handleUploadImage()
    this.handleUploadImages(0)
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

  private cloneElement(element: any): Element {
    const cloneElement = element.cloneNode(true)
    element.parentNode.replaceChild(cloneElement, element);
    return cloneElement
  }
}
