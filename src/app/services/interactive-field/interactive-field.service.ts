import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Credential } from "@shared/dto/credentials/credential";
import { environment } from '@env/environment';
import { ConfigService } from "@services/config/config.service";

@Injectable()
export class InteractiveFieldService {

  constructor( private http: HttpClient, private finerioService:ConfigService ) { }

  findAllFields( credential:Credential ){
    let url = `${environment.backendUrl}/interactiveField`  
    let params:HttpParams = new HttpParams();
    params = params.append("credentialId", `${ credential.id }` );
    
    return this.http.get( url, ({ headers: this.finerioService.getJsonHeaders(), params: params }) );
  }

  sendToken( credential:Credential, data:any ){
    let url = `${environment.backendUrl}/interactiveField/send`;  
    let body = {};
    body[ 'credentialId' ] = credential.id;
    body[ 'interactiveFields' ] = data;
    let postBody = JSON.stringify( body );
    
    return this.http.post( url, postBody, ({ headers: this.finerioService.getJsonHeaders() }) )
  }

}
