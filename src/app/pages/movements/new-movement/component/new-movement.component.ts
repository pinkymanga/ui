import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { MovementsService } from '@services/movements/movements.service';
import { AccountService } from '@services/account/account.service';
import { ToastService } from '@services/toast/toast.service';
import { CleanerService } from '@services/cleaner/cleaner.service';
import { CategoriesService } from '@services/categories/categories.service';
import { CategoriesHelperService } from '@services/categories/categories-helper.service';

import { NewMovement } from '@interfaces/newMovement.interface';
import * as M from 'materialize-css/dist/js/materialize';
import { AccountInterface } from '@app/interfaces/account.interfaces';
import { isNullOrUndefined } from 'util';
import { Category } from '@app/interfaces/category.interface';

@Component({
	selector: 'app-new-movement',
	templateUrl: './new-movement.component.html',
	styleUrls: [ './new-movement.component.css' ]
})
export class NewMovementComponent implements OnInit, AfterViewInit {
	@ViewChild('duplicated') checkboxDuplicate: ElementRef;
	@ViewChild('manualAccountsModal') manualAccountsModal: ElementRef;
	@ViewChild('datepicker') elDatePickker: ElementRef;
	@ViewChild('btnSubmit') buttonSubmit: ElementRef;

	manualAccount: AccountInterface;
	manualAccountNature: string;
	manualAccountName: string;
	disableModalTrigger: boolean = true;

	newMovement: NewMovement;
	preCategory: Category;
	date: Date;

	loaderSpinner: boolean;
	formatDate: string;
	showSpinner: boolean;

	constructor(
		private movementService: MovementsService,
		private cleanerService: CleanerService,
		private toastService: ToastService,
		private renderer: Renderer2,
		private router: Router,
		private accountService: AccountService,
		private categoriesService: CategoriesService,
		private categoriesHelperService: CategoriesHelperService
	) {
		this.formatDate = 'Otro...';
		this.newMovement = {
			date: new Date(),
			type: 'charge'
		};
		this.date = new Date();
		this.showSpinner = false;
	}

	ngOnInit() {
		this.loaderSpinner = true;
		this.fillNoPreCat();
	}

	fillNoPreCat() {
		this.preCategory = {
			color: '#AAAAAA',
			textColor: '#FFFFFF',
			id: null,
			name: 'Sin categoría',
			parent: {
				id: 'finerio-icon'
			}
		};
	}

	ngAfterViewInit() {
		const modal = new M.Modal(this.manualAccountsModal.nativeElement);
	}

	makeNewMovementStructure() {
		this.newMovement.account = this.manualAccount;
	}

	preliminarCategory() {
		let income = this.newMovement.type == 'INCOME' ? true : false;
		let categoryId: string;
		this.categoriesService.getPreliminarCategory(this.newMovement.description, income).subscribe((res) => {
			categoryId = res.body.categoryId;
			if (categoryId == undefined) {
				this.fillNoPreCat();
			} else {
				this.getEntireCategory(categoryId);
			}
		});
	}

	getEntireCategory(categoryId: string) {
		this.categoriesService.getCategoriesInfo().subscribe((res) => {
			this.newMovement.category = this.categoriesHelperService.getCategoryById(categoryId, res.body);
			this.preCategory = this.newMovement.category;
			this.preCategory.parent = {
				id: this.categoriesHelperService.getParentCategoryId(this.preCategory.id, res.body)
			};
		});
	}

	createMovement(form: NgForm) {
		this.showSpinner = true;
		this.makeNewMovementStructure();

		this.movementService.createMovement(this.newMovement).subscribe(
			(res) => {
				this.toastService.setCode = res.status;
			},
			(err) => {
				this.toastService.setCode = err.status;
				if (err.status === 401) {
					this.toastService.toastGeneral();
					this.createMovement(form);
				}
				if (err.status === 500) {
					this.toastService.setMessage = '¡Ha ocurrido un error al crear tu movimiento!';
					this.toastService.toastGeneral();
				}
			},
			() => {
				this.showSpinner = false;
				this.cleanerService.cleanBudgetsVariables();
				this.cleanerService.cleanDashboardVariables();
				this.toastService.setMessage = 'Se creó su movimiento exitosamente';
				this.toastService.toastGeneral();
				return this.router.navigateByUrl('/app/movements');
			}
		);
	}

	manualAccountSelected(account: AccountInterface) {
		setTimeout(() => {
			let withoutDefault = isNullOrUndefined(account);
			if (!withoutDefault) {
				this.manualAccount = account;
				this.manualAccountName = this.manualAccount.name;
				this.manualAccountNature = this.accountService.getManualAccountNatureWithOutDefaults(
					this.manualAccount.nature
				);
			} else {
				this.manualAccountName = 'Efectivo';
				this.manualAccountNature = 'ma_cash'; // Just for get the image
			}
			this.loaderSpinner = false;
		}, 500);
	}

	modalManualaccountsTrigger(noManualAccounts: boolean) {
		this.disableModalTrigger = noManualAccounts;
	}

	// function for HTML Buttons
	valueType(id: string) {
		this.renderer.removeClass(document.querySelector('.btn-type.active'), 'active');
		this.renderer.addClass(document.getElementById(id), 'active');
		this.newMovement.type = id;
	}

	// function for HTML
	changeClassDate(id: string) {
		const auxDate = new Date();
		this.renderer.removeClass(document.querySelector('.btn-date.active'), 'active');
		this.renderer.addClass(document.getElementById(id), 'active');
		if (id === 'yesterdayDate') {
			const newdate = auxDate.getDate() - 1;
			auxDate.setDate(newdate);
		} else if (id === 'otherDate') {
			return;
		}
		this.newMovement.date = auxDate;
	}
}
