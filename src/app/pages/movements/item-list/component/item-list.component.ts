import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2
} from '@angular/core';
import { Movement } from '@interfaces/movement.interface';

import * as M from 'materialize-css/dist/js/materialize';
import { isUndefined } from 'util';
import { Category } from '@interfaces/category.interface';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit, AfterViewInit {
  @Input() movementList: Movement[];
  @Input() categoryList: Category[];
  @ViewChild('collapsible') collapsibleElement: ElementRef;
  private auxMovement: Movement;
  private instanceCollapsible;
  private statusModal: boolean;
  private indexMovement: number;
  constructor(private renderer: Renderer2) {
    this.statusModal = false;
    this.indexMovement = undefined;
  }

  ngOnInit() {}

  ngAfterViewInit() {
    const initCollapsible = new M.Collapsible(
      this.collapsibleElement.nativeElement,
      {}
    );
    this.instanceCollapsible = M.Collapsible.getInstance(
      this.collapsibleElement.nativeElement
    );
  }

  trackByFn(index: number, movement: Movement) {
    return index;
  }

  collapsibleFunction(index: number) {
    /**
     * Se valida si no es undefined _auxMovement_, si no lo es.
     * Entonces su propiedad editAvailable se vuelve falso
     */
    if (!isUndefined(this.auxMovement)) {
      this.auxMovement.editAvailable = false;
    }
    /**
     * Si es undefined _auxMovement_, o el modal está activo
     * se toma el indice actual y se le asigna a la variable auxMovemente.
     */
    if (isUndefined(this.auxMovement) || this.statusModal === false) {
      this.indexMovement = index;
      this.auxMovement = this.movementList[index];
    } else {
    /** Caso contrario solo se hace un return */
      return;
    }
    this.auxMovement.editAvailable = true;
    this.instanceCollapsible.open(index);
    this.instanceCollapsible.destroy();
  }

  collapsibleClose(index: number) {
    this.auxMovement.editAvailable = false;
    this.instanceCollapsible.close(index);
    this.instanceCollapsible.destroy();
  }
}
