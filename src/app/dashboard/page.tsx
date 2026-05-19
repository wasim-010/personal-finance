"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Baby, CreditCard, LockKeyhole, PlusCircle, ShieldCheck, Wallet } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/StatCard";
import { AlertCard, CompactStat, MetricCard, Pill, PlainRow, SectionHeader } from "@/components/ui/Premium";
import { FUND_LABELS, type FundKey, type Transaction } from "@/types/finance";
import { computeSpendable, getTotalLocationBalance, getTotalProtectedBalance } from "@/lib/calculations/balance";
import { getCurrentCycle, getCycleTotals, getCycleTransactions } from "@/lib/calculations/cycle";
import { getFundProgress } from "@/lib/calculations/funds";
import { computeWarnings } from "@/lib/calculations/warnings";
import { getDebtPaid, getDebtProgress, getDebtRemaining } from "@/lib/calculations/debt";
import { getBikeReport } from "@/lib/calculations/bike";
import { CategoryChart, NeedWantWasteChart } from "@/components/dashboard/DashboardCharts";
import { formatDate, formatDateShort, formatPercent, todayKey } from "@/lib/format";

const locationLabels: Record<string, string> = {
  bank: "Bank",
  wallet: "Wallet / Cash in Hand",
  cash_envelope: "Cash Envelope",
  bkash: "bKash",
  nagad: "Nagad",
};

