import { createFeature, createReducer, on, Store } from "@ngrx/store";
import { initalUserStateInterface, metadataInterface, smsInterface } from "./type/InitialUserState.interface";
import { accountActions, metadataActions, smsActions } from "./action";
import { accountsInterface } from "./type/account.interface";
import { transactionInterface, transactionType } from "./type/transaction.interface";
import { inject } from "@angular/core";
import { IndexdbService } from "../services/indexdb.service";

const accountsArray: accountsInterface[] = [];
const metadata: metadataInterface = {
  displayName: null,
  email: null,
  phoneNumber: null,
  photoURL: null,
  providerId: null,
  uid: null
}
const sms: any = {
  lastSMSUpdate: undefined,
  creditSMSFlag: false,
  debitSMSFlag: false,
  smsList: []
}

function deleteType(action: any) {
  let tmp = { ...action };
  delete tmp.type;
  return tmp;
}

const metadataFeature = createFeature({
  name: 'METADATA',
  reducer: createReducer(metadata,
    on(metadataActions.set, (state, action) => ({
      ...state,
      ...deleteType(action)
    })),
    on(metadataActions.reset, (state) => ({
      ...state,
      displayName: null,
      email: null,
      phoneNumber: null,
      photoURL: null,
      providerId: null,
      uid: null
    }))
  )
});
const smsFeature = createFeature({
  name: 'SMS',
  reducer: createReducer(sms,
    on(smsActions.set, (state, action) => ({
      ...state,
      ...deleteType(action)
    })),
    on(smsActions.reset, () => ({
      creditSMSFlag: false,
      debitSMSFlag: false,
      lastSMSUpdate: { seconds: 0 },
      smsList: [],
    })),
  )
})
const accountFeature = createFeature({
  name: 'ACCOUNT',
  reducer: createReducer(accountsArray,
    on(accountActions.set, (state, action) => ({
      ...action.accounts
    })),
    on(accountActions.reset, () => ({
      ...[]
    })),
    on(accountActions.createAccount, (state, action) => ({
      ...[...Object.values(state), action.account],
    })),
    on(accountActions.updateAccount, (state, action) => ({
      ...Object.values(state).map((data: accountsInterface) => (data.month === action.month && data.year === action.year) ? deleteType(action) : data)
    })),
    on(accountActions.deleteAccount, (state, action) => ({
      ...Object.values(state).filter((data) => !(data.month === action.month && data.year === action.year)),
    })),
    on(accountActions.addTransaction, (state, action) => ({
      ...Object.values(state).map((data: any) => {
        if (data.month === action.month && data.year === action.year) {
          let tmp = { ...data };
          tmp.transactions = [...tmp.transactions, action.transaction];
          if (action.transaction.type === transactionType.Credit) {
            tmp.totalCredit = tmp.totalCredit! + action.transaction.amount!;
          } else {
            tmp.totalSpent = tmp.totalSpent! + action.transaction.amount!;
          }
          return tmp;
        } else {
          return data;
        }
      }),
    })),
    on(accountActions.updateTransaction, (state, action) => ({
      ...Object.values(state).map((data: accountsInterface) => {
        if (data.month === action.month && data.year === action.year) {
          let account = { ...data };
          account.transactions = account.transactions?.map((trans: transactionInterface) => {
            if (trans.id === action.transactionId) {
              if (trans.type !== action.newtransaction.type && action.newtransaction.type! < 2) {
                if (trans.type === transactionType.Credit) {
                  account.totalCredit = account.totalCredit! - trans.amount!;
                  account.totalSpent = account.totalSpent! + (action.newtransaction.amount! ? action.newtransaction.amount! : trans.amount!);
                } else {
                  account.totalSpent = account.totalSpent! - trans.amount!;
                  account.totalCredit = account.totalCredit! + (action.newtransaction.amount! ? action.newtransaction.amount! : trans.amount!);
                }
              } else {
                if (trans.type === transactionType.Credit) {
                  account.totalCredit = (account.totalCredit! - trans.amount!) + action.newtransaction.amount!;
                } else {
                  account.totalSpent = (account.totalSpent! - trans.amount!) + action.newtransaction.amount!;
                }
              }
              return { ...trans, ...action.newtransaction }
            } else {
              return trans;
            }
          })
          return account;
        } else {
          return data;
        }
      }),
    })),
    on(accountActions.deleteTransaction, (state, action) => ({
      ...Object.values(state).map((data: accountsInterface) => {
        if (data.month === action.month && data.year === action.year) {
          let account = { ...data };
          let newtransactions = account!.transactions!.filter((trans) => trans.id !== action.transactionId);
          let tmptransaction = account!.transactions!.find((data) => data.id === action.transactionId);
          if (tmptransaction!.type === transactionType.Credit) {
            account = { ...account, totalCredit: account.totalCredit! - tmptransaction!.amount! }
          } else {
            account = { ...account, totalSpent: account.totalSpent! - tmptransaction!.amount! }
          }
          return { ...account, transactions: newtransactions }
        } else {
          return data;
        }
      }),
    })),
  )
});
export const { name: metadataFeatureKey, reducer: metadataReducer } = metadataFeature;
export const { name: smsFeatureKey, reducer: smsReducer } = smsFeature;
export const { name: accountFeatureKey, reducer: accountReducer } = accountFeature;