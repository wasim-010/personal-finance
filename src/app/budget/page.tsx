"use client";

import { useMemo } from "react";
import { BarChart3, CheckCircle2, CircleAlert, Wallet } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/StatCard";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { GroupPanel, MetricCard, Pill, SectionHeader } from "@/components/ui/Premium";
import { getCurrentCycle, getCycleTransactions } from "@/lib/calculations/cycle";
import { BUDGET_CATEGORIES } from "@/lib/defaults/categories";
import type { BudgetCategory, FundKey, Transaction } from "@/types/finance";
import { formatPercent } from "@/lib/format";

const fundCategoryMap: Partial<Record<FundKey, BudgetCategory>> = {
  baby_delivery: "Baby Delivery Fund",
  baby_starter: "Baby Starter Fund",
  emergency: "Emergency Fund",
  fuel: "Fuel Fund",
  engine_oil: "Engine Oil Fund",
  parking: "Parking",
  bike_maintenance: "Bike Maintenance Fund",
  household_maintenance: "Household Maintenance Fund",
  credit_card_payment: "Credit Card Payment",
};

const budgetGroups: { title: string; helper: string; categories: BudgetCategory[] }[] = [
  {
    title: "Housing",
    helper: "Rent and fixed home cost",
    categories: ["House Rent + Water"],
  },
  {
    title: "Utilities",
    helper: "Monthly service bills",
    categories: ["Gas", "Electricity", "Internet", "Mobile Recharge"],
  },
  {
    title: "Food",
    helper: "Separate food lines make beef savings visible",
    categories: ["Regular Groceries", "Beef", "Chicken", "Fish", "Milk"],
  },
  {
    title: "Bike",
    helper: "Fuel, parking, oil, and future maintenance",
    categories: ["Fuel Fund", "Parking", "Engine Oil Fund", "Bike Maintenance Fund"],
  },
  {
    title: "Baby",
    helper: "Delivery, starter, and after-birth care",
    categories: ["Baby Delivery Fund", "Baby Starter Fund", "Diaper", "Baby Medicine", "Baby Doctor", "Baby Milk", "Baby Clothes", "Mother Nutrition", "Baby Monthly Care Fund"],
  },
  {
    title: "Debt & Safety",
    helper: "Emergency and credit card discipline",
    categories: ["Emergency Fund", "Credit Card Payment"],
  },
  {
    title: "Personal",
    helper: "Small personal and family living costs",
    categories: ["Wife Medical", "Maid", "Charity", "Personal Expense", "Eating Out"],
  },
  {
    title: "Maintenance",
    helper: "Household reserve and water filter tracking",
    categories: ["Water Filter", "Water Filter Replacement", "Household Maintenance Fund", "Home Repair", "Other Household Maintenance"],
  },
  {
    title: "Special / Track Only",
    helper: "Watch these separately so they do not disappear",
    categories: ["Saidpur Support", "Unknown Adjustment"],
  },
];

