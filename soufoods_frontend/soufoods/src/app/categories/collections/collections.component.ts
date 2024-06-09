import { CategoryService } from './../../services/advice/category.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css']
})
export class CollectionsComponent implements OnInit {
  categoryDetails: any[] = []

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.findAllCategoryDetail()
  }

  public findAllCategoryDetail() {
    this.categoryService.findAllCategoryDetail().subscribe((response: any) => {
      this.categoryDetails = response

      this.loadingImage()
    })
  }

  private loadingImage() {
    setTimeout(() => {
      const images = document.querySelectorAll(".image")
      images.forEach((image: any) => {
        const img = image.querySelector("img")

        if (img.complete) {
          image.style.backgroundImage = 'none';
          img.style.opacity = '1'
        } else {
          img.addEventListener("load", () => {
            image.style.backgroundImage = 'none';
            img.style.opacity = '1'
          })
        }
      })
    }, 300);
  }

}
