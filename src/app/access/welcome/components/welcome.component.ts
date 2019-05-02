import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@services/auth/auth.service';
import { ToastService } from '@services/toast/toast.service';
import { AccountService } from '@services/account/account.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    // this.personalInfoUser();
  }

  personalInfoUser() {
    this.authService.personalInfo().subscribe(
      res => {
        if (res.body.accountLocked === true) {
          this.toastService.setCode = 401;
          this.toastService.setMessage = 'Tu cuenta fue bloqueada, por favor <br> ponte en contacto con nosotros';
          this.toastService.toastGeneral();
          return this.router.navigate(['access/login']);
        }
      },
      err => {
        this.toastService.setCode = err.status;
        this.toastService.setMessage = 'Ocurrió un error al obtener tus datos';
        this.toastService.toastGeneral();
        return this.router.navigate(['access/login']);
      },
      () => {
        this.getAccount();
      }
    );
  }

  getAccount() {
    this.accountService.getAccounts().subscribe(res => {
      if (res.body.size > 1) {
        this.router.navigate(['/app/dashboard']);
      } else {
        this.router.navigate(['/app/banks']);
      }
    });
  }
}
