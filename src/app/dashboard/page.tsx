"use client";

import Link from "next/link";
import { AlertTriangle, Baby, Bike, CreditCard, LockKeyhole, PlusCircle, ShieldCheck, Wallet } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/StatCard";
import { AlertCard, CompactStat, MetricCard, Pill, ProgressRow, SectionHeader } from "@/components/ui/Premium";
import { FUND_LABELS, type FundKey, type Transaction } from "@/types/finance";
import { computeSpendable, getTotalLocationBalance, getTotalProtectedBalance } from "@/lib/calculations/balance";
import { getCurrentCycle, getCycleTotals, getCycleTransactions } from "@/lib/calculations/cycle";
import { getFundProgress } from "@/lib/calculations/funds";
import { computeWarnings } from "@/lib/calculations/warnings";
import { getDebtPaid, getDebtProgress, getDebtRemaining } from "@/lib/calculations/debt";
import { getBikeReport } from "@/lib/calculations/bike";
import { CategoryChart, NeedWantWasteChart } from "@/components/dashboard/DashboardCharts";
import { formatDate, formatDateShort, formatPercent } from "@/lib/format";

const priorityFundKeys: FundKey[] = [
  "baby_delivery",
  "baby_starter",
  "emergency",
  "credit_card_payment",
  "fuel",
  "engine_oil",
  "bike_maintenance",
];

const locationLabels: Record<string, string> = {
  bank: "Bank",
  wallet: "Wallet / Cash in Hand",
  cash_envelope: "Cash Envelope",
  bkash: "bKash",
  nagad: "Nagad",
};

