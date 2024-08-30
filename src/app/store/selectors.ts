import { createSelector } from "@ngrx/store";
import { accountsInterface } from "./type/account.interface";
import { initalUserStateInterface } from "./type/InitialUserState.interface";

const tmpDate = new Date();

export const selectFeature = (state: initalUserStateInterface) => state;

export const selectState = createSelector(
  selectFeature,
  (state) => state
)

export const selectAccounts = createSelector(
  selectFeature,
  (state) => state.accounts
)

export const selectCurrentAccount = createSelector(
  selectFeature,
  (state) => Object.values(state.accounts).filter((data: accountsInterface) => (data.month === (tmpDate.getMonth() + 1) && data.year === tmpDate.getFullYear()))
)

export const selectMetadata = createSelector(
  selectFeature,
  (state) => state.metadata
)

export const selectSMS = createSelector(
  selectFeature,
  (state) => state.sms
)