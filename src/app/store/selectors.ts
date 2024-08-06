import { createSelector } from "@ngrx/store";
import { initalUserStateInterface } from "./type/InitialUserState.interface";

export const selectFeature = (state: { user: initalUserStateInterface }) => state.user

export const selectUid = createSelector(
  selectFeature,
  (state) => state.Uid
)

export const selectAccounts = createSelector(
  selectFeature,
  (state) => state.accounts
)

export const selectLastSMSUpdate = createSelector(
  selectFeature,
  (state) => state.lastSMSUpdate
)