import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { NgForm } from '@angular/forms';

import { AccountService } from '@services/account/account.service';
import { CredentialService } from '@services/credentials/credential.service';
import { CredentialBeanService } from '@services/credentials/credential-bean.service';
import { InstitutionService } from '@services/institution/institution.service';
import { InteractiveFieldService } from '@services/interactive-field/interactive-field.service';
import { ToastService } from '@services/toast/toast.service';
import { CleanerService } from '@services/cleaner/cleaner.service';
import { AccountInterface } from '@interfaces/account.interfaces';
import { CredentialInterface } from '@interfaces/credential.interface';
import * as M from 'materialize-css/dist/js/materialize';
import { ToastInterface } from '@interfaces/toast.interface';
import { InstitutionInterface } from '@app/interfaces/institution.interface';

@Component({
  selector: 'app-credential',
  templateUrl: './credential.component.html',
  styleUrls: ['./credential.component.css'],
  providers: [InstitutionService, InteractiveFieldService]
})
export class CredentialComponent implements OnInit, AfterViewInit {
  accounts: AccountInterface[];
  credentials: CredentialInterface[];
  institutions: InstitutionInterface[] = [];
  toast: ToastInterface;

  creditBalance: number;
  debitBalance: number;
  interactiveFields = [];
  totalBalance: number;
  userId: string;

  debitAccounts: AccountInterface[] = [];
  creditAccounts: AccountInterface[] = [];

  // Aux properties
  processCompleteForSpinner: boolean;
  validateStatusFinished: boolean;
  loaderMessagge: string;
  credentialInProcess: CredentialInterface;
  errorWithCredentials: boolean = false;

  // EMPTY STATE
  imgName: string;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  showEmptyState: boolean = false;

  @ViewChild('modal') interactiveModal: ElementRef;
  @ViewChild('collapsible') elementCollapsible: ElementRef;

  constructor(
    private accountService: AccountService,
    private credentialService: CredentialService,
    private institutionService: InstitutionService,
    private interactiveService: InteractiveFieldService,
    private cleanerService: CleanerService,
    private toastService: ToastService,
    private credentialBean: CredentialBeanService
  ) {
    this.credentials = [];
    this.debitBalance = 0;
    this.creditBalance = 0;
    this.totalBalance = 0;
    this.processCompleteForSpinner = false;
    this.validateStatusFinished = true;
    this.loaderMessagge = '';
    this.toast = { classes: null, code: null, message: null };
    this.fillInformationForEmptyState();
  }

  ngOnInit() {
    if (this.credentialBean.getLoadInformation()) {
      this.getAllCredentials();
      this.loadInstitutions();
    } else {
      this.loadInformationFromRam();
    }
  }

  ngAfterViewInit() {
    if (!this.showEmptyState) {
      setTimeout(() => {
        const initModal = new M.Modal(this.interactiveModal.nativeElement);
        const initCollapsible = new M.Collapsible( this.elementCollapsible.nativeElement, {} );
      }, 100);
    }
  }

  loadInformationFromRam() {
    this.credentials = this.credentialBean.getCredentials();
    this.accounts = this.credentialBean.getAccounts();
    this.institutions = this.credentialBean.getInstitutions();
    this.credentials.forEach(credential => {
      this.checkStatusOfCredential(credential);
    });
    this.getBalance(this.accounts);
    this.accountsTable(this.accounts);
    this.automaticSync(this.credentials);
    this.emptyStateProcess();
    this.processCompleteForSpinner = true;
  }

  // Main methods for getting data

  getAllCredentials() {
    this.credentials = [];
    this.debitAccounts = [];
    this.creditAccounts = [];
    this.credentialBean.setCredentials([]);

    this.credentialService.getAllCredentials().subscribe(
      res => {
        res.body.data.forEach((element: CredentialInterface) => {
          this.credentials.push(element);
          this.checkStatusOfCredential(element);
        });
        this.emptyStateProcess();
        this.processCompleteForSpinner = true;
        this.automaticSync(this.credentials);
      },
      error => {
        this.errorWithCredentials = true;
      }
    );
    this.credentialBean.setCredentials(this.credentials);
    this.getAccounts();
  }

  getAccounts() {
    this.accounts = [];
    this.accountService.getAccounts().subscribe(res => {
      res.body.data.forEach((element: AccountInterface) => {
        this.accounts.push(element);
      });
      this.credentialBean.setAccounts(this.accounts);
      this.getBalance(this.accounts);
      this.accountsTable(this.accounts);
      this.credentialBean.setLoadInformation(false);
    });
  }

