"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, SlidersHorizontal, Trash2, Wallet, X } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { PageHeader } from "@/components/ui/PageHeader";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { EmptyState, MetricCard, Pill } from "@/components/ui/Premium";
import { formatDate } from "@/lib/format";
import { transactionTypeOptions } from "@/components/forms/AddEntryForm";
import type { Transaction, TransactionType } from "@/types/finance";

export default function TransactionsPage() {
  const { state, dispatch } = useAppState();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TransactionType | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(
    () =>
      state.transactions
        .filter((tx) => {
          const text = `${tx.description ?? ""} ${tx.category ?? ""} ${tx.incomeSource ?? ""} ${tx.fundKey ?? ""}`.toLowerCase();
          return text.includes(query.toLowerCase()) && (type === "all" || tx.type === type);
        })
        .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`)),
    [query, state.transactions, type],
  );
  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = filtered
    .filter((tx) => tx.type === "expense" || tx.type === "bike_entry" || tx.type === "bike_km" || tx.type === "household_maintenance")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const protectedMoves = filtered.filter((tx) => tx.type.startsWith("fund")).reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={`${filtered.length} records · every taka has a trail`}
        action={<Link href="/add" className="notion-primary-button"><PlusCircle size={19} /> Add entry</Link>}
      />

      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Filtered Total" value={<BDTAmount amount={total} />} icon={Wallet} tone="dark" />
        <MetricCard label="Expenses" value={<BDTAmount amount={expenses} />} />
        <MetricCard label="Fund Movements" value={<BDTAmount amount={protectedMoves} />} />
      </section>

      <section className="notion-card mb-4 p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-3.5 text-[var(--notion-slate)]" size={18} />
            <input className="input pl-10" placeholder="Search description, category, fund" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <button type="button" className="button-secondary" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
        <div className="mt-3 hidden sm:block">
          <div className="grid gap-3 md:grid-cols-3">
            <select className="input" value={type} onChange={(event) => setType(event.target.value as TransactionType | "all")}>
              <option value="all">All entry types</option>
              {transactionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {filtersOpen ? (
        <div className="fixed inset-0 z-40 bg-[rgba(16,24,40,0.28)] sm:hidden" onClick={() => setFiltersOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border border-[var(--notion-hairline)] bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[var(--notion-shadow-medium)]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--notion-primary-deep)]">Filters</p>
                <h2 className="text-lg font-semibold">Transaction list</h2>
              </div>
              <button type="button" className="button-secondary size-10 p-0" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
            <label className="space-y-2 text-sm font-semibold text-[var(--notion-slate)]">
              <span>Entry type</span>
              <select className="input" value={type} onChange={(event) => setType(event.target.value as TransactionType | "all")}>
                <option value="all">All entry types</option>
                {transactionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <button type="button" className="notion-primary-button mt-4 w-full" onClick={() => setFiltersOpen(false)}>Apply filters</button>
          </div>
        </div>
      ) : null}

      <section className="space-y-2">
        {filtered.length ? filtered.map((tx) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            onDelete={() => window.confirm("Delete this transaction?") && dispatch({ type: "DELETE_TRANSACTION", payload: { id: tx.id } })}
          />
        )) : (
          <EmptyState
            title="No records found"
            description="Add an opening balance or today's first expense to start the trail."
            action={<Link href="/add" className="notion-primary-button"><PlusCircle size={18} /> Add entry</Link>}
          />
        )}
      </section>
    </>
  );
}

function TransactionRow({ tx, onDelete }: { tx: Transaction; onDelete: () => void }) {
  const title = tx.description || tx.category || tx.incomeSource || tx.fundKey || tx.type;
  const locationText = [
    tx.fromLocation ? `From ${tx.fromLocation.replace("_", " ")}` : "",
    tx.toLocation ? `To ${tx.toLocation.replace("_", " ")}` : "",
    tx.fundKey ? tx.fundKey.replaceAll("_", " ") : "",
  ].filter(Boolean).join(" · ");

  return (
    <article className="notion-card p-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--notion-ink)]">{title}</p>
            <Pill tone={tx.type === "expense" ? "warning" : tx.type === "income" ? "success" : "primary"}>{tx.type.replaceAll("_", " ")}</Pill>
          </div>
          <p className="mt-1 text-sm text-[var(--notion-slate)]">{formatDate(tx.date)}</p>
          {locationText ? <p className="mt-1 text-xs text-[var(--notion-steel)]">{locationText}</p> : null}
        </div>
        <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
          <BDTAmount amount={tx.amount} size="lg" />
          <button
            className="mt-0 inline-flex min-h-11 items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 sm:mt-3"
            onClick={onDelete}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}
