import { RouterModule, Routes } from   '@angular/router';
import { PagesComponent } from         '@pages/pages.component';

const PagesRouting: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: './dashboard/dashboard.module#DashboardModule',
        data: {
          title: 'Dashboard'
        }
      },
      {
        path: 'budgets',
        loadChildren: './budgets/budgets.module#BudgetsModule',
        data: {
          title: 'Presupuesto'
        }
      },
      {
        path: 'movements',
        loadChildren: './movements/movements.module#MovementsModule',
        data: {
          title: 'Movimientos'
        }
      },
      {
        path: 'categories',
        loadChildren: './categories/categories.module#CategoriesModule',
        data: {
          title: 'Categorias'
        }
      },
      {
        path: 'credentials',
        loadChildren: './credential/credential.module#CredentialModule',
        data: {
          title: 'Cuentas bancarias'
        }
      },
      {
        path: 'banks',
        loadChildren: './banks/banks.module#BanksModule',
        data: {
          title: 'Bancos'
        }
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];

export const PagesRoutes = RouterModule.forChild( PagesRouting );
