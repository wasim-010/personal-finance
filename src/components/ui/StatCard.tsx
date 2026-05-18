import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  note,
  icon: Icon,
  tone = "light",
}: {
  title: string;
  value: React.ReactNode;
  note?: string;
  icon?: LucideIcon;
  tone?: "light" | "green" | "dark" | "warn";
}) {
  const classes = {
    light: "border-[var(--notion-hairline)] bg-white text-[var(--notion-ink)]",
    green: "border-transparent bg-[var(--notion-primary)] text-white",
    dark: "border-transparent bg-[var(--notion-brand-navy)] text-white",
    warn: "border-transparent bg-[var(--notion-tint-yellow-bold)] text-[var(--notion-charcoal)]",
  };

  return (
    <div className={`rounded-[var(--notion-radius)] border p-4 shadow-[var(--notion-shadow-soft)] ${classes[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-xs font-semibold uppercase tracking-wide ${tone === "light" || tone === "warn" ? "text-[var(--notion-slate)]" : "text-white/75"}`}>
          {title}
        </p>
        {Icon ? <Icon size={20} className="shrink-0 opacity-80" /> : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-normal">{value}</p>
      {note ? <p className={`mt-1 text-xs leading-5 ${tone === "light" || tone === "warn" ? "text-[var(--notion-slate)]" : "text-white/75"}`}>{note}</p> : null}
    </div>
  );
}

export function ProgressBar({ value, tone = "emerald" }: { value: number; tone?: "emerald" | "rose" }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--notion-surface)]">
      <div
        className={`h-full rounded-full ${tone === "emerald" ? "bg-[var(--notion-primary)]" : "bg-[var(--notion-error)]"}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
