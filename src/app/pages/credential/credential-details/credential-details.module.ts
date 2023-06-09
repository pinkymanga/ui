import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { BackButtonModule } from '@components/back-button/back-button.module';

// Component
import { CredentialDetailsComponent } from './components/credential-details.component';

// Route
import { CREDENTIAL_DETAILS_ROUTES } from './credential-details.route';

@NgModule({
  imports: [
    SharedModule,
    BackButtonModule,
    CREDENTIAL_DETAILS_ROUTES ],
  declarations: [
    CredentialDetailsComponent
  ]
})
export class CredentialDetailsModule {}