  automaticSync(credentials: CredentialInterface[]) {
    let currentMoment = new Date();
    credentials.forEach(credential => {
      let dateObj = new Date(credential.lastUpdated);
      let diff =
        (currentMoment.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
      if (diff >= 8) {
        this.validateStatusFinished = false;
        this.credentialService.updateCredential(credential).subscribe(res => {
          this.checkStatusOfCredential(res.body);
        });
      }
    });
  }

  accountsTable(accounts: AccountInterface[]) {
    accounts.forEach(account => {
      if (account.type == 'Crédito') {
        this.creditAccounts.push(account);
      } else {
        if (account.institution.code != 'DINERIO') {
          this.debitAccounts.push(account);
        }
      }
    });
    this.debitAccounts.sort((a, b) => {
      return b.balance - a.balance;
    });
    this.creditAccounts.sort((a, b) => {
      return a.balance - b.balance;
    });
  }

  getBalance(accountsArray: AccountInterface[]) {
    this.debitBalance = 0;
    this.creditBalance = 0;
    this.totalBalance = 0;
    accountsArray.forEach(element => {
      if (element.nature !== 'Crédito') {
        this.debitBalance += element.balance;
      } else {
        this.creditBalance += element.balance;
      }
    });
    this.totalBalance = this.debitBalance + this.creditBalance;
  }

  // Checking status of credencials methods

  checkStatusOfCredential(credential: CredentialInterface) {
    if (credential.status === 'ACTIVE') {
      this.validateStatusFinished = true;
    } else if (credential.status === 'INVALID') {
      this.loaderMessagge =
        '¡Ha ocurrido algo con tu credencial ' +
        credential.institution.name +
        '!';
    } else if (credential.status === 'VALIDATE') {
      this.loaderMessagge =
        'Finerio se está sincronizando con tu banca en línea, esto puede durar unos minutos.';
      this.cleanerService.cleanDashboardVariables();
      this.cleanerService.cleanBudgetsVariables();
      this.getNewInfoCredential(credential.id);
    } else if (credential.status === 'TOKEN') {
      this.loaderMessagge =
        'Solicitando información adicional para ' +
        credential.institution.name +
        '...';
      this.getNewInfoCredential(credential.id);
    }
    this.toast.message = this.loaderMessagge;
  }

  getNewInfoCredential(credentialId: string) {
    this.credentialService.getCredential(credentialId).subscribe(res => {
      this.credentialInProcess = res.body;
      this.toast.code = res.status;
      if (this.credentialInProcess.status === 'VALIDATE') {
        this.validateStatusFinished = false;
        setTimeout(() => {
          this.checkStatusOfCredential(res.body);
        }, 1000);
      } else if (this.credentialInProcess.status === 'ACTIVE') {
        this.loaderMessagge =
          '¡Tus datos han sido sincronizados en ' +
          this.credentialInProcess.institution.name +
          '!';
        this.toast.message = this.loaderMessagge;
        this.getAllCredentials();
      } else if (this.credentialInProcess.status === 'TOKEN') {
        this.validateStatusFinished = false;
        //  Modal process
        this.modalProcessForInteractive(res.body);
      } else if (this.credentialInProcess.status === 'INVALID') {
        this.loaderMessagge =
          '¡Ha ocurrido algo con tu credencial ' +
          this.credentialInProcess.institution.name +
          '!';
        this.validateStatusFinished = false;
        this.getAllCredentials();
      }
    });
  }

  emptyStateProcess() {
    if (this.credentials.length == 0) {
      this.credentialBean.setShowEmptyState(true);
    } else {
      this.credentialBean.setShowEmptyState(false);
    }
    this.showEmptyState = this.credentialBean.getShowEmptyState();
  }

  fillInformationForEmptyState() {
    this.imgName = 'credentials';
    this.title = 'No tienes cuentas bancarias';
    this.description =
      "Pulsa el botón de 'Agregar Credencial' para dar de alta tus cuentas bancarias.";
    this.buttonText = 'Agregar Credencial';
    this.buttonUrl = '/app/banks';
  }

  // InteractiveFields Process

  getInteractiveFields(credential: CredentialInterface) {
    this.interactiveFields = [];
    this.interactiveService.findAllFields(credential).subscribe((data: any) => {
      data.forEach(element => {
        this.interactiveFields.push(element);
      });
    });
  }

  interactiveSubmit(form: NgForm) {
    this.interactiveService
      .sendToken(this.credentialInProcess, form.value)
      .subscribe(res => {
        this.checkStatusOfCredential(this.credentialInProcess);
      });
  }

  modalProcessForInteractive(credential: CredentialInterface) {
    const instanceModal = M.Modal.getInstance(
      this.interactiveModal.nativeElement
    );
    instanceModal.open();
    this.getInteractiveFields(credential);
  }

  // Loading Institutions in Session Storage

  loadInstitutions() {
    this.institutionService.getAllInstitutions().subscribe(res => {
      res.body.data.forEach(institution => {
        if (institution.code !== 'DINERIO') {
          this.institutions.push(institution);
        }
      });
      this.credentialBean.setInstitutions(this.institutions);
    });
  }
}
