import { accountsInterface } from "./account.interface";
import { transactionInterface } from "./transaction.interface";

export interface initalUserStateInterface {
  accounts: accountsInterface[],
  metadata: metadataInterface,
  sms: smsInterface
}

export interface metadataInterface {
  displayName: null | string,
  email: null | string,
  phoneNumber: null | string,
  photoURL: null | string,
  providerId: null | string,
  uid: null | string
}

export interface smsInterface {
  lastSMSUpdate?: { seconds: number } | undefined,
  creditSMSFlag?: boolean | undefined,
  debitSMSFlag?: boolean | undefined,
  smsList?: transactionInterface[] | undefined,
}