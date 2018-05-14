import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ServicesModule } from './services/services.module';

import { APP_ROUTES } from './app.route';

import { AppComponent } from './app.component';
import { ComponentsComponent } from './components/components.component';
import { AccessComponent } from './access/access.component';
import { PagesComponent } from './pages/pages.component';


@NgModule({
  declarations: [
    AppComponent,
    ComponentsComponent,
    AccessComponent,
    PagesComponent
  ],
  imports: [
    BrowserModule,
    APP_ROUTES,
    ServicesModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
