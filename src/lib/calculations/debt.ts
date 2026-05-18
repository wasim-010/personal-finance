import type { AppState, Transaction } from "@/types/finance";

export function getDebtPaid(transactions: Transaction[]) {
  return transactions.filter((tx) => tx.type === "debt_payment").reduce((sum, tx) => sum + tx.amount, 0);
}

export function getDebtRemaining(state: AppState) {
  return Math.max(state.debt.outstanding, 0);
}

export function getDebtProgress(state: AppState) {
  const original = state.debt.originalAmount || state.debt.outstanding || getDebtPaid(state.transactions);
  const paid = Math.max(original - state.debt.outstanding, 0);
  return original > 0 ? Math.min((paid / original) * 100, 100) : 100;
}
