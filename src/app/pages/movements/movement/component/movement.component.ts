import {
  AfterViewInit,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';

import { MovementsService } from '@services/movements/movements.service';
import { ToastService } from '@services/toast/toast.service';

import { Movement } from '@interfaces/movement.interface';
import { ParamsMovements } from '@interfaces/paramsMovements.interface';
import { ToastInterface } from '@interfaces/toast.interface';

import { retry } from 'rxjs/operators';

import { ParamsService } from '@services/movements/params/params.service';

import * as M from 'materialize-css/dist/js/materialize';
import { ParamsMovement } from '@interfaces/paramsMovement.interface';

declare var $: any;
@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.css']
})
export class MovementComponent
  implements OnInit, OnChanges, DoCheck, AfterViewInit, OnDestroy {
  @ViewChild('collapsible') elementCollapsible: ElementRef;

  @Input() status: boolean;

  @Output() statusMovementsList: EventEmitter<boolean>;

  instanceCollapsible;
  spinnerBoolean: boolean;
  statusUpdate: boolean;
  stopOffset: boolean;
  auxSize: number;

  paramsMovements: ParamsMovements;
  movementsList: Movement[];
  toastInterface: ToastInterface;

  auxMovement: ParamsMovement;

  constructor(
    private paramsService: ParamsService,
    private movementsService: MovementsService,
    private toastService: ToastService
  ) {
    this.stopOffset = false;
    this.statusUpdate = false;
    this.spinnerBoolean = true;
    this.auxMovement = {
      amount: null,
      balance: null,
      customDate: new Date(),
      customDescription: null,
      date: null,
      description: null,
      duplicated: null,
      id: null,
      type: null
    };
    this.movementsList = [];
    this.toastInterface = { code: null, message: null, classes: null };

    this.paramsMovements = this.paramsService.getParamsMovements;
    this.paramsMovements.offset = 0;

    this.statusMovementsList = new EventEmitter();
  }

  ngOnInit() {
    this.getMovements(this.paramsMovements);
    window.addEventListener('scroll', this.offsetMovement, true);
  }

  ngOnChanges() {
    if (this.status === true) {
      this.refreshMovement();
    }
  }

  ngDoCheck() {
    if ( this.stopOffset === true ) {
      window.removeEventListener('scroll', this.offsetMovement, true);
      this.toastInterface = {
        code: 200,
        message: 'Hemos cargamos todos tus movimientos'
      };
      this.toastService.toastGeneral(this.toastInterface);
      this.stopOffset = false;
    }
  }

  ngAfterViewInit() {
    const initCollapsible = new M.Collapsible(
      this.elementCollapsible.nativeElement,
      {}
    );
    this.instanceCollapsible = M.Collapsible.getInstance(this.elementCollapsible.nativeElement);
    this.instanceCollapsible.destroy();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.offsetMovement, true);
  }

  /**
   * @function offsetMovement() - It's anonymous functions, its used for eventListener Scroll
   */

  offsetMovement = () => {
    const scrollVertical = window.scrollY;
    let scrollLimit: number;
    scrollLimit = $(document).height() - $(window).height();
    if (scrollVertical >= scrollLimit) {
      this.spinnerBoolean = true;
      this.getMovements(this.paramsMovements);
    }
  }

  getMovements(paramsMovements: ParamsMovements) {
    this.movementsService
      .getMovements(paramsMovements)
      .pipe(retry(2))
      .subscribe(
        res => {
          this.movementsList.push(...res.body.data);
          this.auxSize = res.body.size;
        },
        err => {
          this.toastInterface.code = err.status;
          this.spinnerBoolean = true;
          if (err.status === 401) {
            this.toastService.toastGeneral(this.toastInterface);
          }
          if (err.status === 500) {
            this.toastInterface.message =
              '¡Ha ocurrido un error al obterner tus movimiento!';
            this.toastService.toastGeneral(this.toastInterface);
          }
        },
        () => {
          this.spinnerBoolean = false;
          const auxNumber = this.auxSize - this.paramsMovements.offset;
          if ( auxNumber < 35 ) {
            this.paramsMovements.maxMovements = auxNumber;
            this.stopOffset = true;
          }
        }
      );
    this.paramsMovements.offset = this.paramsMovements.offset + this.paramsMovements.maxMovements;
  }

  refreshMovement() {
    this.paramsMovements = this.paramsService.getParamsMovements;
    this.paramsMovements.offset = 0;
    this.movementsList = [];
    this.getMovements(this.paramsMovements);
    this.status = false;
    this.statusMovementsList.emit(this.status);
  }

  statusMovement(flag: boolean) {
    this.status = flag;
    this.refreshMovement();
  }

  trackByFn(index: number, movement: Movement) {
    return movement.id;
  }

  collapsibleOpen(number: number) {
    this.auxMovement = this.movementsList[number];
    this.statusUpdate = true;
    this.instanceCollapsible.open(number);
    this.instanceCollapsible.destroy();
  }

  formatAmount(amount: string) {
    const regExp = /[]{0,1}[\d]*[\.]{0,1}[\d]+/g;
    const cleanAmount = parseFloat(amount.match(regExp)[0]);
    this.auxMovement.amount = cleanAmount;
  }
}
