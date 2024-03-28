import Swal  from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { AdminCategoriesService } from 'src/app/services/admin/admin-categories.service';

@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.css']
})
export class AddCategoryComponent implements OnInit {
  message: any = {}
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

    // Làm mới form
    const btnReset: any = document.querySelector(".btnReset")
    btnReset.addEventListener("click", () => {
      this.resetForm()
    })

    this.checkInput()
  }

  public add() {
    const btnSave: HTMLElement | any = document.querySelector(".btnSave")
    const formData = new FormData()
    const inpName: any = document.querySelector(".inpName")
    const fileImage: any = document.querySelector(".fileImage")
    const inpActive: HTMLElement | any = document.querySelector(".inpActive")

    formData.append("name", inpName.value)
    formData.append("fileImage", fileImage.files[0])
    formData.append("active", inpActive.value)
    btnSave.disabled = true
    btnSave.innerHTML = '<span class="loader2"></span> Thêm mới'

    this.adminCategoriesService.add(formData).subscribe((response: any) => {
      if(response.status == '200') {
        Swal.fire("", "Thêm danh mục thành công." ,"success")
        this.resetForm()
      } else if(response.status == '401'){
        this.message = response
      }
      btnSave.disabled = false
      btnSave.innerHTML = 'Thêm mới'
    })
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

  private resetForm() {
    const inpForm: NodeListOf<HTMLElement> | null = document.querySelectorAll(".inpForm")
    const fileImage: HTMLElement | any = document.querySelector(".fileImage")
    const ctnImage: HTMLElement | any = document.querySelector(".ctnImage")
    ctnImage.innerHTML = this.defaultSave.ctnImage
    
    fileImage.value = ''
    inpForm.forEach((event: any) => {
      event.value = ''
    })
    this.message = {}
    this.handleUploadImage()
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
