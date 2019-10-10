// @ts-ignore
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
// @ts-ignore
import { NgForm } from '@angular/forms';
// @ts-ignore
import { Router } from '@angular/router';
import { HelpTexts } from '../../../../services/banks/help-texts';
import { CleanerService } from '@services/cleaner/cleaner.service';

import { FieldService } from '@services/field/field.service';
import { Patterns } from '@services/banks/patterns.service';

import { CreateCredentialInterface } from '@interfaces/credentials/createCredential.interface';
import { InstitutionFieldInterface } from '@interfaces/institutionField';
import { InstitutionInterface } from '@interfaces/institution.interface';

import * as M from 'materialize-css/dist/js/materialize';
import { StatefulInstitutionsService } from '@stateful/institutions/stateful-institutions.service';
import { MethodCredentialService } from '@services/credentials/method-credential/method-credential.service';
import { StatefulInstitutionService } from '@stateful/institution/stateful-institution.service';

@Component({
	selector: 'app-bank-form',
	templateUrl: './bank-form.component.html',
	styleUrls: [ './bank-form.component.css' ]
})
export class BankFormComponent implements OnInit, AfterViewInit {
	credential: CreateCredentialInterface;
	institutionField: InstitutionFieldInterface[];
	institution: InstitutionInterface;
	showSpinner: boolean;
	showVideos: boolean;
	helpText: string;
	usernameErrorMessage: string;
	passwordErrorMessage: string;

	@ViewChild('modal', { static: false })
	elModal: ElementRef;

	constructor(
		private field: FieldService,
		private methodCredential: MethodCredentialService,
		private cleanerService: CleanerService,
		private patterns: Patterns,
		private router: Router,
		private statefulInstitutions: StatefulInstitutionsService,
		private statefulInstitution: StatefulInstitutionService,
		private helpTexts: HelpTexts
	) {
		this.showSpinner = true;
		this.showVideos = false;
		this.credential = {
			institution: null,
			password: null,
			securityCode: null,
			username: null
		};
		this.usernameErrorMessage = '';
		this.passwordErrorMessage = '';
	}

	ngOnInit() {
		this.institution = this.statefulInstitution.institution;

		this.settingTexts();

		this.showvideoBBVA();

		this.getFields();
	}

	ngAfterViewInit() {
		const modal = new M.Modal(this.elModal.nativeElement);
	}

	getFields() {
		this.field.findAllFieldsByInstitution(this.institution.code).subscribe((res) => {
			this.institutionField = res.body;
			this.institutionField = this.institutionField.filter((field) => field.name !== 'sec_code');
			this.institutionField.forEach((field) => this.getErrorMessage(field));

			this.showSpinner = !(this.institutionField.length > 0);

			this.openBBVAModal();
		});
	}

	submit(form: NgForm) {
		this.showSpinner = true;

		this.credential.username = form.value.username;

		this.credential.password = form.value.password;

		this.credential.securityCode = form.value.sec_code;

		this.credential.institution = this.findCurrentInstitution();

		this.cleanerService.cleanAllVariables();

		this.methodCredential.createCredential(this.credential);

		M.toast({
			html: 'Recuperando información...',
			displayLength: 3000
		});

		setTimeout(() => {
			return this.router.navigate([ '/app', 'credentials' ]);
		}, 1000);
	}

	findCurrentInstitution(): InstitutionInterface {
		const institutions = this.statefulInstitutions.institutions;
		return institutions.find((institution) => institution.code === this.institution.code);
	}

	getPattern(field: InstitutionFieldInterface): string {
		return this.patterns.getPattern(field, this.institution.code);
	}

	getErrorMessage(field: InstitutionFieldInterface) {
		field.name === 'username'
			? (this.usernameErrorMessage = this.patterns.getErrorMessage(field, this.institution.code))
			: (this.passwordErrorMessage = this.patterns.getErrorMessage(field, this.institution.code));
	}

	settingTexts() {
		this.helpText = this.helpTexts.getText(this.institution.code);
	}

	showvideoBBVA() {
		if (this.institution.code === 'BBVA') {
			this.showVideos = true;
		}
	}

	openBBVAModal() {
		const instanceModal = M.Modal.getInstance(this.elModal.nativeElement);
		if (this.institution.code === 'BBVA') {
			instanceModal.open();
		}
	}
}
