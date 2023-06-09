import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ManualAccountList } from '@interfaces/manual-accounts/manual-account-list.interface';
import { ManualAccountHttp } from '@interfaces/manual-accounts/manual-account-http.interface';
import { Movement } from '@interfaces/movement.interface';
import { AccountService } from '@services/account/account.service';
import { MovementsService } from '@services/movements/movements.service';
import { CategoriesHelperService } from '@services/categories/categories-helper.service';
import { CategoriesService } from '@services/categories/categories.service';
import { AccountsBeanService } from '@services/account/accounts-bean.service';
import { CleanerService } from '@services/cleaner/cleaner.service';
import { MixpanelService } from '@services/mixpanel/mixpanel.service';
import { ToastService } from '@services/toast/toast.service';
import { AccountInterface } from '@app/interfaces/account.interfaces';
import * as M from 'materialize-css/dist/js/materialize';

@Component({
	selector: 'app-manual-account',
	templateUrl: './manual-account.component.html',
	styleUrls: [ './manual-account.component.css' ]
})
export class ManualAccountComponent implements OnInit, AfterViewInit {
	backButtonRoute: string;
	editModeOfTheComponent: boolean;
	manualAccountPick: ManualAccountList = {};
	manualAccount: ManualAccountHttp = {};
	manualAccountToEdit: AccountInterface;
	manualAccountBalance: string = 'positive';
	showSpinner: boolean = false;

	showDefaultCheckbox: boolean = false;

	// NgModel Variables
	accountName: string;
	accountBalance: number;
	cashDefault: boolean;
	atmDefault: boolean;

	@ViewChild('modal', { static: false })
	elModal: ElementRef;
	@ViewChild('deleteModal', { static: false })
	elModal2: ElementRef;
	@ViewChild('generateMovementModal', { static: false })
	elModal3: ElementRef;

	constructor(
		private activatedRoute: ActivatedRoute,
		private accountService: AccountService,
		private accountsBeanService: AccountsBeanService,
		private router: Router,
		private toastService: ToastService,
		private cleaner: CleanerService,
		private movementsService: MovementsService,
		private categoriesHelperService: CategoriesHelperService,
		private categoriesService: CategoriesService,
		private mixpanelService: MixpanelService
	) {}

	ngOnInit() {
		this.setModeOfTheComponent();
		this.setBackButtonRoute();
		this.editModeOfTheComponent ? this.setManualAccountForEdit() : this.setManualAccountDefaultSettings();
		this.showDefaultCheckboxForAtm();
	}

	ngAfterViewInit() {
		const modal = new M.Modal(this.elModal.nativeElement);
		const modal2 = new M.Modal(this.elModal2.nativeElement);
		const modal3 = new M.Modal(this.elModal3.nativeElement);
	}

	showDefaultCheckboxForAtm() {
		if (this.editModeOfTheComponent) {
			this.showDefaultCheckbox =
				this.accountService.getManualAccountNatureWithOutDefaults(this.manualAccountToEdit.nature) == 'ma_cash';
		} else {
			this.showDefaultCheckbox = this.manualAccountPick.accountKey == 'cash';
		}
	}

	setManualAccountForEdit() {
		let manualAccountToShow = this.accountsBeanService.getManualAccountToEdit;
		this.manualAccountToEdit = manualAccountToShow;

		// For Interface prorpuse
		this.manualAccountPick.iconName = this.accountService.getIconSrcByNature(manualAccountToShow.nature);
		this.manualAccountPick.accountName = this.accountService.getManualAccountNameByNature(
			manualAccountToShow.nature
		);
		this.manualAccountPick.accountKey = this.accountService.getManualAccountNatureWithOutDefaults(
			manualAccountToShow.nature
		);
		document.querySelector('.maBtn').classList.remove('modal-trigger');
		let largeTitle = document.querySelector('#largeTitle');
		let medTitle = document.querySelector('#medTitle');
		largeTitle.innerHTML = 'Cuenta Manual';
		medTitle.innerHTML = 'Cuenta Manual';

		// For fill inputs
		this.accountName = manualAccountToShow.name;
		this.manualAccountBalance = manualAccountToShow.balance > 0 ? 'positive' : 'negative';
		this.accountBalance = Math.abs(manualAccountToShow.balance);
		this.cashDefault = manualAccountToShow.nature.includes('_csh_d') ? true : false;
		this.atmDefault = manualAccountToShow.nature.includes('_atm_d') ? true : false;

		document.querySelector('#' + this.manualAccountBalance).classList.add('active');
	}

	generateAutomaticMovement() {
		const movement: Movement = {};
		movement.concepts = [ {} ];
		this.categoriesService.getCategoriesInfo().subscribe((res) => {
			movement.account = this.manualAccountToEdit;
			movement.amount = Math.abs(this.manualAccount.balance - this.manualAccountToEdit.balance);
			movement.balance = 0;
			movement.customDate = new Date();
			movement.concepts[0].category = this.categoriesHelperService.categoryForManualAccountMovement(
				this.accountService.getManualAccountNatureWithOutDefaults(this.manualAccountToEdit.nature),
				this.manualAccountToEdit.balance > this.manualAccount.balance,
				res.body
			);
			movement.customDescription = this.categoriesHelperService.getConceptAcordingOfCategory;
			movement.duplicated = false;
			movement.type = this.manualAccountToEdit.balance > this.manualAccount.balance ? 'CHARGE' : 'DEPOSIT';
			this.createMovement(movement);
		});
	}

