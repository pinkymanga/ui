import { Injectable } from          '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from         '@services/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  test_data: any;
  constructor(
    private authService: AuthService,
    private router: Router) {}

    canActivate() {
      if ( this.authService.isAuth() ) {
        return true;
      } else {
        this.router.navigate(['/access/login']);
        return false;
      }
    }
}
