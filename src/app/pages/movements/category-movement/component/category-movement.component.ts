import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Category } from '@interfaces/category.interface';
import { CategoriesService } from '@services/categories/categories.service';

@Component({
  selector: 'app-category-movement',
  templateUrl: './category-movement.component.html',
  styleUrls: ['./category-movement.component.css']
})
export class CategoryMovementComponent implements OnInit {
  @Input() categoryList: Category[];
  @Input() category: Category;
  @Input() editAvailable: boolean;

  @Output() statusModal: EventEmitter<boolean>;
  @Output() statusCategory: EventEmitter<boolean>;

  constructor(
    private categoriesService: CategoriesService
  ) {
    this.statusModal = new EventEmitter();
    this.statusCategory = new EventEmitter();
  }

  ngOnInit() {}

  setCategory(category: Category) {
    if ( category.id === 'finerio-icon' ) {
      this.categoriesService.setCategory = null;
    } else {
      this.categoriesService.setCategory = category;
    }
  }
}
