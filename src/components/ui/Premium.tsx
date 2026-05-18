import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { ProgressBar } from "@/components/ui/StatCard";
import { formatPercent } from "@/lib/format";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase text-[var(--notion-primary-deep)]">{eyebrow}</p> : null}
        <h2 className="text-xl font-semibold text-[var(--notion-ink)]">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--notion-slate)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "light",
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  icon?: LucideIcon;
  tone?: "light" | "primary" | "dark" | "warning" | "success";
}) {
  const toneClass = {
    light: "border-[var(--notion-hairline)] bg-white text-[var(--notion-ink)]",
    primary: "border-transparent bg-[var(--notion-primary)] text-white",
    dark: "border-transparent bg-[var(--notion-brand-navy)] text-white",
    warning: "border-transparent bg-[var(--notion-tint-yellow-bold)] text-[var(--notion-charcoal)]",
    success: "border-transparent bg-[var(--notion-tint-mint)] text-[var(--notion-ink)]",
  }[tone];
  const muted = tone === "primary" || tone === "dark" ? "text-white/72" : "text-[var(--notion-slate)]";

  return (
    <article className={`rounded-[var(--notion-radius)] border p-4 shadow-[var(--notion-shadow-soft)] ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-sm font-medium ${muted}`}>{label}</p>
        {Icon ? <Icon size={18} className="shrink-0 opacity-80" /> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {note ? <p className={`mt-1 text-xs leading-5 ${muted}`}>{note}</p> : null}
    </article>
  );
}

export function CompactStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--notion-surface-soft)] px-3 py-2">
      <p className="text-xs text-[var(--notion-slate)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--notion-ink)]">{value}</p>
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "dark";
}) {
  const classes = {
    neutral: "bg-[var(--notion-surface)] text-[var(--notion-slate)]",
    primary: "bg-[var(--notion-tint-lavender)] text-[var(--notion-primary-deep)]",
    success: "bg-[var(--notion-tint-mint)] text-[var(--notion-success)]",
    warning: "bg-[var(--notion-tint-yellow)] text-[#6f4e00]",
    danger: "bg-[var(--notion-tint-rose)] text-[var(--notion-error)]",
    dark: "bg-[var(--notion-brand-navy)] text-white",
  }[tone];

  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>{children}</span>;
}

export function MoneyRow({
  label,
  amount,
  note,
  strong,
}: {
  label: string;
  amount: number;
  note?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--notion-surface-soft)] px-3 py-2.5">
      <div>
        <p className={`text-sm ${strong ? "font-semibold text-[var(--notion-ink)]" : "text-[var(--notion-slate)]"}`}>{label}</p>
        {note ? <p className="mt-0.5 text-xs text-[var(--notion-steel)]">{note}</p> : null}
      </div>
      <BDTAmount amount={amount} className={strong ? "font-semibold" : ""} />
    </div>
  );
}

export function ProgressRow({
  label,
  current,
  target,
  helper,
  tone = "emerald",
}: {
  label: string;
  current: number;
  target: number;
  helper?: string;
  tone?: "emerald" | "rose";
}) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 100;
  const remaining = Math.max(target - current, 0);

  return (
    <div className="rounded-xl border border-[var(--notion-hairline)] bg-white p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--notion-ink)]">{label}</p>
          {helper ? <p className="mt-0.5 text-xs text-[var(--notion-slate)]">{helper}</p> : null}
        </div>
        <Pill tone={percentage >= 100 ? "success" : percentage >= 50 ? "primary" : "warning"}>{formatPercent(percentage)}</Pill>
      </div>
      <ProgressBar value={percentage} tone={tone} />
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--notion-slate)]">
        <span>
          <BDTAmount amount={current} /> saved
        </span>
        <span>
          <BDTAmount amount={remaining} /> left of <BDTAmount amount={target} />
        </span>
      </div>
    </div>
  );
}

export function AlertCard({
  title,
  message,
  severity = "info",
}: {
  title?: string;
  message: string;
  severity?: "critical" | "warning" | "info";
}) {
  const classes = {
    critical: "border-[var(--notion-error)]/25 bg-[var(--notion-tint-rose)] text-[var(--notion-error)]",
    warning: "border-[#e6c65a] bg-[var(--notion-tint-yellow)] text-[#6f4e00]",
    info: "border-[var(--notion-hairline)] bg-white text-[var(--notion-charcoal)]",
  }[severity];

  return (
    <div className={`rounded-xl border px-3 py-2.5 text-sm ${classes}`}>
      {title ? <p className="mb-0.5 font-semibold">{title}</p> : null}
      <p className="leading-5">{message}</p>
    </div>
  );
}

export function GroupPanel({
  title,
  subtitle,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group notion-card overflow-hidden" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
        <div>
          <h3 className="font-semibold text-[var(--notion-ink)]">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-[var(--notion-slate)]">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {summary}
          <ChevronDown size={18} className="text-[var(--notion-slate)] transition group-open:rotate-180" />
        </div>
      </summary>
      <div className="border-t border-[var(--notion-hairline)] p-3 sm:p-4">{children}</div>
    </details>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--notion-radius)] border border-dashed border-[var(--notion-hairline-strong)] bg-white p-6 text-center">
      <h3 className="font-semibold text-[var(--notion-ink)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--notion-slate)]">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
