import { Injectable } from '@angular/core';
import {AccountInterface} from '@interfaces/account.interfaces';

@Injectable({
  providedIn: 'root'
})
export class StatefulAccountService {

  private _manualAccount: AccountInterface;
  private _account: AccountInterface;

  constructor() { }

  set manualAccount(manualAccount: AccountInterface) {
    this._manualAccount = manualAccount;
  }

  get manualAccount(): AccountInterface {
    return this._manualAccount;
  }

  set account(account: AccountInterface) {
    this._account = account;
  }

  get account(): AccountInterface {
    return this._account;
  }
}
