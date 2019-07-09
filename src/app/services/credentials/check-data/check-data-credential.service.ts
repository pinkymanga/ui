import { Injectable } from '@angular/core';
import {CredentialInterface} from '@interfaces/credentials/credential.interface';
import {StatefulCredentialsService} from '@stateful/credentials/stateful-credentials.service';
import {PollingCredentialService} from '@services/credentials/polling-credential/polling-credential.service';
import {CredentialUpdateResponse} from '@interfaces/credentials/credential-update-response';

@Injectable({
  providedIn: 'root'
})
export class CheckDataCredentialService {

  constructor(
    private statefulCredentialsService: StatefulCredentialsService,
    private pollingCredentialService: PollingCredentialService
  ) { }

  checkData( credentialUpdateResponse: CredentialUpdateResponse ) {

    if (this.statefulCredentialsService.credentials) {

      this.statefulCredentialsService.credentials.forEach( credential => {

        if (credential.status === 'VALIDATE') {

          this.checkSubscription(credential, credentialUpdateResponse);

        }

      });

    }

  }

  checkSubscription(credential: CredentialInterface, credentialUpdateResponse: CredentialUpdateResponse) {
    const unpolledCredential = this.pollingCredentialService.checkCredentialStatus(credential).subscribe(
      res => {
        credentialUpdateResponse.checkCredentialSyncing(res.body, unpolledCredential);
      }
    );
  }

}
