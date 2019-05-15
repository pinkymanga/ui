import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnChanges
} from '@angular/core';
import { AccountService } from '@services/account/account.service';
import { DateApiService } from '@services/date-api/date-api.service';
import { AccountsBeanService } from '@services/account/accounts-bean.service';
import { Movement } from '@interfaces/movement.interface';
import { Category } from '@interfaces/category.interface';
import { MovementsService } from '@services/movements/movements.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: [ './item.component.css' ]
})
export class ItemComponent implements OnInit, OnChanges {
  @Input() movement: Movement;
  @Input() categoryList: Category[];

  @Output() movementEdited: EventEmitter<Movement>;
  @Output() valueCategoryColor: EventEmitter<string>;

  traditionalImgSrc: string;
  manualAccountImgSrc: string;

  accountWithOutDefaults: string;
  amountEdit: boolean;

  constructor(
    private dateApi: DateApiService,
    private accountService: AccountService,
    private movementService: MovementsService,
    private changeDetectorRef: ChangeDetectorRef,
    private accountsBeanService: AccountsBeanService
  ) {
    this.movementEdited = new EventEmitter();
    this.valueCategoryColor = new EventEmitter();
    this.amountEdit = true;
  }

  ngOnInit() {
    this.accountWithOutDefaults = this.accountService.getManualAccountNatureWithOutDefaults(
      this.movement.account.type
    );
    this.manualAccountImgSrc = `assets/media/img/manual_account/${this.accountWithOutDefaults}.svg`;
    this.traditionalImgSrc = `https://cdn.finerio.mx/banks/${this.movement.account.institution.code}_shield.png`;
    this.formatMovementDate();
    this.editAmountAvailable();
  }

  ngOnChanges(): void {
    this.accountsBeanService.changeManualAccountOnMovements.subscribe((res) => {
      if (res) {
        this.accountWithOutDefaults = this.accountService.getManualAccountNatureWithOutDefaults(
          this.movement.account.type
        );
        this.manualAccountImgSrc = `assets/media/img/manual_account/${this.accountWithOutDefaults}.svg`;
        this.traditionalImgSrc = `https://cdn.finerio.mx/banks/${this.movement.account.institution
          .code}_shield.png`;
        this.accountsBeanService.changeManualAccountOnMovements.emit(false);
      }
    });
  }

  onErrorFunc(type: string) {
    this.accountWithOutDefaults = this.accountService.getManualAccountNatureWithOutDefaults(type);
    this.manualAccountImgSrc = `assets/media/img/manual_account/${this.accountWithOutDefaults}.svg`;
  }

  editAmountAvailable() {
    this.amountEdit = this.movement.account.institution.code == 'DINERIO' ? true : false;
  }

  formatMovementDate() {
    this.movement.customDate = this.dateApi.formatDateForAllBrowsers(this.movement.customDate.toString());
  }

  updateMovement(movement: Movement) {
    console.log(movement);
  }
}
