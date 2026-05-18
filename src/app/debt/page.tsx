"use client";

import Link from "next/link";
import { CreditCard, PlusCircle, ShieldAlert, TrendingDown } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/StatCard";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { EmptyState, MetricCard, Pill, SectionHeader } from "@/components/ui/Premium";
import { getDebtPaid, getDebtProgress, getDebtRemaining } from "@/lib/calculations/debt";
import { formatDate, formatPercent } from "@/lib/format";

export default function DebtPage() {
  const { state } = useAppState();
  const payments = state.transactions
    .filter((tx) => tx.type === "debt_payment")
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
  const debtProgress = getDebtProgress(state);
  const remaining = getDebtRemaining(state);

  return (
    <>
      <PageHeader
        title="Credit Card Debt"
        subtitle="Debt-free হওয়া এখন priority."
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Add payment</Link>}
      />

      <section className="notion-hero-band mb-5 p-4 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-white/75">
              <CreditCard size={20} />
              <span className="text-sm font-semibold">Remaining debt</span>
            </div>
            <p className="mt-3 text-4xl font-semibold text-white sm:text-5xl"><BDTAmount amount={remaining} /></p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">
              Avoid new credit card spending until this debt is cleared.
            </p>
          </div>
          <div className="workspace-mockup-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Debt payoff progress</p>
              <Pill tone={remaining <= 0 ? "success" : "warning"}>{formatPercent(debtProgress)} cleared</Pill>
            </div>
            <ProgressBar value={debtProgress} tone="rose" />
            <p className="mt-3 text-sm text-[var(--notion-slate)]">
              Paid <BDTAmount amount={getDebtPaid(state.transactions)} /> so far.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Original Debt" value={<BDTAmount amount={state.debt.originalAmount || state.debt.outstanding} />} icon={CreditCard} tone="dark" />
        <MetricCard label="Total Paid" value={<BDTAmount amount={getDebtPaid(state.transactions)} />} icon={TrendingDown} tone="success" />
        <MetricCard label="Remaining" value={<BDTAmount amount={remaining} />} icon={ShieldAlert} tone="warning" />
        <MetricCard label="Suggested Minimum" value={<BDTAmount amount={state.debt.minimumPayment} />} />
      </section>

      <section className="mt-5 rounded-[var(--notion-radius)] bg-[var(--notion-tint-yellow-bold)] p-4 text-sm font-semibold text-[var(--notion-charcoal)]">
        Avoid new credit card spending until this debt is cleared.
      </section>

      <section className="notion-card mt-5 p-4">
        <SectionHeader title="Payment history" description="Every debt payment reduces the credit card balance." />
        <div className="space-y-2">
          {payments.length ? payments.map((payment) => (
            <div key={payment.id} className="grid gap-3 rounded-xl bg-[var(--notion-surface-soft)] px-3 py-2.5 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-semibold text-[var(--notion-ink)]">{payment.description || "Credit card payment"}</p>
                <p className="text-xs text-[var(--notion-slate)]">{formatDate(payment.date)} · from {payment.fromLocation?.replace("_", " ") ?? "location"}</p>
              </div>
              <BDTAmount amount={payment.amount} />
            </div>
          )) : (
            <EmptyState
              title="No debt payments yet"
              description="Add your first debt payment to start tracking the payoff progress."
              action={<Link href="/add" className="notion-primary-button"><PlusCircle size={18} /> Add payment</Link>}
            />
          )}
        </div>
      </section>
    </>
  );
}
