import Swal from 'sweetalert2';
import { ImagesService } from './../../services/image/images.service';
import { AdminReviewsService } from './../../services/admin/admin-reviews.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  reviews: any[] = []
  total: any
  totalPage: number[] = []
  pageNumber: number = 1
  message: any = {}
  defaultSave: any = {}
  filters: any = {
    flag: false,
    search: null,
    active: null,
    pageNumber: 1,
    rates: [] = []
  }

  constructor(private adminReviewsService: AdminReviewsService, private imagesService: ImagesService) { }

  ngOnInit(): void {
    this.handleFilter()

    this.findAll()
  }

  private resetFunctions() {
    var loadDataTime = setInterval(() => {
      // Hiển thị tất cả các hình ảnh
      this.showAndHiddenImages()

      // Ẩn - hiện đánh giá
      this.hiddenAndShowReview()

      if (this.total > 0) {
        clearInterval(loadDataTime)
      } else {
        clearInterval(loadDataTime)
      }
    }, 200)
  }

  public arrRate(length: number) {
    return Array.from({length}, (_, i) => i);
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
    var arrRate = new Array()

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
          <input class="form-check-input input-filter" id="active" type="checkbox" key="active" value-checked="true" value-unchecked="false" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label" for="active" style="user-select: none;">Trạng thái đánh giá</label>
          <span class="label-filter"></span>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="oneStar" type="checkbox" key="rates" value-checked="1" value-unchecked="1" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label label-filter" for="oneStar" style="user-select: none;"><i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i></label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="twoStar" type="checkbox" key="rates" value-checked="2" value-unchecked="2" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label label-filter" for="twoStar" style="user-select: none;">
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
          </label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="threeStar" type="checkbox" key="rates" value-checked="3" value-unchecked="3" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label label-filter" for="threeSta style="user-select: none;"r">
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
          </label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="fourStar" type="checkbox" key="rates" value-checked="4" value-unchecked="4" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label label-filter" for="fourStar style="user-select: none;"">
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
          </label>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input input-filter" id="fiveStar" type="checkbox" key="rates" value-checked="5" value-unchecked="5" role="switch" style="cursor: pointer; box-shadow: none;">
          <label class="form-check-label label-filter" for="fiveStar style="user-select: none;"">
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
            <i class="fa-solid fa-star star-review" style="color: rgb(248, 196, 74);"></i>
          </label>
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
        if (!String(labelFilter[i].innerHTML).includes("star-review")) {
          labelFilter[i].innerHTML = `${labelFilter[i].innerHTML} <i class="fa-regular fa-rectangle-xmark remove-filter" key=${inputFilter[i].getAttribute("key")} title="Tắt lọc" style="margin-left: 3px; color: red; cursor: pointer;"></i>`
        }

        const keyFilter = inputFilter[i].getAttribute("key")
        const valueChecked = inputFilter[i].getAttribute("value-checked")
        const valueUnChecked = inputFilter[i].getAttribute("value-unchecked")

        for (const key in this.filters) {
          if (key == keyFilter) {
            if (inputFilter[i].checked) {
              if (key == 'rates') {
                arrRate.push(valueChecked)
                this.filters.rates = arrRate
              } else {
                this.filters[key] = valueChecked
              }
            } else {
              if (key == 'rates') {
                arrRate = arrRate.filter((rate: any) => rate != valueUnChecked);
                this.filters.rates = arrRate
              } else {
                this.filters[key] = valueUnChecked
              }
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

  public findAll() {
    const sizePage = 10
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-reviews")
    const row: HTMLElement | any = table.querySelectorAll("tr")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminReviewsService.findAll(this.pageNumber, sizePage).subscribe((response: any) => {
      for (let i = 0; i < response.reviews.length; i++) {
        this.imagesService.findAllByReview(response.reviews[i].id).subscribe((responseImages: any) => {
          response.reviews[i].images = responseImages
          if (i == response.reviews.length - 1) {
            this.reviews = response.reviews
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

  private filter() {
    const loading: HTMLElement | any = document.querySelector(".loading")
    const table: HTMLElement | any = document.querySelector(".table-reviews")
    const row: HTMLElement | any = table.querySelectorAll("tr")
    loading.style.display = 'block'
    table.style.display = 'none'

    this.adminReviewsService.filter(this.filters).subscribe((response: any) => {
      for (let i = 0; i < response.reviews.length; i++) {
        this.imagesService.findAllByReview(response.reviews[i].id).subscribe((responseImages: any) => {
          response.reviews[i].images = responseImages
          if (i == response.reviews.length - 1) {
            this.reviews = response.reviews
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

  public setPageNumber(pageNumber: number) {
    const tr = document.querySelectorAll(".tr-reviewupdateForm")
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

    this.resetFunctions()
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
      console.log("ok")
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

  private hiddenAndShowReview() {
    const btnHidden = document.querySelectorAll(".btnHidden")
    const btnShow = document.querySelectorAll(".btnShow")

    if (btnHidden) {
      for (let i = 0; i < btnHidden.length; i++) {
        const cloneElement = this.cloneElement(btnHidden[i])
        cloneElement.addEventListener("click", () => {
          const formData = new FormData();
          const id:any = cloneElement.getAttribute("id")
          formData.append("id", id)
          formData.append("active", "false")

          Swal.fire({
            text: `Bạn chắc muốn ẩn đánh giá này?`,
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: 'Hủy'
          })
            .then((result: any) => {
              if (result.isConfirmed) {
                this.adminReviewsService.hiddenAndShowReview(formData).subscribe((response: any) => {
                  if (response.status == "200") {
                    Swal.fire({
                      text: "Ẩn đánh giá thành công.",
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
        })
      }
    }

    if (btnShow) {
      for (let i = 0; i < btnShow.length; i++) {
        const cloneElement = this.cloneElement(btnShow[i])
        cloneElement.addEventListener("click", () => {
          const formData = new FormData();
          const id:any = cloneElement.getAttribute("id")
          formData.append("id", id)
          formData.append("active", "true")

          Swal.fire({
            text: `Bạn chắc muốn hiện đánh giá này?`,
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: 'Hủy'
          })
            .then((result: any) => {
              if (result.isConfirmed) {
                this.adminReviewsService.hiddenAndShowReview(formData).subscribe((response: any) => {
                  if (response.status == "200") {
                    Swal.fire({
                      text: "Hiện đánh giá thành công.",
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
        })
      }
    }
  }

}
