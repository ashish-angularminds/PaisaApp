import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { initalUserStateInterface, metadataInterface, smsInterface } from "./type/InitialUserState.interface";
import { accountsInterface } from "./type/account.interface";
import { transactionInterface } from "./type/transaction.interface";

export const metadataActions = createActionGroup({
  source: "metadata",
  events: {
    set: props<metadataInterface>(),
    reset: emptyProps(),
  }
});

export const accountActions = createActionGroup({
  source: "account",
  events: {
    set: props<{ accounts: accountsInterface[] }>(),
    reset: emptyProps(),
    createAccount: props<{ account: accountsInterface }>(),
    deleteAccount: props<{ month: number, year: number }>(),
    updateAccount: props<accountsInterface>(),
    addTransaction: props<{ transaction: transactionInterface, month: number, year: number }>(),
    updateTransaction: props<{ transactionId: string, newtransaction: transactionInterface, month: number, year: number }>(),
    deleteTransaction: props<{ transactionId: string, month: number, year: number }>(),
  }
});

export const smsActions = createActionGroup({
  source: "sms",
  events: {
    set: props<smsInterface>(),
    reset: emptyProps(),
  }
});