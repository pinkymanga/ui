import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SignupService } from '@services/signup/signup.service';
import { MixpanelService } from '@services/mixpanel/mixpanel.service';
import { ToastService } from '@services/toast/toast.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Signup } from '@app/interfaces/signup.interface';

@Component({
	selector: 'app-referals',
	templateUrl: './referals.component.html',
	styleUrls: [ './referals.component.css' ]
})
export class ReferalsComponent implements OnInit {
	referralCodeModel: string = '';
	termsAccepted: boolean = true;
	password: string = '';
	signupStruct: Signup = {};
	signupData: FormGroup = new FormGroup({
		email: new FormControl(),
		blog: new FormControl(true),
		termsAndConditions: new FormControl({ value: true }, Validators.required),
		referralCode: new FormControl({ value: this.referralCodeModel, disabled: true }, Validators.required)
	});

	constructor(
		private activatedRoute: ActivatedRoute,
		private signupService: SignupService,
		private toastService: ToastService,
		private router: Router,
		private mixpanelService: MixpanelService
	) {}

	ngOnInit() {
		this.router.navigateByUrl('/access/signup');
	}

	submitAction() {
		this.makeStruct();
		this.signupData.value.termsAndConditions ? this.doRequest() : (this.termsAccepted = false);
	}

	makeStruct() {
		this.signupStruct.blog = this.signupData.value.blog;
		this.signupStruct.email = this.signupData.value.email;
		this.signupStruct.password = this.password;
		this.signupStruct.passwordConfirm = this.password;
		this.signupStruct.referalCode = this.referralCodeModel;
		this.signupStruct.termsAndConditions = this.signupData.value.termsAndConditions;
	}

	doRequest() {
		this.signupService.signup(this.signupStruct).subscribe(
			(res) => {
				this.mixpanelEvent(res.body.id);
				this.toastService.setCode = res.status;
			},
			(error) => {
				this.toastService.setCode = error.status;
				this.toastService.setMessage = error.error.message;
				this.toastService.toastGeneral();
			},
			() => {
				this.toastService.setMessage = '¡Registro exitoso!';
				this.toastService.toastGeneral();
				return this.router.navigateByUrl('/invitation-success');
			}
		);
	}

	mixpanelEvent(id: string) {
		this.signupService.setComesFromSignup = true;
		this.mixpanelService.setIdentify(id);
		this.mixpanelService.setSignupPeopleProperties(this.signupData.value.email, new Date());
		this.mixpanelService.setTrackEvent('Sign up', { from: 'Email', referred: true });
	}

	getReferalCode() {
		this.activatedRoute.params.subscribe((params: Params) => {
			this.referralCodeModel = params['code'];
		});
	}
}
