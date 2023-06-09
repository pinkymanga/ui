import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';

import {environment} from '@env/environment';

import {ConfigService} from '@services/config/config.service';

import {InstitutionInterface} from '@interfaces/institution.interface';
import {InstitutionFieldInterface} from '@interfaces/institutionField';

import {Observable} from 'rxjs';
import {InstitutionParamsService} from '@params/instiution/institution-params.service';
import {StatefulInstitutionsService} from '@stateful/institutions/stateful-institutions.service';


@Injectable({
  providedIn: 'root'
})

export class FieldService {
  endpoint = environment.backendUrl;
  institutions: InstitutionInterface[] = [];
  private paramsInstitution: HttpParams;

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService,
    private institutionParams: InstitutionParamsService,
    private statefulInstitution: StatefulInstitutionsService,
  ) {
    this.paramsInstitution = this.institutionParams.getInstitutionParams;
    }

  findAllFieldsByInstitution( institutionCode: string ): Observable<HttpResponse<InstitutionFieldInterface[]>> {
    const institutions = this.statefulInstitution.institutions;
    const url = `${this.endpoint}/fields`;

    institutions.forEach((element: InstitutionInterface) => {
      if (element.code === institutionCode) {
        this.institutionParams.setInstitutionID = element.id.toString();
      }
    });

    this.paramsInstitution = this.institutionParams.getInstitutionParams;

    return this.httpClient
      .get<InstitutionFieldInterface[]>(url, {
        observe: 'response',
        headers: this.configService.getHeaders,
        params: this.paramsInstitution
      });
  }
}