export default function BudgetPage() {
  const { state } = useAppState();
  const cycle = getCurrentCycle(state.settings);
  const cycleTransactions = getCycleTransactions(state.transactions, cycle);
  const budgets = state.settings.budgets[state.settings.budgetMode];

  const spentByBudget = useMemo(() => {
    const map = new Map<BudgetCategory, number>();
    for (const label of BUDGET_CATEGORIES) {
      map.set(label, cycleTransactions.filter((tx) => affectsBudgetCategory(tx, label)).reduce((sum, tx) => sum + tx.amount, 0));
    }
    return map;
  }, [cycleTransactions]);

  const totalBudgeted = BUDGET_CATEGORIES.reduce((sum, category) => sum + (budgets[category] ?? 0), 0);
  const totalSpent = BUDGET_CATEGORIES.reduce((sum, category) => sum + (spentByBudget.get(category) ?? 0), 0);
  const remaining = Math.max(totalBudgeted - totalSpent, 0);
  const totalPercent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const health = totalPercent >= 100 ? "Over Budget" : totalPercent >= 80 ? "Careful" : "Safe";
  const groupedCategories = new Set(budgetGroups.flatMap((group) => group.categories));
  const ungrouped = BUDGET_CATEGORIES.filter((category) => !groupedCategories.has(category));
  const groups = ungrouped.length
    ? [...budgetGroups, { title: "Other", helper: "Additional tracked categories", categories: ungrouped }]
    : budgetGroups;

  return (
    <>
      <PageHeader title="Budget" subtitle={`${state.settings.budgetMode.replace("_", " ")} mode · ${cycle.label}`} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Budgeted" value={<BDTAmount amount={totalBudgeted} />} icon={Wallet} tone="dark" />
        <MetricCard label="Total Spent" value={<BDTAmount amount={totalSpent} />} icon={BarChart3} />
        <MetricCard label="Remaining" value={<BDTAmount amount={remaining} />} icon={CheckCircle2} tone={remaining > 0 ? "success" : "warning"} />
        <MetricCard label="Budget Health" value={health} icon={CircleAlert} tone={health === "Over Budget" ? "warning" : "light"} note={`${formatPercent(totalPercent)} used`} />
      </section>

      <section className="mt-4 notion-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--notion-ink)]">Cycle budget usage</p>
            <p className="text-sm text-[var(--notion-slate)]">Summary first. Open a group only when you need category detail.</p>
          </div>
          <Pill tone={health === "Safe" ? "success" : health === "Careful" ? "warning" : "danger"}>{health}</Pill>
        </div>
        <ProgressBar value={totalPercent} tone={totalPercent >= 100 ? "rose" : "emerald"} />
      </section>

      <section className="mt-5">
        <SectionHeader
          title="Budget groups"
          description="Grouped rows are easier to scan than a long stack of identical cards."
        />
        <div className="space-y-3">
          {groups.map((group, index) => {
            const limit = group.categories.reduce((sum, category) => sum + (budgets[category] ?? 0), 0);
            const spent = group.categories.reduce((sum, category) => sum + (spentByBudget.get(category) ?? 0), 0);
            const percent = limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0;
            return (
              <GroupPanel
                key={group.title}
                title={group.title}
                subtitle={group.helper}
                defaultOpen={index < 3}
                summary={
                  <div className="hidden min-w-44 sm:block">
                    <div className="mb-1 flex items-center justify-between text-xs text-[var(--notion-slate)]">
                      <span><BDTAmount amount={spent} /></span>
                      <span>{formatPercent(percent)}</span>
                    </div>
                    <ProgressBar value={percent} tone={percent >= 100 && limit > 0 ? "rose" : "emerald"} />
                  </div>
                }
              >
                <div className="space-y-2">
                  {group.categories.map((category) => (
                    <BudgetRow
                      key={category}
                      category={category}
                      spent={spentByBudget.get(category) ?? 0}
                      limit={budgets[category] ?? 0}
                    />
                  ))}
                </div>
              </GroupPanel>
            );
          })}
        </div>
      </section>
    </>
  );
}

function BudgetRow({ category, spent, limit }: { category: BudgetCategory; spent: number; limit: number }) {
  const percent = limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0;
  const status = limit === 0 && spent === 0 ? "Track Only" : percent >= 100 ? "Over Budget" : percent >= 80 ? "Careful" : "Safe";
  const tone = status === "Over Budget" ? "danger" : status === "Careful" ? "warning" : status === "Safe" ? "success" : "neutral";

  return (
    <div className="rounded-xl border border-[var(--notion-hairline)] bg-white p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_220px_auto] sm:items-center">
        <div>
          <p className="font-semibold text-[var(--notion-ink)]">{category}</p>
          <p className="mt-1 text-sm text-[var(--notion-slate)]">
            <BDTAmount amount={spent} /> spent {limit > 0 ? <>of <BDTAmount amount={limit} /></> : "tracked"}
          </p>
        </div>
        <div>
          <ProgressBar value={percent} tone={status === "Over Budget" ? "rose" : "emerald"} />
          <p className="mt-1 text-xs text-[var(--notion-slate)]">{formatPercent(percent)} used · <BDTAmount amount={Math.max(limit - spent, 0)} /> left</p>
        </div>
        <Pill tone={tone}>{status}</Pill>
      </div>
    </div>
  );
}

function affectsBudgetCategory(transaction: Transaction, label: BudgetCategory) {
  if ((transaction.type === "expense" || transaction.type === "bike_km" || transaction.type === "bike_entry" || transaction.type === "household_maintenance") && transaction.category === label) return true;
  if (transaction.type === "debt_payment" && label === "Credit Card Payment") return true;
  if (transaction.type === "fund_deposit" && transaction.fundKey && fundCategoryMap[transaction.fundKey] === label) return true;
  return false;
}
