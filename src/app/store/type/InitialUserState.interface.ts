import { accounts } from "./account.interface";

export interface initalUserStateInterface {
  Uid: string | undefined,
  accounts: accounts[],
  lastSMSUpdate: { seconds: number },
  creditSMSFlag: boolean,
  debitSMSFlag: boolean
}