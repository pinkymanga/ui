import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { DateApiService } from '@services/date-api/date-api.service';
import { Movement } from '@interfaces/movement.interface';
import { Category } from '@interfaces/category.interface';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: [ './item.component.css' ]
})
export class ItemComponent implements OnInit {
  @Input() movement: Movement;
  @Input() categoryList: Category[];

  @Output() movementEdited: EventEmitter<Movement>;
  @Output() valueCategoryColor: EventEmitter<string>;

  constructor(private dateApi: DateApiService) {
    this.movementEdited = new EventEmitter();
    this.valueCategoryColor = new EventEmitter();
  }

  ngOnInit() {
    this.formatMovementDate();
  }

  formatMovementDate() {
    this.movement.customDate = this.dateApi.formatDateForAllBrowsers(this.movement.customDate.toString());
  }
}
