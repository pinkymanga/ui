import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { EmptyStateModule } from '@components/empty-states/empty-states.module';

// Component
import { CredentialComponent } from './components/credential.component';
import { CredentialItemComponent } from './credential-item/credential-item.component';

// Route
import { CREDENTIAL_ROUTES } from './credential.route';
import { BackButtonModule } from '@components/back-button/back-button.module';
import { AccountsTableComponent } from './accounts-table/accounts-table.component';
import { ManualAccountItemComponent } from './manual-account-item/manual-account-item.component';
import {InteractiveFieldService} from '@services/interactive-field/interactive-field.service';
import {ModalTokenComponent} from '@components/modal-token/component/modal-token.component';

@NgModule({
  imports: [
    SharedModule,
    BackButtonModule,
    EmptyStateModule,
    CREDENTIAL_ROUTES
  ],
  declarations: [
    CredentialComponent,
    CredentialItemComponent,
    AccountsTableComponent,
    ManualAccountItemComponent
  ],
  providers: [ ]
})
export class CredentialModule {}
