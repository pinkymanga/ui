import { NgModule } from                     '@angular/core';
import { CommonModule } from                 '@angular/common';
import { FormsModule } from                  '@angular/forms';

import { DateApiService } from               '@services/date-api/date-api.service';

import { CategoryComponent } from            '@pages/categories/component/category/category.component';
import { DescriptionComponent } from         './description/description.component';
import { CuentaComponent } from              './cuenta/cuenta.component';
import { MontoComponent } from               './monto/monto.component';
import { ConsiderarComponent } from          './considerar/considerar.component';
import { IngresoGastoComponent } from        './ingreso-gasto/ingreso-gasto.component';
import { FechaComponent } from               './fecha/fecha.component';

@NgModule({
  declarations: [
    CategoryComponent,
    DescriptionComponent,
    CuentaComponent,
    MontoComponent,
    ConsiderarComponent,
    IngresoGastoComponent,
    FechaComponent,
  ],
  imports: [
    CommonModule,
    FormsModule
  ], exports: [
    CategoryComponent,
    DescriptionComponent,
    CuentaComponent,
    MontoComponent,
    ConsiderarComponent,
    IngresoGastoComponent,
    FechaComponent,
  ], providers: [
    DateApiService
  ]
})
export class MovementModule { }
