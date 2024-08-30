import { accountsInterface } from "./account.interface";

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
  lastSMSUpdate?: undefined | { seconds: number },
  creditSMSFlag?: boolean,
  debitSMSFlag?: boolean,
  smsList?: any[]
}