import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { ToastService } from '@services/toast/toast.service';
import { AccountService } from '@services/account/account.service';
import { MixpanelService } from '@services/mixpanel/mixpanel.service';
import { SignupService } from '@services/signup/signup.service';
import {ConfigService} from '@services/config/config.service';
import {CredentialService} from '@services/credentials/credential.service';
import {Subscription} from 'rxjs';
import {isUndefined} from 'util';
import {InstitutionService} from '@services/institution/institution.service';
import {StatefulInstitutionsService} from '@stateful/institutions/stateful-institutions.service';
import {AccountInterface} from '@interfaces/account.interfaces';
import {FilterCredentialService} from '@services/credentials/filter-credential/filter-credential.service';
import {MethodCredentialService} from '@services/credentials/method-credential/method-credential.service';
import {StatefulAccountsService} from '@stateful/accounts/stateful-accounts.service';
import {PollingCredentialService} from '@services/credentials/polling-credential/polling-credential.service';
import {StatefulCredentialsService} from '@stateful/credentials/stateful-credentials.service';
import {FilterAccountsService} from '@services/account/filter-accounts/filter-accounts.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: [ './welcome.component.css' ]
})
export class WelcomeComponent implements OnInit, OnDestroy {

  accountSubscription: Subscription;
  credentialSubscription: Subscription;
  institutionSubscription: Subscription;
  personalInfoUserSubscription: Subscription;

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private configService: ConfigService,
    private credentialService: CredentialService,
    private filterCredentialService: FilterCredentialService,
    private filterAccounts: FilterAccountsService,
    private institutionsService: InstitutionService,
    private methodCredential: MethodCredentialService,
    private mixpanelService: MixpanelService,
    private router: Router,
    private pollingCredentialService: PollingCredentialService,
    private signupService: SignupService,
    private statefulAccounts: StatefulAccountsService,
    private statefulInstitutions: StatefulInstitutionsService,
    private statefulCredentials: StatefulCredentialsService,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.personalInfoUser();
  }

  ngOnDestroy(): void {
    if (!isUndefined(this.institutionSubscription)) {
      this.accountSubscription.unsubscribe();
      this.credentialSubscription.unsubscribe();
      this.personalInfoUserSubscription.unsubscribe();
      this.institutionSubscription.unsubscribe();
    }
  }
  personalInfoUser() {
    this.personalInfoUserSubscription = this.authService.personalInfo().subscribe(
      res => {

        this.mixpanelEvent(res.body.email);

        if (res.body.accountLocked === true) {

          this.toastService.setCode = 400;
          this.toastService.setMessage =
            'Tu cuenta fue bloqueada, por favor <br> ponte en contacto con nosotros';
          this.toastService.toastGeneral();

          return this.router.navigate(['access', 'login']);

        }

        this.getInstitutions();
        this.getCredentials();
        this.getAccount();

      },
      () => this.router.navigate(['access', 'login'])
    );
  }

  getInstitutions() {
    this.institutionSubscription = this.institutionsService.getAllInstitutions()
      .subscribe(res =>
          this.statefulInstitutions.institutions = res.body.data.filter(institution => institution.code !== 'DINERIO')
      );
  }

  getCredentials() {
    this.credentialSubscription = this.credentialService.getAllCredentials()
      .subscribe(
        () => {
          const credentials = this.filterCredentialService.filterCredentials;
          if ( !isUndefined(credentials) ) {
            credentials.forEach( credential => {
              this.methodCredential.updateCredential(credential);
            });
          }
        }
      );
  }

  getAccount() {
    this.accountSubscription = this.accountService.getAccounts().subscribe(res => this.goToPage(res.body.data));
  }

  goToPage(accounts: AccountInterface[]) {
    setTimeout(() => {
      if (this.configService.getUser.name && accounts.length > 1) {
        return this.router.navigate([ '/app', 'dashboard' ]);
      } else if (!this.configService.getUser.name) {
        return this.router.navigate([ '/first-step', 'username' ]);
      } else {
        return this.router.navigate([ '/app', 'banks' ]);
      }
    }, 3000);
  }

  mixpanelEvent(email: string) {
    // Facebook Process
    if (this.mixpanelService.getFacebookSuccess) {
      if (this.signupService.getFacebookSignup) {
        this.mixpanelService.setSignupPeopleProperties(email, new Date());
        this.mixpanelService.setTrackEvent('Sign up', { from: 'Facebook' });
      } else if (this.signupService.getFacebookLogin) {
        this.mixpanelService.setTrackEvent('Log in', { from: 'Facebook' });
      }
    } else if (!this.mixpanelService.getFacebookSuccess && !this.signupService.getComesFromSignup) {
      this.mixpanelService.setTrackEvent('Log in', { from: 'Web' });
    }

    // En signup ya mando evento
    this.mixpanelService.setIdentify();
    this.mixpanelService.setSuperProperties();
    this.mixpanelService.setPeopleProperties();
  }
}
