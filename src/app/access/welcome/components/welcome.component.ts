import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { ToastService } from '@services/toast/toast.service';
import { AccountService } from '@services/account/account.service';
import { MixpanelService } from '@services/mixpanel/mixpanel.service';
import { SignupService } from '@services/signup/signup.service';
import { ConfigService } from '@services/config/config.service';

@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.component.html',
	styleUrls: [ './welcome.component.css' ]
})
export class WelcomeComponent implements OnInit {
	constructor(
		private accountService: AccountService,
		private authService: AuthService,
		private router: Router,
		private toastService: ToastService,
		private configService: ConfigService,
		private mixpanelService: MixpanelService,
		private signupService: SignupService
	) {}

	ngOnInit() {
		this.personalInfoUser();
	}

	personalInfoUser() {
		this.authService.personalInfo().subscribe(
			(res) => {
				this.mixpanelEvent(res.body.email);
				if (res.body.accountLocked === true) {
					this.toastService.setCode = 401;
					this.toastService.setMessage =
						'Tu cuenta fue bloqueada, por favor <br> ponte en contacto con nosotros';
					this.toastService.toastGeneral();
				}
			},
			(err) => {
				this.toastService.setCode = err.status;
				this.toastService.setMessage = 'Ocurrió un error al obtener tus datos';
				this.toastService.toastGeneral();
				return this.router.navigate([ 'access/login' ]);
			},
			() => {
				this.getAccount();
				return this.router.navigate([ 'access/login' ]);
			}
		);
	}

	getAccount() {
		this.accountService.getAccounts().subscribe((res) => {
			setTimeout(() => {
				if (this.configService.getUser.name && res.body.size > 1) {
					return this.router.navigate([ '/app', 'dashboard' ]);
				} else if (!this.configService.getUser.name) {
					return this.router.navigate([ '/first-step', 'username' ]);
				} else {
					return this.router.navigate([ '/app', 'banks' ]);
				}
			}, 2000);
		});
	}

	mixpanelEvent(email: string) {
		// En signup ya mando evento
		this.mixpanelService.setIdentify();
		this.mixpanelService.setSuperProperties();
		this.mixpanelService.setPeopleProperties();

		// Facebook Process
		console.log('FACEBOOK SUCCESS:', this.mixpanelService.getFacebookSuccess);
		if (this.mixpanelService.getFacebookSuccess) {
			console.log('FacebookSingup', this.signupService.getFacebookSignup);
			console.log('FacebookLogin', this.signupService.getFacebookLogin);
			if (this.signupService.getFacebookSignup) {
				this.mixpanelService.setSignupPeopleProperties(email, new Date());
				this.mixpanelService.setTrackEvent('Sign up', { from: 'Facebook' });
			} else if (this.signupService.getFacebookLogin) {
				this.mixpanelService.setTrackEvent('Log in', { from: 'Facebook' });
			}
		} else if (!this.mixpanelService.getFacebookSuccess && !this.signupService.getComesFromSignup) {
			this.mixpanelService.setTrackEvent('Log in', { from: 'Web' });
		}
	}
}
