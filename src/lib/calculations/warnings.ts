import type { AppState, FundKey } from "@/types/finance";
import { FUND_LABELS } from "@/types/finance";
import { computeSpendable } from "@/lib/calculations/balance";
import { getCurrentCycle, getCycleTransactions } from "@/lib/calculations/cycle";
import { getBikeReport } from "@/lib/calculations/bike";

export interface Warning {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
}

export function computeWarnings(state: AppState): Warning[] {
  const warnings: Warning[] = [];
  const spendable = computeSpendable(state.locationBalances, state.fundBalances);

  if (spendable < 5000) {
    warnings.push({
      id: "low_spendable",
      severity: "critical",
      message: `Spendable balance is critically low.`,
    });
  }

  for (const key of Object.keys(state.fundBalances) as FundKey[]) {
    const target = state.settings.fundTargets[key];
    const balance = state.fundBalances[key];
    if (target > 0 && balance / target < 0.5) {
      warnings.push({
        id: `fund_low_${key}`,
        severity: "warning",
        message: `${FUND_LABELS[key]} fund is below 50% of target.`,
      });
    }
  }

  const cycle = getCurrentCycle(state.settings);
  const cycleTransactions = getCycleTransactions(state.transactions, cycle);
  const expenses = cycleTransactions.filter((tx) => tx.type === "expense");
  const total = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const waste = expenses.filter((tx) => tx.classification === "waste").reduce((sum, tx) => sum + tx.amount, 0);
  const unknownAdjustment = expenses
    .filter((tx) => tx.category === "Unknown Adjustment")
    .reduce((sum, tx) => sum + tx.amount, 0);
  if (total > 0 && waste / total > 0.1) {
    warnings.push({
      id: "waste_high",
      severity: "warning",
      message: `Waste spending is ${Math.round((waste / total) * 100)}% of cycle expenses.`,
    });
  }

  if (unknownAdjustment > 500) {
    warnings.push({
      id: "unknown_adjustment_high",
      severity: "warning",
      message: "Too much money is untracked. Record expenses immediately.",
    });
  }

  const hasDebtPayment = cycleTransactions.some((tx) => tx.type === "debt_payment");
  if (state.debt.outstanding > 0 && !hasDebtPayment) {
    warnings.push({
      id: "debt_payment_missing",
      severity: "info",
      message: "Credit card debt still needs attention this cycle.",
    });
  }

  const hasIncome = cycleTransactions.some((tx) => tx.type === "income");
  const hasFundDeposit = cycleTransactions.some((tx) => tx.type === "fund_deposit");
  if (hasIncome && !hasFundDeposit) {
    warnings.push({
      id: "allocation_missing",
      severity: "info",
      message: "Salary money is not available money. Divide it into funds first.",
    });
  }

  const hasOdoEntry = cycleTransactions.some((tx) => tx.type === "bike_entry" && typeof tx.currentOdo === "number");
  if (!hasOdoEntry) {
    warnings.push({
      id: "bike_odo_missing",
      severity: "info",
      message: "Update current ODO to calculate real bike cost.",
    });
  }

  const bike = getBikeReport(state, cycleTransactions);
  if (bike.kmRemainingBeforeOilChange <= 300 && bike.nextOilChangeOdo > 0) {
    warnings.push({
      id: "oil_change_soon",
      severity: "warning",
      message: "Engine oil change coming soon.",
    });
  }
  if (bike.oilFundShortfall > 0) {
    warnings.push({
      id: "oil_fund_short",
      severity: "warning",
      message: "Engine oil fund is short.",
    });
  }
  if (bike.maintenanceFundShortfall > 0) {
    warnings.push({
      id: "bike_maintenance_underfunded",
      severity: "warning",
      message: "Bike maintenance fund is underfunded.",
    });
  }

  if (state.settings.waterFilter.reminderEnabled && state.settings.waterFilter.nextChangeDate) {
    const daysUntil = Math.ceil((new Date(`${state.settings.waterFilter.nextChangeDate}T00:00:00`).getTime() - Date.now()) / 86400000);
    if (daysUntil <= 30) {
      warnings.push({
        id: "water_filter_soon",
        severity: "warning",
        message: "Water filter replacement coming soon.",
      });
    }
  }

  return warnings;
}