export default function DashboardPage() {
  const { state } = useAppState();
  const cycle = getCurrentCycle(state.settings);
  const cycleTransactions = getCycleTransactions(state.transactions, cycle);
  const totals = getCycleTotals(cycleTransactions);
  const spendable = computeSpendable(state.locationBalances, state.fundBalances);
  const totalLocation = getTotalLocationBalance(state.locationBalances);
  const protectedMoney = getTotalProtectedBalance(state.fundBalances);
  const warnings = computeWarnings(state).sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  const visibleWarnings = warnings.slice(0, 4);
  const hiddenWarnings = warnings.slice(4);
  const bikeReport = getBikeReport(state, cycleTransactions);
  const cycleProgress = Math.min((cycle.daysElapsed / cycle.daysTotal) * 100, 100);
  const remainingDays = Math.max(cycle.daysTotal - cycle.daysElapsed, 0);
  const categoryData = Object.entries(
    cycleTransactions
      .filter((tx) => tx.type === "expense" || tx.type === "bike_km" || tx.type === "bike_entry" || tx.type === "household_maintenance")
      .reduce<Record<string, number>>((acc, tx) => {
        const key = tx.category ?? (tx.type === "bike_km" ? "Fuel Fund" : "Miscellaneous");
        acc[key] = (acc[key] ?? 0) + tx.amount;
        return acc;
      }, {}),
  ).map(([name, value]) => ({ name, value }));
  const recentEntries = [...state.transactions]
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Family Money Dashboard"
        subtitle={`${cycle.label} · ${formatDateShort(cycle.start)} to ${formatDateShort(cycle.end)}`}
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Add entry</Link>}
      />

      <section className="notion-hero-band mb-5 p-5 sm:p-7 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="dark">Spendable balance</Pill>
                <Pill tone={state.settings.budgetMode === "normal" ? "primary" : "warning"}>{state.settings.budgetMode.replace("_", " ")} mode</Pill>
              </div>
              <div className="mt-4 text-white">
                <BDTAmount amount={spendable} size="hero" className="text-5xl sm:text-6xl" />
              </div>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                This is the money you can actually spend after protecting future money. Protected funds should not make you feel rich.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <CompactStat label="Total physical money" value={<BDTAmount amount={totalLocation} />} />
              <CompactStat label="Protected money" value={<BDTAmount amount={protectedMoney} />} />
              <CompactStat label="Days remaining" value={`${remainingDays} days`} />
            </div>
          </div>

          <div className="workspace-mockup-card p-4">
            <div className="mb-3 flex items-center justify-between border-b border-[var(--notion-hairline)] pb-3">
              <div>
                <p className="text-sm font-semibold">{cycle.label}</p>
                <p className="text-xs text-[var(--notion-slate)]">Cycle progress · {formatPercent(cycleProgress)}</p>
              </div>
              <ShieldCheck size={19} className="text-[var(--notion-primary)]" />
            </div>
            <ProgressBar value={cycleProgress} />
            <div className="mt-4 space-y-2">
              {Object.entries(state.locationBalances).map(([location, balance]) => (
                <div key={location} className="flex items-center justify-between rounded-xl bg-[var(--notion-surface-soft)] px-3 py-2 text-sm">
                  <span>{locationLabels[location] ?? location}</span>
                  <BDTAmount amount={balance} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Cycle Income" value={<BDTAmount amount={totals.income} />} icon={Wallet} tone="success" />
        <MetricCard label="Cycle Expense" value={<BDTAmount amount={totals.expenses} />} icon={Wallet} />
        <MetricCard label="Debt Remaining" value={<BDTAmount amount={getDebtRemaining(state)} />} icon={CreditCard} tone="warning" />
        <MetricCard label="Baby Progress" value={formatPercent(getFundProgress("baby_delivery", state.fundBalances, state.settings).percentage)} icon={Baby} />
        <MetricCard label="Emergency Fund" value={<BDTAmount amount={state.fundBalances.emergency} />} icon={LockKeyhole} />
        <MetricCard label="Bike Health" value={bikeReport.health} icon={Bike} tone={bikeReport.health === "Danger" ? "warning" : bikeReport.health === "Safe" ? "success" : "light"} />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.82fr]">
        <div className="notion-card p-4">
          <SectionHeader
            title="Priority progress"
            description="Baby, debt, emergency, and bike funds in one focused list."
          />
          <div className="grid gap-3 lg:grid-cols-2">
            {priorityFundKeys.map((key) => {
              const progress = getFundProgress(key, state.fundBalances, state.settings);
              return (
                <ProgressRow
                  key={key}
                  label={FUND_LABELS[key]}
                  current={progress.balance}
                  target={progress.target}
                  helper={key === "baby_delivery" ? "Baby fund touch করবেন না." : undefined}
                />
              );
            })}
          </div>
        </div>

        <div className="notion-card p-4">
          <SectionHeader
            title="Debt meter"
            description="Clear the card before new card spending."
          />
          <div className="rounded-xl bg-[var(--notion-surface-soft)] p-4">
            <p className="text-sm text-[var(--notion-slate)]">Remaining</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--notion-ink)]"><BDTAmount amount={getDebtRemaining(state)} /></p>
            <ProgressBar value={getDebtProgress(state)} tone="rose" />
            <p className="mt-2 text-sm text-[var(--notion-slate)]">
              Paid <BDTAmount amount={getDebtPaid(state.transactions)} /> · {formatPercent(getDebtProgress(state))} cleared
            </p>
          </div>
        </div>
      </section>

      {warnings.length ? (
        <section className="mt-5">
          <SectionHeader title="Smart alerts" description="Highest-priority warnings first. Keep action focused." />
          <div className="grid gap-2">
            {visibleWarnings.map((warning) => (
              <AlertCard key={warning.id} severity={warning.severity} message={warning.message} />
            ))}
          </div>
          {hiddenWarnings.length ? (
            <details className="mt-2 rounded-xl border border-[var(--notion-hairline)] bg-white p-3">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--notion-primary-deep)]">View all alerts ({warnings.length})</summary>
              <div className="mt-3 grid gap-2">
                {hiddenWarnings.map((warning) => (
                  <AlertCard key={warning.id} severity={warning.severity} message={warning.message} />
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      <section className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <CategoryChart data={categoryData} />
        <NeedWantWasteChart need={totals.needs} want={totals.wants} waste={totals.waste} />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="notion-card p-4">
          <SectionHeader title="Bike snapshot" description="ODO based cost health for this cycle." action={<Link href="/bike" className="button-secondary">Open bike tracker</Link>} />
          <div className="grid gap-2 sm:grid-cols-2">
            <CompactStat label="Current ODO" value={`${bikeReport.currentOdo.toLocaleString("en-IN")} km`} />
            <CompactStat label="Cycle KM" value={`${Math.round(bikeReport.kmRun).toLocaleString("en-IN")} km`} />
            <CompactStat label="Fuel / KM" value={<BDTAmount amount={bikeReport.fuelCostPerKm} />} />
            <CompactStat label="Oil / KM" value={<BDTAmount amount={bikeReport.engineOilCostPerKm} />} />
            <CompactStat label="Maintenance reserve" value={<BDTAmount amount={bikeReport.maintenanceReserveNeeded} />} />
            <CompactStat label="True bike cost" value={<BDTAmount amount={bikeReport.estimatedTrueCost} />} />
          </div>
        </div>

        <div className="notion-card p-4">
          <SectionHeader title="Recent entries" description="Latest records from all money activity." action={<Link href="/transactions" className="button-secondary">View all</Link>} />
          <div className="space-y-2">
            {recentEntries.length ? recentEntries.map((entry) => <RecentEntry key={entry.id} entry={entry} />) : (
              <p className="rounded-xl bg-[var(--notion-surface-soft)] p-3 text-sm text-[var(--notion-slate)]">No entries yet. Add today&apos;s first record.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[var(--notion-radius)] bg-[var(--notion-tint-yellow-bold)] p-4 text-sm text-[var(--notion-charcoal)]">
        <div className="flex items-center gap-2 font-semibold"><AlertTriangle size={18} /> Salary money is not available money.</div>
        <p className="mt-1">আগে future money আলাদা, তারপর spending.</p>
      </section>
    </>
  );
}

function RecentEntry({ entry }: { entry: Transaction }) {
  const label = entry.description || entry.category || entry.incomeSource || entry.bikeSubtype || entry.type.replace("_", " ");
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--notion-surface-soft)] px-3 py-2.5 text-sm">
      <div>
        <p className="font-semibold text-[var(--notion-ink)]">{label}</p>
        <p className="text-xs text-[var(--notion-slate)]">{formatDate(entry.date)} · {entry.type.replace("_", " ")}</p>
      </div>
      <BDTAmount amount={entry.amount} />
    </div>
  );
}

function severityRank(severity: "critical" | "warning" | "info") {
  if (severity === "critical") return 0;
  if (severity === "warning") return 1;
  return 2;
}
