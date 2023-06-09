import { Routes, RouterModule } from '@angular/router';

import { RecoverypasswordComponent } from './components/recoverypassword.component';

const RECOVERY_ROUTING: Routes = [
    { path: ':token', component: RecoverypasswordComponent }
];

export const RECOVERY_ROUTES = RouterModule.forChild( RECOVERY_ROUTING );
