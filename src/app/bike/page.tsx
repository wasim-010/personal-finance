"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bike, Fuel, Gauge, PlusCircle } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { PageHeader } from "@/components/ui/PageHeader";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { ProgressBar } from "@/components/ui/StatCard";
import { CompactStat, EmptyState, MetricCard, Pill, PlainRow, SectionHeader } from "@/components/ui/Premium";
import { getCurrentCycle, getCycleTransactions } from "@/lib/calculations/cycle";
import { getBikeReport, getPartForecast } from "@/lib/calculations/bike";
import { getDebtRemaining } from "@/lib/calculations/debt";
import { formatDate, todayKey } from "@/lib/format";
import type { Transaction } from "@/types/finance";

export default function BikePage() {
  const { state } = useAppState();
  const [showAllParts, setShowAllParts] = useState(false);
  const cycle = getCurrentCycle(state.settings);
  const cycleTransactions = getCycleTransactions(state.transactions, cycle);
  const report = getBikeReport(state, cycleTransactions);
  const bikeEntries = state.transactions
    .filter((tx) => tx.type === "bike_entry" || tx.type === "bike_km")
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
  const nextAction = getBikeNextAction(
    state.transactions,
    report.currentOdo,
    state.fundBalances.baby_delivery,
    state.settings.fundTargets.baby_delivery,
    getDebtRemaining(state),
  );
  const visibleParts = showAllParts ? state.settings.bikeParts : state.settings.bikeParts.filter((part) => part.reminderEnabled);

  return (
    <>
      <PageHeader
        title="Bike Tracker"
        subtitle="ODO, fuel, engine oil, parking, maintenance reserve"
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Add bike entry</Link>}
      />

      <section className="notion-card mb-4 p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={report.health === "Danger" ? "danger" : report.health === "Safe" ? "success" : "warning"}>{report.health}</Pill>
              <Pill tone="primary">ODO based</Pill>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--notion-ink)]">
              {report.currentOdo.toLocaleString("en-IN")} km current ODO
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--notion-slate)]">
              Fuel, oil, parking, and maintenance stay separated so bike cost does not hide inside groceries.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--notion-hairline)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--notion-slate)]">True cost this cycle</p>
            <p className="mt-2 text-2xl font-semibold"><BDTAmount amount={report.estimatedTrueCost} /></p>
            <p className="mt-1 text-sm text-[var(--notion-slate)]"><BDTAmount amount={report.trueCostPerKm} /> per km</p>
          </div>
        </div>
      </section>

      <section className="notion-card mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--notion-primary-deep)]">Next Action</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--notion-ink)]">{nextAction.title}</h2>
            <p className="mt-1 text-sm text-[var(--notion-slate)]">{nextAction.helper}</p>
          </div>
          <Link href={nextAction.href} className="button-secondary">
            {nextAction.cta}
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Current ODO" value={`${report.currentOdo.toLocaleString("en-IN")} km`} icon={Gauge} tone="dark" />
        <MetricCard label="Cycle KM" value={`${Math.round(report.kmRun).toLocaleString("en-IN")} km`} icon={Bike} />
        <MetricCard label="Fuel Cost" value={<BDTAmount amount={report.fuelCost} />} icon={Fuel} />
        <MetricCard label="Parking" value={<BDTAmount amount={report.parkingCost} />} />
        <MetricCard label="Cash Cost" value={<BDTAmount amount={report.totalCashCost} />} />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="notion-card p-4">
          <SectionHeader
            title="Cost per KM breakdown"
            description="Fuel, oil, maintenance reserve, and true cost are kept separate."
          />
          <div className="space-y-3">
            <CostRow label="Cash cost per KM" value={report.cashCostPerKm} helper="Actual paid bike expenses divided by KM run." />
            <CostRow label="Fuel cost per KM" value={report.fuelCostPerKm} helper="Fuel price divided by expected mileage." />
            <CostRow label="Engine oil cost per KM" value={report.engineOilCostPerKm} helper="Oil price divided by oil life." />
            <CostRow label="Maintenance reserve per KM" value={report.maintenanceReservePerKm} helper="Future tyre, brake, chain, and repair reserve." />
            <CostRow label="True cost per KM" value={report.trueCostPerKm} helper="Long-term full bike cost estimate." strong />
          </div>
        </article>

        <article className="notion-card p-4">
          <SectionHeader
            title="Oil & fund health"
            description="This prevents oil and maintenance from becoming surprise expenses."
            action={<Pill tone={report.health === "Danger" ? "danger" : report.health === "Safe" ? "success" : "warning"}>{report.health}</Pill>}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <CompactStat label="Last oil change ODO" value={`${report.lastOilChangeOdo.toLocaleString("en-IN")} km`} />
            <CompactStat label="Next oil change ODO" value={`${report.nextOilChangeOdo.toLocaleString("en-IN")} km`} />
            <CompactStat label="KM before oil change" value={`${report.kmRemainingBeforeOilChange.toLocaleString("en-IN")} km`} />
            <CompactStat label="Engine Oil Fund" value={<BDTAmount amount={report.engineOilFundBalance} />} />
            <CompactStat label="Oil shortfall" value={<BDTAmount amount={report.oilFundShortfall} />} />
            <CompactStat label="Maintenance Fund" value={<BDTAmount amount={report.maintenanceFundBalance} />} />
          </div>
          <div className="mt-4 rounded-xl bg-[var(--notion-surface-soft)] p-3">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-[var(--notion-slate)]">Bike fund health</span>
              <strong>{report.health}</strong>
            </div>
            <ProgressBar value={report.health === "Safe" ? 100 : report.health === "Careful" ? 65 : 30} tone={report.health === "Danger" ? "rose" : "emerald"} />
          </div>
        </article>
      </section>

      <section className="mt-5 notion-card p-4">
        <SectionHeader
          title="Parts forecast"
          description="Active reminders first. Expand a part for mobile detail."
        />
        <div className="overflow-hidden rounded-xl border border-[var(--notion-hairline)]">
          <div className="hidden grid-cols-[1fr_120px_1fr_120px] gap-3 bg-[var(--notion-surface-soft)] px-3 py-2 text-xs font-semibold uppercase text-[var(--notion-slate)] md:grid">
            <span>Part</span>
            <span>Price</span>
            <span>Forecast</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[var(--notion-hairline)] bg-white">
            {visibleParts.map((part) => {
              const forecast = getPartForecast(part, report.currentOdo);
              return (
                <details key={part.id} className="group px-3 py-3 text-sm">
                  <summary className="grid cursor-pointer list-none gap-2 md:grid-cols-[1fr_120px_1fr_120px] md:items-center">
                    <strong className="text-[var(--notion-ink)]">{part.name}</strong>
                    <BDTAmount amount={part.estimatedPrice} />
                    <p className="text-[var(--notion-slate)]">
                      {forecast.nextReplacementOdo ? `Next around ${forecast.nextReplacementOdo.toLocaleString("en-IN")} km` : "Set ODO/interval in Settings"}
                    </p>
                    <Pill tone={part.reminderEnabled ? "success" : "neutral"}>{part.reminderEnabled ? "Reminder on" : "Off"}</Pill>
                  </summary>
                  <div className="mt-2 rounded-lg bg-[var(--notion-surface-soft)] p-3 text-[var(--notion-slate)] md:hidden">
                    {typeof forecast.kmRemaining === "number" ? `${forecast.kmRemaining.toLocaleString("en-IN")} km left` : "Add interval and last replacement in Settings."}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
        {!showAllParts && visibleParts.length < state.settings.bikeParts.length ? (
          <button type="button" className="button-secondary mt-3 w-full" onClick={() => setShowAllParts(true)}>Show all parts</button>
        ) : null}
      </section>

      <section className="mt-5 notion-card p-4">
        <SectionHeader title="Recent bike entries" description="Latest ODO, fuel, oil, parking, and maintenance records." />
        <div className="space-y-2">
          {bikeEntries.length ? bikeEntries.slice(0, 8).map((entry) => (
            <div key={entry.id} className="grid gap-3 rounded-xl bg-[var(--notion-surface-soft)] px-3 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[var(--notion-ink)]">{entry.bikeSubtype ?? "Bike KM Cost"}</p>
                  {entry.partName ? <Pill tone="primary">{entry.partName}</Pill> : null}
                </div>
                <p className="mt-1 text-xs text-[var(--notion-slate)]">
                  {formatDate(entry.date)} - ODO {entry.currentOdo?.toLocaleString("en-IN") ?? "-"} - KM {entry.kmRun ?? entry.km ?? 0}
                </p>
              </div>
              <BDTAmount amount={entry.amount} />
            </div>
          )) : (
            <EmptyState
              title="No bike entries yet"
              description="Add your current ODO first. Future fuel and maintenance calculations become more accurate after that."
              action={<Link href="/add" className="notion-primary-button"><PlusCircle size={18} /> Add ODO</Link>}
            />
          )}
        </div>
      </section>
    </>
  );
}

function CostRow({ label, value, helper, strong }: { label: string; value: number; helper: string; strong?: boolean }) {
  return (
    <PlainRow
      label={label}
      helper={helper}
      value={<BDTAmount amount={value} className="font-semibold" />}
      strong={strong}
    />
  );
}

function getBikeNextAction(
  transactions: Transaction[],
  currentOdo: number,
  babyBalance: number,
  babyTarget: number,
  debtRemaining: number,
) {
  const today = todayKey();
  if (!transactions.some((tx) => tx.type === "opening_balance")) {
    return { title: "Add opening balance", helper: "Bike expenses need real cash locations first.", href: "/add", cta: "Add balance" };
  }
  if (!currentOdo) {
    return { title: "Add current ODO", helper: "ODO unlocks fuel, oil, and maintenance accuracy.", href: "/add", cta: "Add ODO" };
  }
  if (!transactions.some((tx) => tx.date === today && (tx.type === "expense" || tx.type === "bike_entry" || tx.type === "household_maintenance"))) {
    return { title: "Add today's expense", helper: "Record today's bike or family spending before it disappears.", href: "/add", cta: "Record expense" };
  }
  if (babyTarget > 0 && babyBalance < babyTarget) {
    return { title: "Protect baby fund", helper: "Keep family savings ahead of optional bike spending.", href: "/add", cta: "Protect fund" };
  }
  if (debtRemaining > 0) {
    return { title: "Pay credit card", helper: "Lower card pressure before new running costs.", href: "/add", cta: "Record payment" };
  }
  return { title: "Move salary into funds", helper: "Keep fuel, oil, and maintenance money separated early.", href: "/cash-flow", cta: "Open plan" };
}
