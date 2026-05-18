import type { AppState, DebtState, Settings, Transaction } from "@/types/finance";
import { computeLocationBalances, computeSpendable } from "@/lib/calculations/balance";
import { computeFundBalances } from "@/lib/calculations/funds";
import { getDebtPaid } from "@/lib/calculations/debt";

export type AppAction =
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "EDIT_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: { id: string } }
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> }
  | { type: "UPDATE_DEBT"; payload: Partial<DebtState> }
  | { type: "REPLACE_STATE"; payload: AppState }
  | { type: "DISMISS_MIGRATION_NOTICE" };

function withRecomputedCache(state: AppState, transactions: Transaction[]): AppState {
  const locationBalances = computeLocationBalances(transactions);
  const fundBalances = computeFundBalances(transactions);
  const paid = getDebtPaid(transactions);
  const originalAmount = state.debt.originalAmount || Math.max(state.debt.outstanding + paid, state.debt.outstanding);
  return {
    ...state,
    transactions,
    locationBalances,
    fundBalances,
    debt: {
      ...state.debt,
      originalAmount,
      outstanding: Math.max(originalAmount - paid, 0),
    },
    lastUpdated: new Date().toISOString(),
  };
}

function wouldMakeSpendableNegative(transactions: Transaction[]) {
  const locationBalances = computeLocationBalances(transactions);
  const fundBalances = computeFundBalances(transactions);
  return computeSpendable(locationBalances, fundBalances) < 0;
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_TRANSACTION": {
      const transactions = [...state.transactions, action.payload];
      if (wouldMakeSpendableNegative(transactions)) return state;
      return withRecomputedCache(state, transactions);
    }
    case "EDIT_TRANSACTION": {
      const transactions = state.transactions.map((transaction) =>
        transaction.id === action.payload.id ? action.payload : transaction,
      );
      if (wouldMakeSpendableNegative(transactions)) return state;
      return withRecomputedCache(state, transactions);
    }
    case "DELETE_TRANSACTION":
      return withRecomputedCache(
        state,
        state.transactions.filter((transaction) => transaction.id !== action.payload.id),
      );
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        lastUpdated: new Date().toISOString(),
      };
    case "UPDATE_DEBT":
      return {
        ...state,
        debt: { ...state.debt, ...action.payload },
        lastUpdated: new Date().toISOString(),
      };
    case "REPLACE_STATE":
      return withRecomputedCache({
        ...action.payload,
      }, action.payload.transactions);
    case "DISMISS_MIGRATION_NOTICE":
      return { ...state, migrationNotice: undefined };
    default:
      return state;
  }
}