export default function DashboardPage() {
  const { state } = useAppState();
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const cycle = getCurrentCycle(state.settings);
  const cycleTransactions = getCycleTransactions(state.transactions, cycle);
  const totals = getCycleTotals(cycleTransactions);
  const spendable = computeSpendable(state.locationBalances, state.fundBalances);
  const totalLocation = getTotalLocationBalance(state.locationBalances);
  const protectedMoney = getTotalProtectedBalance(state.fundBalances);
  const warnings = computeWarnings(state).sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  const visibleWarnings = warnings.slice(0, 2);
  const hiddenWarnings = warnings.slice(2);
  const bikeReport = getBikeReport(state, cycleTransactions);
  const hasBikeEntries = state.transactions.some((tx) => tx.type === "bike_entry" || tx.type === "bike_km");
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
  const hasSpendingData = categoryData.length > 0 || totals.needs > 0 || totals.wants > 0 || totals.waste > 0;
  const nextAction = getDashboardNextAction(
    state.transactions,
    state.fundBalances.baby_delivery,
    state.settings.fundTargets.baby_delivery,
    getDebtRemaining(state),
    totals.income,
  );
  const babyDeliveryProgress = getFundProgress("baby_delivery", state.fundBalances, state.settings);
  const babyStarterProgress = getFundProgress("baby_starter", state.fundBalances, state.settings);
  const emergencyProgress = getFundProgress("emergency", state.fundBalances, state.settings);
  const creditCardProgress = getFundProgress("credit_card_payment", state.fundBalances, state.settings);
  const bikeFundCurrent = ["fuel", "engine_oil", "bike_maintenance"].reduce((sum, key) => sum + (state.fundBalances[key as FundKey] ?? 0), 0);
  const bikeFundTarget = ["fuel", "engine_oil", "bike_maintenance"].reduce((sum, key) => sum + (state.settings.fundTargets[key as FundKey] ?? 0), 0);
  const mainProgressRows = [
    { key: "baby_delivery", label: FUND_LABELS.baby_delivery, current: babyDeliveryProgress.balance, target: babyDeliveryProgress.target, helper: "Delivery money stays protected." },
    { key: "baby_starter", label: FUND_LABELS.baby_starter, current: babyStarterProgress.balance, target: babyStarterProgress.target, helper: "First baby costs stay separate." },
    { key: "emergency", label: FUND_LABELS.emergency, current: emergencyProgress.balance, target: emergencyProgress.target, helper: "Family safety reserve." },
    { key: "credit_card_payment", label: FUND_LABELS.credit_card_payment, current: creditCardProgress.balance, target: creditCardProgress.target, helper: "Reserved for next card payment." },
    { key: "bike_funds", label: "Bike Funds", current: bikeFundCurrent, target: bikeFundTarget, helper: "Fuel, oil, and maintenance together." },
  ];

  return (
    <>
      <PageHeader
        title="Family Money Dashboard"
        subtitle={`${cycle.label} - ${formatDateShort(cycle.start)} to ${formatDateShort(cycle.end)}`}
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Add entry</Link>}
      />

      <section className="notion-hero-band mb-5 p-4 sm:p-7 lg:p-8">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
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
                This is the money you can actually spend after baby, debt, emergency, and bike money are protected.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <CompactStat label="Total physical money" value={<BDTAmount amount={totalLocation} />} />
              <CompactStat label="Protected money" value={<BDTAmount amount={protectedMoney} />} />
              <CompactStat label="Days remaining" value={`${remainingDays} days`} />
            </div>
          </div>

          <div className="workspace-mockup-card p-4">
            <div className="mb-4 rounded-xl bg-[var(--notion-surface-soft)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--notion-primary-deep)]">Today&apos;s Priority</p>
              <h2 className="mt-1 text-lg font-semibold text-[var(--notion-ink)]">{nextAction.title}</h2>
              <p className="mt-1 text-sm leading-5 text-[var(--notion-slate)]">{nextAction.helper}</p>
              <Link href={nextAction.href} className="button-secondary mt-3 w-full justify-center">
                {nextAction.cta}
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="mb-3 flex items-center justify-between border-b border-[var(--notion-hairline)] pb-3">
              <div>
                <p className="text-sm font-semibold">{cycle.label}</p>
                <p className="text-xs text-[var(--notion-slate)]">Cycle progress - {formatPercent(cycleProgress)}</p>
              </div>
              <ShieldCheck size={19} className="text-[var(--notion-primary)]" />
            </div>
            <ProgressBar value={cycleProgress} />
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {Object.entries(state.locationBalances).map(([location, balance]) => (
                <LocationMiniRow key={location} label={locationLabels[location] ?? location} amount={balance} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard compact label="Cycle Income" value={<BDTAmount amount={totals.income} />} icon={Wallet} tone="success" />
        <MetricCard compact label="Cycle Expense" value={<BDTAmount amount={totals.expenses} />} icon={Wallet} />
        <MetricCard compact label="Baby Progress" value={formatPercent(babyDeliveryProgress.percentage)} icon={Baby} />
        <MetricCard compact label="Debt Remaining" value={<BDTAmount amount={getDebtRemaining(state)} />} icon={CreditCard} tone="warning" />
        <MetricCard compact label="Emergency Fund" value={<BDTAmount amount={state.fundBalances.emergency} />} icon={LockKeyhole} />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.82fr]">
        <div className="notion-card p-4">
          <SectionHeader
            title="Protected money"
            description="These are the numbers that decide if future money is safe."
          />
          <div className="space-y-2">
            {mainProgressRows.map((row) => (
              <DashboardProgressRow
                key={row.key}
                label={row.label}
                current={row.current}
                target={row.target}
                helper={row.helper}
              />
            ))}
          </div>
        </div>

        <div className="notion-card p-4">
          <SectionHeader title="Debt control" description="Keep card pressure visible, but not noisy." />
          <div className="rounded-xl bg-[var(--notion-surface-soft)] p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--notion-slate)]">Remaining debt</p>
                <p className="mt-1 text-3xl font-semibold text-[var(--notion-ink)]"><BDTAmount amount={getDebtRemaining(state)} /></p>
              </div>
              <Pill tone={getDebtRemaining(state) > 0 ? "warning" : "success"}>{formatPercent(getDebtProgress(state))}</Pill>
            </div>
            <ProgressBar value={getDebtProgress(state)} tone="rose" />
            <p className="mt-3 text-sm leading-6 text-[var(--notion-slate)]">
              Paid <BDTAmount amount={getDebtPaid(state.transactions)} />. Avoid new card spending until this is cleared.
            </p>
          </div>
        </div>
      </section>

      {warnings.length ? (
        <section className="mt-5 notion-card p-4">
          <SectionHeader title="Smart alerts" description="Highest priority first. Extra alerts stay tucked away." />
          <div className="grid gap-2 md:grid-cols-3">
            {visibleWarnings.map((warning) => (
              <AlertCard key={warning.id} severity={warning.severity} message={warning.message} />
            ))}
          </div>
          {hiddenWarnings.length ? (
            <details className="mt-2 rounded-xl border border-[var(--notion-hairline)] bg-white p-3">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--notion-primary-deep)]">View remaining alerts ({hiddenWarnings.length})</summary>
              <div className="mt-3 grid gap-2">
                {hiddenWarnings.map((warning) => (
                  <AlertCard key={warning.id} severity={warning.severity} message={warning.message} />
                ))}
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      <section className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="notion-card p-4">
          <SectionHeader title="Bike snapshot" description="Quiet summary. Full ODO details stay on the bike page." action={<Link href="/bike" className="button-secondary">Open bike tracker</Link>} />
          {hasBikeEntries ? (
            <div className="space-y-2">
              <PlainRow label="Current ODO" value={`${bikeReport.currentOdo.toLocaleString("en-IN")} km`} />
              <PlainRow label="Cycle KM" value={`${Math.round(bikeReport.kmRun).toLocaleString("en-IN")} km`} />
              <PlainRow label="Fuel / KM" value={<BDTAmount amount={bikeReport.fuelCostPerKm} />} />
              <PlainRow label="True bike cost" value={<BDTAmount amount={bikeReport.estimatedTrueCost} />} strong />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--notion-hairline-strong)] bg-white p-4 text-sm text-[var(--notion-slate)]">
              Bike tracking starts after your first ODO entry.
            </div>
          )}
        </div>

        <div className="notion-card p-4">
          <SectionHeader title="Recent entries" description="Latest records from all money activity." action={<Link href="/transactions" className="button-secondary">View all</Link>} />
          <div className="space-y-2">
            {recentEntries.length ? recentEntries.slice(0, 3).map((entry) => <RecentEntry key={entry.id} entry={entry} />) : (
              <p className="rounded-xl bg-[var(--notion-surface-soft)] p-3 text-sm text-[var(--notion-slate)]">No entries yet. Add today&apos;s first record.</p>
            )}
          </div>
        </div>
      </section>

      <details
        className="mt-5 notion-card overflow-hidden"
        open={analysisOpen}
        onToggle={(event) => setAnalysisOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer list-none p-4">
          <SectionHeader
            title="Spending analysis"
            description="Open when you want charts. The daily decision screen stays above."
          />
        </summary>
        <div className="border-t border-[var(--notion-hairline)] p-4">
          {analysisOpen && hasSpendingData ? (
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <CategoryChart data={categoryData} />
              <NeedWantWasteChart need={totals.needs} want={totals.wants} waste={totals.waste} />
            </div>
          ) : analysisOpen ? (
            <div className="rounded-xl border border-dashed border-[var(--notion-hairline-strong)] bg-white px-4 py-3 text-sm text-[var(--notion-slate)]">
              No spending data yet. Add today&apos;s first expense.
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--notion-surface-soft)] px-4 py-3 text-sm text-[var(--notion-slate)]">
              Open this section when you want category charts.
            </div>
          )}
        </div>
      </details>

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
        <p className="text-xs text-[var(--notion-slate)]">{formatDate(entry.date)} - {entry.type.replace("_", " ")}</p>
      </div>
      <BDTAmount amount={entry.amount} />
    </div>
  );
}

function LocationMiniRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[var(--notion-surface-soft)] px-3 py-2 text-sm">
      <span className="text-[var(--notion-slate)]">{label}</span>
      <BDTAmount amount={amount} className="font-semibold" />
    </div>
  );
}

function DashboardProgressRow({
  label,
  current,
  target,
  helper,
}: {
  label: string;
  current: number;
  target: number;
  helper: string;
}) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 100;
  const remaining = Math.max(target - current, 0);

  return (
    <div className="rounded-xl border border-[var(--notion-hairline)] bg-white px-3 py-3">
      <div className="mb-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="text-sm font-semibold text-[var(--notion-ink)]">{label}</p>
          <p className="mt-0.5 text-xs text-[var(--notion-slate)]">{helper}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold text-[var(--notion-ink)]">
            <BDTAmount amount={current} /> / <BDTAmount amount={target} />
          </p>
          <p className="text-xs text-[var(--notion-slate)]"><BDTAmount amount={remaining} /> left</p>
        </div>
      </div>
      <ProgressBar value={percentage} tone={percentage < 35 ? "rose" : "emerald"} />
    </div>
  );
}

function severityRank(severity: "critical" | "warning" | "info") {
  if (severity === "critical") return 0;
  if (severity === "warning") return 1;
  return 2;
}

function getDashboardNextAction(
  transactions: Transaction[],
  babyBalance: number,
  babyTarget: number,
  debtRemaining: number,
  cycleIncome: number,
) {
  const today = todayKey();
  if (!transactions.some((tx) => tx.type === "opening_balance")) {
    return { title: "Add opening balance", helper: "Start with the money currently in Bank, wallet, bKash, Nagad, and envelopes.", href: "/add", cta: "Add balance" };
  }
  if (!transactions.some((tx) => tx.date === today && (tx.type === "expense" || tx.type === "bike_entry" || tx.type === "household_maintenance"))) {
    return { title: "Add today's expense", helper: "Keep the cycle accurate with one quick entry.", href: "/add", cta: "Record expense" };
  }
  if (!transactions.some((tx) => tx.type === "bike_entry" && typeof tx.currentOdo === "number" && tx.currentOdo > 0)) {
    return { title: "Add current ODO", helper: "Bike cost gets cleaner after the first ODO reading.", href: "/add", cta: "Add ODO" };
  }
  if (babyTarget > 0 && babyBalance < babyTarget) {
    return { title: "Protect baby fund", helper: "Move available money into the delivery fund before extra spending.", href: "/add", cta: "Protect fund" };
  }
  if (debtRemaining > 0) {
    return { title: "Pay credit card", helper: "Reduce the card before new card spending.", href: "/add", cta: "Record payment" };
  }
  if (cycleIncome > 0) {
    return { title: "Move salary into funds", helper: "Salary money becomes usable only after the planned fund split.", href: "/cash-flow", cta: "Open plan" };
  }
  return { title: "Review recent entries", helper: "Check that every taka from today has a record.", href: "/transactions", cta: "Review" };
}

