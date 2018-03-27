import { RouterModule, Routes } from '@angular/router';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const PAGES_ROUTING: Routes = [
	{
		path:'',
		component: PagesComponent,
		children: [
			{path: '/dashboard', component: DashboardComponent},
			{path: '', pathMatch:'full', redirectTo: '/dashboard'},
			{path: '**', redirectTo: '/dashboard'}
		]
	}
];

export const PAGES_ROUTES = RouterModule.forChild(PAGES_ROUTING);