import type { FundKey, Settings, Transaction } from "@/types/finance";
import { getEmptyFundBalances } from "@/lib/defaults/settings";

export function computeFundBalances(transactions: Transaction[]): Record<FundKey, number> {
  const balances = getEmptyFundBalances();

  for (const tx of transactions) {
    if (tx.type === "fund_deposit" && tx.fundKey) balances[tx.fundKey] += tx.amount;
    if (tx.type === "fund_withdrawal" && tx.fundKey) balances[tx.fundKey] -= tx.amount;
    if (tx.type === "fund_transfer") {
      if (tx.fundKey) balances[tx.fundKey] -= tx.amount;
      if (tx.toFundKey) balances[tx.toFundKey] += tx.amount;
    }
    if (tx.type === "debt_payment" && tx.fundKey === "credit_card_payment") {
      balances.credit_card_payment -= tx.amount;
    }
  }

  for (const key of Object.keys(balances) as FundKey[]) {
    balances[key] = Math.max(0, balances[key]);
  }

  return balances;
}

export function getFundProgress(
  fundKey: FundKey,
  fundBalances: Record<FundKey, number>,
  settings: Settings,
) {
  const balance = fundBalances[fundKey] ?? 0;
  const target = settings.fundTargets[fundKey] ?? 0;
  const remaining = Math.max(target - balance, 0);
  const percentage = target > 0 ? Math.min((balance / target) * 100, 100) : 100;
  return { balance, target, remaining, percentage };
}
