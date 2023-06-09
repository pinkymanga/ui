import { NgModule } from '@angular/core';
import {SharedModule} from '@shared/shared.module';
import {MatDialogModule} from '@angular/material/dialog';

import {BankSyncingAnimationModule} from '@animations/bank-syncing-animation/bank-syncing-animation.module';
import { ModalAccountSyncComponent } from './component/modal-account-sync.component';
import {SpinnerBankSyncAnimationModule} from '@animations/spinner-bank-sync-animation/spinner-bank-sync-animation.module';
import {SpinnerBankFinishedAnimationModule} from '@animations/spinner-bank-finished-animation/spinner-bank-finished-animation.module';
import { AccountSyncingComponent } from './account-syncing/account-syncing.component';
import { AccountDataFinishedComponent } from './account-data-finished/account-data-finished.component';

@NgModule({
  declarations: [
    ModalAccountSyncComponent,
    AccountSyncingComponent,
    AccountDataFinishedComponent
  ],
  imports: [
    SharedModule,
    MatDialogModule,
    BankSyncingAnimationModule,
    SpinnerBankSyncAnimationModule,
    SpinnerBankFinishedAnimationModule,
  ],
  exports: [
    ModalAccountSyncComponent
  ],
  entryComponents: [ ModalAccountSyncComponent ]
})
export class ModalAccountSyncModule { }
