"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, PlusCircle, Wallet } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { PageHeader } from "@/components/ui/PageHeader";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { ProgressBar } from "@/components/ui/StatCard";
import { MetricCard, Pill, SectionHeader } from "@/components/ui/Premium";
import { CASH_FLOW_PHASES } from "@/lib/defaults/cashFlow";
import { FUND_LABELS } from "@/types/finance";
import { formatPercent } from "@/lib/format";

export default function CashFlowPage() {
  const { state } = useAppState();
  const totalIncome = CASH_FLOW_PHASES.reduce((sum, phase) => sum + phase.amount, 0);
  const totalAllocated = CASH_FLOW_PHASES.reduce((sum, phase) => sum + phase.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0);

  return (
    <>
      <PageHeader
        title="Cash Flow Calendar"
        subtitle={`Salary date: ${state.settings.salaryDate}. Salary money is not available money.`}
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Record allocation</Link>}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Planned Income" value={<BDTAmount amount={totalIncome} />} icon={Wallet} tone="dark" />
        <MetricCard label="Planned Allocation" value={<BDTAmount amount={totalAllocated} />} icon={CheckCircle2} />
        <MetricCard label="Cycle Start" value={`Day ${state.settings.salaryDate}`} icon={CalendarDays} tone="success" />
      </section>

      <section className="mt-4 rounded-[var(--notion-radius)] border border-[#fedf89] bg-[var(--notion-tint-yellow)] p-4 text-sm font-medium text-[var(--notion-charcoal)]">
        Divide income as soon as it arrives. Fund deposits protect money; transfers physically move money between locations.
      </section>

      <section className="mt-5">
        <SectionHeader
          title="Money action plan"
          description="Follow these blocks in order when each income source arrives. Each phase is a focused allocation drawer."
        />
        <div className="space-y-4">
          {CASH_FLOW_PHASES.map((phase, index) => {
            const allocated = phase.items.reduce((sum, item) => sum + item.amount, 0);
            const percent = phase.amount > 0 ? Math.min((allocated / phase.amount) * 100, 100) : 0;
            const remaining = Math.max(phase.amount - allocated, 0);
            return (
              <details key={phase.id} className="notion-card overflow-hidden" open={index === 0}>
                <summary className="grid cursor-pointer list-none gap-3 bg-white p-4 lg:grid-cols-[220px_1fr]">
                  <div className="rounded-[var(--notion-radius)] bg-[var(--notion-brand-navy)] p-4 text-white">
                    <Pill tone="dark">Step {index + 1}</Pill>
                    <h2 className="mt-3 text-xl font-semibold">{phase.title}</h2>
                    <p className="mt-1 text-sm text-white/70">{phase.subtitle}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 sm:items-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--notion-slate)]">Income</p>
                      <BDTAmount amount={phase.amount} size="lg" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--notion-slate)]">Allocated</p>
                      <p className="font-semibold"><BDTAmount amount={allocated} /></p>
                    </div>
                    <Pill tone={percent >= 100 ? "success" : "primary"}>{formatPercent(percent)}</Pill>
                  </div>
                </summary>

                <div className="border-t border-[var(--notion-hairline)] bg-white p-4">
                    <div className="mb-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-[var(--notion-surface-soft)] p-3">
                        <p className="text-xs text-[var(--notion-slate)]">Allocated</p>
                        <p className="font-semibold"><BDTAmount amount={allocated} /></p>
                      </div>
                      <div className="rounded-xl bg-[var(--notion-surface-soft)] p-3">
                        <p className="text-xs text-[var(--notion-slate)]">Remaining</p>
                        <p className="font-semibold"><BDTAmount amount={remaining} /></p>
                      </div>
                      <div className="rounded-xl bg-[var(--notion-surface-soft)] p-3">
                        <p className="text-xs text-[var(--notion-slate)]">Progress</p>
                        <p className="font-semibold">{formatPercent(percent)}</p>
                      </div>
                    </div>
                    <ProgressBar value={percent} />
                    <div className="mt-4 space-y-2">
                      {phase.items.map((item) => (
                        <div key={`${phase.id}-${item.label}`} className="grid gap-2 rounded-xl border border-[var(--notion-hairline)] bg-white px-3 py-2.5 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-[var(--notion-ink)]">{item.label}</p>
                              {item.fundKey ? <Pill tone="primary">Fund</Pill> : item.category ? <Pill>Budget</Pill> : <Pill tone="warning">Buffer</Pill>}
                            </div>
                            <p className="mt-1 text-xs text-[var(--notion-slate)]">
                              {item.fundKey ? `Fund: ${FUND_LABELS[item.fundKey]}` : item.category ? `Category: ${item.category}` : item.note ?? "General buffer"}
                            </p>
                          </div>
                          <BDTAmount amount={item.amount} />
                        </div>
                      ))}
                    </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </>
  );
}
