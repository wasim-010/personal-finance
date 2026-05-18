import type { Cycle, Settings, Transaction } from "@/types/finance";
import { daysBetween, toDateString } from "@/lib/format";

export function getCurrentCycle(settings: Settings, today = new Date()): Cycle {
  const salaryDate = Math.min(Math.max(settings.salaryDate, 1), 28);
  let cycleStart = new Date(today.getFullYear(), today.getMonth(), salaryDate);
  if (cycleStart > today) {
    cycleStart = new Date(today.getFullYear(), today.getMonth() - 1, salaryDate);
  }
  const cycleEnd = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, salaryDate - 1);

  return {
    start: toDateString(cycleStart),
    end: toDateString(cycleEnd),
    daysTotal: daysBetween(cycleStart, cycleEnd) + 1,
    daysElapsed: Math.max(daysBetween(cycleStart, today) + 1, 1),
    label: `${cycleStart.toLocaleString("default", { month: "long" })} cycle`,
  };
}

export function getCycleTransactions(transactions: Transaction[], cycle: Cycle): Transaction[] {
  return transactions.filter((transaction) => transaction.date >= cycle.start && transaction.date <= cycle.end);
}

export function getCycleTotals(transactions: Transaction[]) {
  const income = transactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = transactions
    .filter((tx) => tx.type === "expense" || tx.type === "bike_km" || tx.type === "bike_entry" || tx.type === "household_maintenance")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const debtPayments = transactions.filter((tx) => tx.type === "debt_payment").reduce((sum, tx) => sum + tx.amount, 0);
  const waste = transactions
    .filter((tx) => tx.type === "expense" && tx.classification === "waste")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const needs = transactions
    .filter((tx) => tx.type === "expense" && tx.classification === "need")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const wants = transactions
    .filter((tx) => tx.type === "expense" && tx.classification === "want")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const unknownAdjustment = transactions
    .filter((tx) => tx.type === "expense" && tx.category === "Unknown Adjustment")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return { income, expenses, debtPayments, needs, wants, waste, unknownAdjustment };
}
