import { transactionInterface } from "./transaction.interface";

export interface accounts {
  transactions?: transactionInterface[],
  totalSpent?: number,
  totalCredit?: number,
  savings?: number,
  month?: number,
  year?: number
} 