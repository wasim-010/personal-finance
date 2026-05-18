"use client";

import Link from "next/link";
import { useState } from "react";
import { LockKeyhole, PlusCircle, ShieldCheck, WalletCards } from "lucide-react";
import { FUND_LABELS, type FundKey } from "@/types/finance";
import { useAppState } from "@/lib/state/useAppState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/StatCard";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { MetricCard, Pill, SectionHeader } from "@/components/ui/Premium";
import { getFundProgress } from "@/lib/calculations/funds";
import { fundDescriptions } from "@/lib/defaults/funds";
import { formatPercent } from "@/lib/format";
import { getTotalProtectedBalance } from "@/lib/calculations/balance";

type FundFilter = "all" | "baby" | "safety" | "bike" | "household" | "debt";

const fundGroups: Record<Exclude<FundFilter, "all">, FundKey[]> = {
  baby: ["baby_delivery", "baby_starter"],
  safety: ["emergency"],
  bike: ["fuel", "engine_oil", "parking", "bike_maintenance"],
  household: ["household_maintenance"],
  debt: ["credit_card_payment"],
};

const filterLabels: { value: FundFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "baby", label: "Baby" },
  { value: "safety", label: "Safety" },
  { value: "bike", label: "Bike" },
  { value: "household", label: "Household" },
  { value: "debt", label: "Debt" },
];

export default function FundsPage() {
  const { state } = useAppState();
  const [filter, setFilter] = useState<FundFilter>("all");
  const keys = (filter === "all" ? Object.keys(FUND_LABELS) : fundGroups[filter]) as FundKey[];
  const protectedMoney = getTotalProtectedBalance(state.fundBalances);
  const totalTarget = Object.values(state.settings.fundTargets).reduce((sum, value) => sum + value, 0);
  const overallPercent = totalTarget > 0 ? Math.min((protectedMoney / totalTarget) * 100, 100) : 100;

  return (
    <>
      <PageHeader
        title="Money Buckets"
        subtitle="Protected money reduces spendable balance"
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Add fund entry</Link>}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Protected Balance" value={<BDTAmount amount={protectedMoney} />} icon={LockKeyhole} tone="dark" note="Future money, not spending money" />
        <MetricCard label="Total Fund Targets" value={<BDTAmount amount={totalTarget} />} icon={WalletCards} />
        <MetricCard label="Overall Progress" value={formatPercent(overallPercent)} icon={ShieldCheck} tone={overallPercent >= 50 ? "success" : "warning"} />
      </section>

      <section className="mt-4 notion-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--notion-ink)]">Protected vaults</p>
            <p className="text-sm text-[var(--notion-slate)]">যে টাকা future-এর জন্য, সেটা হাতে রাখা যাবে না.</p>
          </div>
          <Pill tone="primary">Fund Deposit = protect money</Pill>
        </div>
        <ProgressBar value={overallPercent} />
      </section>

      <section className="mt-5">
        <SectionHeader
          title="Fund groups"
          description="Use filters to focus on baby, safety, bike, household, or debt money."
        />
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {filterLabels.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition ${
                filter === option.value
                  ? "bg-[var(--notion-brand-navy)] text-white"
                  : "border border-[var(--notion-hairline)] bg-white text-[var(--notion-slate)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {keys.map((key) => {
            const progress = getFundProgress(key, state.fundBalances, state.settings);
            return <FundCard key={key} fundKey={key} progress={progress} />;
          })}
        </div>
      </section>
    </>
  );
}

function FundCard({
  fundKey,
  progress,
}: {
  fundKey: FundKey;
  progress: ReturnType<typeof getFundProgress>;
}) {
  const complete = progress.percentage >= 100;
  const low = progress.target > 0 && progress.percentage < 50;

  return (
    <article className="notion-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--notion-ink)]">{FUND_LABELS[fundKey]}</h2>
            <Pill tone={complete ? "success" : low ? "warning" : "primary"}>{formatPercent(progress.percentage)}</Pill>
          </div>
          <p className="mt-1 text-sm leading-6 text-[var(--notion-slate)]">{fundDescriptions[fundKey]}</p>
        </div>
        <LockKeyhole size={19} className="text-[var(--notion-primary)]" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm text-[var(--notion-slate)]">Saved</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--notion-ink)]"><BDTAmount amount={progress.balance} /></p>
        </div>
        <div className="rounded-xl bg-[var(--notion-surface-soft)] px-3 py-2 text-sm">
          <p className="text-[var(--notion-slate)]">Target</p>
          <p className="font-semibold"><BDTAmount amount={progress.target} /></p>
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar value={progress.percentage} />
        <p className="mt-2 text-sm text-[var(--notion-slate)]">
          <BDTAmount amount={progress.remaining} /> remaining. Baby fund touch করবেন না.
        </p>
      </div>
    </article>
  );
}
