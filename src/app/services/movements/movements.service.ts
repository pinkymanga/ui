import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

import { ConfigService } from '@services/config/config.service';

import { ParamsMovements } from '@interfaces/paramsMovements.interface';
import { ParamsMovement } from '@interfaces/paramsMovement.interface';
import { Movement } from '@interfaces/movement.interface';
import { Movements } from '@interfaces/movements.interface';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { DateApiService } from '@services/date-api/date-api.service';

@Injectable()
export class MovementsService {
  private url = `${environment.backendUrl}/users`;
  movementsList: Array<Movement>;
  private options = {
    day: '2-digit',
    month: 'short'
  };

  constructor(
    private httpClient: HttpClient,
    private dateApitService: DateApiService,
    private configService: ConfigService
  ) {}

  /**
   * @function allMovements Esta función lo que hace traer todos lo movimiento con los siguientes parametros
   * @param offset : Esto es para obtener los siguientes movimientos
   *
   * Se inicializa el offset en 0, después de eso en la url se mandamn los siguientes parametros:
   * @var url - Esta es la variable como se le enviara la url para la petición al servidor, todo los parametros son opcionales,
   * pero se deben de tomar en cuenta.
   * @param id : Este es el id del usuario
   * @param deep : Si se quieres saber con detalle los movimiento
   * @param max : El número máximo de movimientos que se piden
   * @param duplicate : Para incluir los movimientos duplicaods
   */

  getMovements(
    paramsMovements: ParamsMovements
  ): Observable<HttpResponse<Movements>> {
    if (paramsMovements.offset === 0) {
      this.movementsList = new Array();
    }
    const id = sessionStorage.getItem('id-user');
    let urlMovements =
      `${this.url}/` +
      `${id}/movements` +
      `?deep=${paramsMovements.deep}` +
      `&offset=${paramsMovements.offset}` +
      `&max=${paramsMovements.maxMovements}` +
      `&includeCharges=${paramsMovements.charges}` +
      `&includeDeposits=${paramsMovements.deposits}` +
      `&includeDuplicates=${paramsMovements.duplicates}`;

    if (
      !isNullOrUndefined(paramsMovements.startDate || paramsMovements.endDate)
    ) {
      urlMovements =
        urlMovements +
        `&startDate=${paramsMovements.startDate}` +
        `&endDate=${paramsMovements.endDate}`;
    }
    return this.httpClient
      .get<Movements>(urlMovements, {
        observe: 'response',
        headers: this.configService.getJsonHeaders()
      })
      .pipe(
        map(res => {
          res.body.data.forEach(element => {
            element.formatDate = this.dateFormat(element.customDate);
            this.movementsList.push(element);
          });
          return res;
        })
      );
  }

  createMovement(movement: ParamsMovement): Observable<HttpResponse<Movement>> {
    return this.httpClient.post<Movement>(
      `${this.url}/${this.configService.getId}/movements`,
      JSON.stringify({
        amount: movement.amount,
        balance: 0,
        customDate: this.dateApitService.dateApi(movement.date),
        customDescription: movement.description,
        date: this.dateApitService.dateApi(movement.date),
        description: movement.description,
        duplicated: movement.duplicated,
        type: movement.type.toUpperCase()
      }),
      { observe: 'response', headers: this.configService.getJsonHeaders() }
    );
  }

  updateMovement(movement: ParamsMovement): Observable<HttpResponse<Movement>> {
    return this.httpClient.put<Movement>(
      `${environment.backendUrl}/movements/${movement.id}`,
      JSON.stringify({
        amount: movement.amount,
        balance: movement.balance,
        customDate: this.dateApitService.dateApi(movement.customDate),
        customDescription: movement.customDescription,
        date: movement.date,
        description: movement.description,
        duplicated: movement.duplicated,
        type: movement.type.toUpperCase()
      }),
      { observe: 'response', headers: this.configService.getJsonHeaders() }
    );
  }

  deleteMovement(idMovement: string): Observable<HttpResponse<Movement>> {
    return this.httpClient.delete<Movement>(
      `${environment.backendUrl}/movements/${idMovement}`,
      {
        observe: 'response',
        headers: this.configService.getJsonHeaders()
      }
    );
  }

  dateFormat(date: Date) {
    const dateFormat = date;
    const format = new Date(dateFormat)
      .toLocaleDateString(window.navigator.language, this.options)
      .toString()
      .toUpperCase();
    return format;
  }
}