	createMovement(movement: Movement) {
		this.movementsService.createManualAccountMovement(movement, this.manualAccountToEdit.id).subscribe(
			(res) => {},
			(error) => {
				this.toastService.setCode = error.error.status;
				this.toastService.setMessage = 'No pudimos crear tu movimiento';
				this.toastService.toastGeneral();
			},
			() => {
				this.updateManualAccount();
			}
		);
	}

	updateManualAccount() {
		this.accountService.updateManualAccount(this.manualAccount, this.manualAccountToEdit.id).subscribe(
			() => this.getAccounts(),
			(error) => {
				this.toastService.setCode = error.status;
				this.toastService.setMessage = 'Ocurrió un error, vuelve a intentarlo';
				this.toastService.toastGeneral();
			},
			() => {
				this.cleaner.cleanAllVariables();
				this.toastService.setCode = 200;
				this.toastService.setMessage = '¡Cuenta manual modificada con éxito!';
				this.toastService.toastGeneral();
			}
		);
	}

	submitForm(form: NgForm) {
		this.showSpinner = true;
		(<HTMLButtonElement>document.querySelector('#submitButton')).disabled = true;
		if (this.editModeOfTheComponent) {
			(<HTMLButtonElement>document.querySelector('#deleteButton')).disabled = true;
		}

		this.setBalanceToManualAccount(this.accountBalance);
		this.setDefaultToManualAccount(this.cashDefault);
		this.setNatureToManualAccount(this.atmDefault, this.cashDefault);
		this.manualAccount.name = this.accountName;

		this.editModeOfTheComponent ? this.openGenerateMovementModal() : this.createManualAccount();
	}

	deleteManualAccount() {
		this.showSpinner = true;
		(<HTMLButtonElement>document.querySelector('#submitButton')).disabled = true;
		(<HTMLButtonElement>document.querySelector('#deleteButton')).disabled = true;

		this.accountService.deleteAccount(this.manualAccountToEdit).subscribe(
			() => this.getAccounts(),
			(error) => {
				this.toastService.setCode = error.status;
				this.toastService.setMessage = 'Ocurrió un error, vuelve a intentarlo';
				this.toastService.toastGeneral();
			},
			() => {
				this.cleaner.cleanAllVariables();
				this.toastService.setCode = 200;
				this.toastService.setMessage = '¡Cuenta eliminada con éxito!';
				this.toastService.toastGeneral();
			}
		);
	}

	createManualAccount() {
		this.accountService.createManualAccount(this.manualAccount).subscribe(
			() => {
				this.getAccounts();
			},
			(error) => {
				this.toastService.setCode = error.status;
				this.toastService.setMessage = 'Ocurrió un error, vuelve a intentarlo';
				this.toastService.toastGeneral();
			},
			() => {
				this.cleaner.cleanAllVariables();
				this.toastService.setCode = 200;
				this.toastService.setMessage = '¡Cuenta creada con éxito!';
				this.toastService.toastGeneral();
				this.mixpanelEvent();
			}
		);
	}

	getAccounts() {
		this.accountService.getAccounts().subscribe(() => this.router.navigate([ '/app', 'credentials' ]));
	}

	setManualAccountDefaultSettings() {
		this.manualAccountPick.accountKey = 'cash';
		this.manualAccountPick.accountName = 'Efectivo';
		this.manualAccountPick.iconName = 'ma_cash';
		document.querySelector('#positive').classList.add('active');
	}

	balanceBtnClick(balance: string) {
		this.manualAccountBalance = balance;
		if (balance == 'negative') {
			document.querySelector('#positive').classList.remove('active');
			document.querySelector('#' + balance).classList.add('active');
		} else {
			document.querySelector('#negative').classList.remove('active');
			document.querySelector('#' + balance).classList.add('active');
		}
	}

	setNatureToManualAccount(atm: any, cash: any) {
		let nature = this.manualAccountPick.accountKey;
		if (cash === true) {
			nature += '_csh_d';
		}
		if (atm === true) {
			nature += '_atm_d';
		}
		this.manualAccount.nature = nature;
	}

	mixpanelEvent() {
		this.mixpanelService.setIdentify();
		this.mixpanelService.setTrackEvent('Create manual account');
	}

	openGenerateMovementModal() {
		const instanceModal = M.Modal.getInstance(this.elModal3.nativeElement);
		instanceModal.open();
	}

	setDefaultToManualAccount(value: any) {
		this.manualAccount.default = value === true ? value : false;
	}

	setBalanceToManualAccount(value: number) {
		this.manualAccount.balance = this.manualAccountBalance == 'positive' ? value : value < 0 ? value : value * -1;
	}

	manualAccountSelected(event: ManualAccountList) {
		this.manualAccountPick = event;
		this.showDefaultCheckboxForAtm();
	}

	setBackButtonRoute() {
		this.backButtonRoute = this.editModeOfTheComponent ? `/app/credentials` : '/app/banks';
	}

	setModeOfTheComponent() {
		this.activatedRoute.params.subscribe((params) => {
			this.editModeOfTheComponent = params['mode'] === 'edit';
		});
	}
}
