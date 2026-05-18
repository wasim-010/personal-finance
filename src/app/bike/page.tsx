"use client";

import Link from "next/link";
import { Bike, Fuel, Gauge, PlusCircle, ShieldCheck } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { PageHeader } from "@/components/ui/PageHeader";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { ProgressBar } from "@/components/ui/StatCard";
import { CompactStat, EmptyState, MetricCard, Pill, SectionHeader } from "@/components/ui/Premium";
import { getCurrentCycle, getCycleTransactions } from "@/lib/calculations/cycle";
import { getBikeReport, getPartForecast } from "@/lib/calculations/bike";
import { formatDate } from "@/lib/format";

export default function BikePage() {
  const { state } = useAppState();
  const cycle = getCurrentCycle(state.settings);
  const cycleTransactions = getCycleTransactions(state.transactions, cycle);
  const report = getBikeReport(state, cycleTransactions);
  const bikeEntries = state.transactions
    .filter((tx) => tx.type === "bike_entry" || tx.type === "bike_km")
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));

  return (
    <>
      <PageHeader
        title="Bike Tracker"
        subtitle="ODO, fuel, engine oil, parking, maintenance reserve"
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Add bike entry</Link>}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Current ODO" value={`${report.currentOdo.toLocaleString("en-IN")} km`} icon={Gauge} tone="dark" />
        <MetricCard label="Cycle KM" value={`${Math.round(report.kmRun).toLocaleString("en-IN")} km`} icon={Bike} />
        <MetricCard label="Fuel Cost" value={<BDTAmount amount={report.fuelCost} />} icon={Fuel} />
        <MetricCard label="Parking" value={<BDTAmount amount={report.parkingCost} />} />
        <MetricCard label="Cash Cost" value={<BDTAmount amount={report.totalCashCost} />} />
        <MetricCard label="True Cost" value={<BDTAmount amount={report.estimatedTrueCost} />} icon={ShieldCheck} tone="success" />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="notion-card p-4">
          <SectionHeader
            title="Cost per KM breakdown"
            description="Fuel, oil, maintenance reserve, and true cost are kept separate."
          />
          <div className="space-y-3">
            <CostBar label="Cash cost per KM" value={report.cashCostPerKm} max={report.trueCostPerKm} />
            <CostBar label="Fuel cost per KM" value={report.fuelCostPerKm} max={report.trueCostPerKm} />
            <CostBar label="Engine oil cost per KM" value={report.engineOilCostPerKm} max={report.trueCostPerKm} />
            <CostBar label="Maintenance reserve per KM" value={report.maintenanceReservePerKm} max={report.trueCostPerKm} />
            <CostBar label="True cost per KM" value={report.trueCostPerKm} max={report.trueCostPerKm} strong />
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
          description="Estimated prices and replacement intervals from Settings."
        />
        <div className="overflow-hidden rounded-xl border border-[var(--notion-hairline)]">
          <div className="hidden grid-cols-[1fr_120px_1fr_120px] gap-3 bg-[var(--notion-surface-soft)] px-3 py-2 text-xs font-semibold uppercase text-[var(--notion-slate)] md:grid">
            <span>Part</span>
            <span>Price</span>
            <span>Forecast</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[var(--notion-hairline)] bg-white">
            {state.settings.bikeParts.map((part) => {
              const forecast = getPartForecast(part, report.currentOdo);
              return (
                <div key={part.id} className="grid gap-2 px-3 py-3 text-sm md:grid-cols-[1fr_120px_1fr_120px] md:items-center">
                  <strong className="text-[var(--notion-ink)]">{part.name}</strong>
                  <BDTAmount amount={part.estimatedPrice} />
                  <p className="text-[var(--notion-slate)]">
                    {forecast.nextReplacementOdo ? `Next around ${forecast.nextReplacementOdo.toLocaleString("en-IN")} km` : "Set ODO/interval in Settings"}
                    {typeof forecast.kmRemaining === "number" ? ` · ${forecast.kmRemaining.toLocaleString("en-IN")} km left` : ""}
                  </p>
                  <Pill tone={part.reminderEnabled ? "success" : "neutral"}>{part.reminderEnabled ? "Reminder on" : "Off"}</Pill>
                </div>
              );
            })}
          </div>
        </div>
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
                  {formatDate(entry.date)} · ODO {entry.currentOdo?.toLocaleString("en-IN") ?? "-"} · KM {entry.kmRun ?? entry.km ?? 0}
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

function CostBar({ label, value, max, strong }: { label: string; value: number; max: number; strong?: boolean }) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="rounded-xl bg-[var(--notion-surface-soft)] p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className={strong ? "font-semibold text-[var(--notion-ink)]" : "text-[var(--notion-slate)]"}>{label}</span>
        <BDTAmount amount={value} className="font-semibold" />
      </div>
      <ProgressBar value={percent} />
    </div>
  );
}
