import type { FundKey, Location, Transaction } from "@/types/finance";
import { getEmptyFundBalances, getEmptyLocationBalances } from "@/lib/defaults/settings";

export function computeLocationBalances(transactions: Transaction[]): Record<Location, number> {
  const balances = getEmptyLocationBalances();

  for (const tx of transactions) {
    switch (tx.type) {
      case "opening_balance":
      case "income":
        if (tx.toLocation) balances[tx.toLocation] += tx.amount;
        break;
      case "expense":
      case "bike_km":
      case "bike_entry":
      case "household_maintenance":
      case "debt_payment":
        if (tx.fromLocation) balances[tx.fromLocation] -= tx.amount;
        break;
      case "transfer":
        if (tx.fromLocation) balances[tx.fromLocation] -= tx.amount;
        if (tx.toLocation) balances[tx.toLocation] += tx.amount;
        break;
      case "fund_deposit":
      case "fund_withdrawal":
      case "fund_transfer":
        break;
    }
  }

  return balances;
}

export function computeSpendable(
  locationBalances: Record<Location, number>,
  fundBalances: Record<FundKey, number>,
): number {
  const total = Object.values(locationBalances).reduce((sum, value) => sum + value, 0);
  const protectedMoney = Object.values(fundBalances).reduce((sum, value) => sum + value, 0);
  return total - protectedMoney;
}

export function getTotalLocationBalance(locationBalances: Record<Location, number>) {
  return Object.values(locationBalances).reduce((sum, value) => sum + value, 0);
}

export function getTotalProtectedBalance(fundBalances: Record<FundKey, number>) {
  return Object.values(fundBalances).reduce((sum, value) => sum + value, 0);
}

export const emptyFundBalances = getEmptyFundBalances;
