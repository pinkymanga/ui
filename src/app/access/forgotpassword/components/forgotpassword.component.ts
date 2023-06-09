import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from '@services/password/password.service';
import {MobileService} from '@services/mobile/mobile.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: [ './forgotpassword.component.css' ]
})
export class ForgotpasswordComponent implements OnInit {
  forgotPasswordForm = new FormGroup({
    email: new FormControl('')
  });
  success: boolean = false;
  showSpinner: boolean = false;
  showErrorMessage: boolean = false;
  isMobileBrowser: boolean;
  iconCheck = '../../../../assets/media/img/recoveryPassIcon/checkCircle.svg';
  defaultMessages: boolean;
  header: string;
  body: string;

  constructor(
    private router: Router,
    private activated: ActivatedRoute,
    private passwordService: PasswordService,
    private mobileService: MobileService
  ) {
    this.isMobileBrowser = this.mobileService.mobilecheck();
  }

  ngOnInit() {
    this.activated.queryParams.subscribe((params) => {
      let link = params['link'];
      link ? (this.defaultMessages = false) : (this.defaultMessages = true);
    });
    this.setComponentText();
  }

  onSubmit() {
    this.showSpinner = true;
    this.passwordService.createForgotPasswordToken(this.forgotPasswordForm.value.email).subscribe((res) => {
      res.status === 200
        ? ((this.success = true), (this.showSpinner = false))
        : ((this.showErrorMessage = true), (this.showSpinner = false));
    });
  }

  setComponentText() {
    if (this.defaultMessages) {
      this.header = '¿Olvidaste tu contraseña?';
      this.body =
        'No te preocupes, esas cosas pasan. Ingresa el correo electrónico con el que te registraste, y te enviaremos un link para restablecer tu contraseña.';
    } else {
      this.header = 'El link con el que intentaste restablecer tu contraseña ya ha expirado';
      this.body = 'Vuelve a ingresar el correo electrónico con el que te registraste';
    }
  }
}
