import {AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ActivationEnd, Router} from '@angular/router';
import {CleanerService} from '@services/cleaner/cleaner.service';
import {ConfigService} from '@services/config/config.service';

import {filter, map} from 'rxjs/operators';
import {isNullOrUndefined} from 'util';

import * as M from 'materialize-css/dist/js/materialize';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: [ './navbar.component.css' ]
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenav', {static: false}) elemSidenav: ElementRef;
  @ViewChild('chevronRight', {static: false}) elemIcon: ElementRef;
  private sideNavInit: M.Sidenav;
  value: boolean;
  titlePage: string;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private cleanerService: CleanerService,
    private configService: ConfigService
  ) {
    this.getDataRoute().subscribe((res) => {
      let largeTitle = document.querySelector('#largeTitle');
      let medTitle = document.querySelector('#medTitle');

      this.titlePage = res.title;
      if (!isNullOrUndefined(this.titlePage)) {
        largeTitle.innerHTML = this.titlePage;
        medTitle.innerHTML = this.titlePage;
      }
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.sideNavInit = new M.Sidenav(this.elemSidenav.nativeElement);
  }

  logout() {
    this.cleanerService.cleanAllVariables();
    this.configService.resetVariable();
    return this.router.navigate([ '/access', 'login' ]);
  }

  getDataRoute() {
    return this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      filter((event: ActivationEnd) => event.snapshot.firstChild === null),
      map((event: ActivationEnd) => event.snapshot.data)
    );
  }
}
