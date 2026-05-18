"use client";

import Link from "next/link";
import { Baby, LockKeyhole, PlusCircle, ShieldCheck } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { FUND_LABELS } from "@/types/finance";
import { getFundProgress } from "@/lib/calculations/funds";
import { PageHeader } from "@/components/ui/PageHeader";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { EmptyState, MetricCard, ProgressRow, SectionHeader } from "@/components/ui/Premium";
import { formatDate } from "@/lib/format";

export default function BabyFundPage() {
  const { state } = useAppState();
  const delivery = getFundProgress("baby_delivery", state.fundBalances, state.settings);
  const starter = getFundProgress("baby_starter", state.fundBalances, state.settings);
  const totalBabyProtected = delivery.balance + starter.balance;
  const totalBabyTarget = delivery.target + starter.target;
  const babyHistory = state.transactions
    .filter((tx) => tx.fundKey === "baby_delivery" || tx.fundKey === "baby_starter" || tx.toFundKey === "baby_delivery" || tx.toFundKey === "baby_starter")
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`))
    .slice(0, 8);

  return (
    <>
      <PageHeader
        title="Baby Fund"
        subtitle="Baby fund touch করবেন না."
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Add saving</Link>}
      />

      <section className="notion-hero-band mb-5 p-4 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-white/75">
              <Baby size={20} />
              <span className="text-sm font-semibold">Protected for baby</span>
            </div>
            <p className="mt-3 text-4xl font-semibold text-white sm:text-5xl"><BDTAmount amount={totalBabyProtected} /></p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">
              This money is only for delivery, medical safety, and starter baby needs. Keep it protected before spending.
            </p>
          </div>
          <div className="workspace-mockup-card p-4">
            <p className="text-sm text-[var(--notion-slate)]">Total baby target</p>
            <p className="mt-1 text-2xl font-semibold"><BDTAmount amount={totalBabyTarget} /></p>
            <p className="mt-3 rounded-xl bg-[var(--notion-tint-yellow)] p-3 text-sm text-[#6f4e00]">
              This fund is only for baby delivery and medical safety.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label={FUND_LABELS.baby_delivery} value={<BDTAmount amount={delivery.balance} />} icon={ShieldCheck} tone="success" />
        <MetricCard label={FUND_LABELS.baby_starter} value={<BDTAmount amount={starter.balance} />} icon={Baby} />
        <MetricCard label="Protected for Baby" value={<BDTAmount amount={totalBabyProtected} />} icon={LockKeyhole} tone="dark" />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <ProgressRow label={FUND_LABELS.baby_delivery} current={delivery.balance} target={delivery.target} helper="Delivery and medical safety." />
        <ProgressRow label={FUND_LABELS.baby_starter} current={starter.balance} target={starter.target} helper="Diaper, medicine, doctor, clothes, milk." />
      </section>

      <section className="mt-5 rounded-xl border border-[var(--notion-hairline)] bg-white p-4 text-sm">
        <p className="font-semibold text-[var(--notion-ink)]">Next milestone</p>
        <p className="mt-1 text-[var(--notion-slate)]">Save first <BDTAmount amount={Math.min(Math.max(totalBabyTarget - totalBabyProtected, 0), 5000)} /> toward the baby target.</p>
      </section>

      <section className="mt-5 notion-card p-4">
        <SectionHeader title="Baby savings history" description="Recent deposits and transfers connected to baby funds." />
        <div className="space-y-2">
          {babyHistory.length ? babyHistory.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--notion-surface-soft)] px-3 py-2.5 text-sm">
              <div>
                <p className="font-semibold text-[var(--notion-ink)]">{entry.description || (entry.fundKey ? FUND_LABELS[entry.fundKey] : "Baby fund transfer")}</p>
                <p className="text-xs text-[var(--notion-slate)]">{formatDate(entry.date)} · {entry.type.replace("_", " ")}</p>
              </div>
              <BDTAmount amount={entry.amount} />
            </div>
          )) : (
            <EmptyState title="No baby fund entries yet" description="Add a Fund Deposit to Baby Delivery or Baby Starter when money is protected." action={<Link href="/add" className="notion-primary-button"><PlusCircle size={18} /> Add saving</Link>} />
          )}
        </div>
      </section>
    </>
  );
}
