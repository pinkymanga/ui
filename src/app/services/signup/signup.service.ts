import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { environment } from '@env/environment';

import { Signup } from '@interfaces/signup.interface';
import { User } from '@interfaces/user.interface';

import { ConfigService } from '@services/config/config.service';

import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';


@Injectable({
  providedIn: 'root'
})
export class SignupService {
	url: string = environment.backendUrl;
	data: Signup;

	private comesFromSignup: boolean;
	private facebookSignup: boolean;
	private facebookLogin: boolean;

	constructor(private http: HttpClient, private configService: ConfigService) {
		this.comesFromSignup = false;
		this.facebookSignup = false;
		this.facebookLogin = false;
	}

	signup(data: Signup): Observable<HttpResponse<User>> {
		const body = JSON.stringify({
			email: data.email,
			password: data.password,
			passwordConfirmation: data.passwordConfirm,
			termsAndConditionsAccepted: data.termsAndConditions,
			referralCode: isNullOrUndefined(data.referalCode) ? null : data.referalCode,
			blog: data.blog,
			from: 'Webapp'
		});
		return this.http.post<User>(`${this.url}/users`, body, {
			observe: 'response',
			headers: this.configService.getHeaders
		});
	}

	set setFacebookLogin(data: boolean) {
		this.facebookLogin = data;
	}

	get getFacebookLogin(): boolean {
		return this.facebookLogin;
	}

	set setFacebookSignup(data: boolean) {
		this.facebookSignup = data;
	}

	get getFacebookSignup(): boolean {
		return this.facebookSignup;
	}

	set setComesFromSignup(data: boolean) {
		this.comesFromSignup = data;
	}

	get getComesFromSignup(): boolean {
		return this.comesFromSignup;
	}
}
