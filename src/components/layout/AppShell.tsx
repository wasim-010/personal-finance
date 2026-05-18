"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Baby,
  Bike,
  CreditCard,
  CalendarDays,
  LayoutDashboard,
  List,
  MoreHorizontal,
  PieChart,
  PlusCircle,
  Settings,
  WalletCards,
} from "lucide-react";
import { FinanceProvider } from "@/components/FinanceProvider";

const navGroups = [
  {
    label: "Daily control",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/add", label: "Add Entry", icon: PlusCircle },
      { href: "/transactions", label: "Transactions", icon: List },
    ],
  },
  {
    label: "Planning",
    items: [
      { href: "/budget", label: "Budget", icon: PieChart },
      { href: "/funds", label: "Money Buckets", icon: WalletCards },
      { href: "/cash-flow", label: "Cash Flow", icon: CalendarDays },
    ],
  },
  {
    label: "Focus areas",
    items: [
      { href: "/bike", label: "Bike Tracker", icon: Bike },
      { href: "/baby-fund", label: "Baby Fund", icon: Baby },
      { href: "/debt", label: "Debt", icon: CreditCard },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const mobileNav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/funds", label: "Buckets", icon: WalletCards },
];

const moreNav = [
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/cash-flow", label: "Cash Flow", icon: CalendarDays },
  { href: "/bike", label: "Bike Tracker", icon: Bike },
  { href: "/baby-fund", label: "Baby Fund", icon: Baby },
  { href: "/debt", label: "Debt", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreNav.some((item) => pathname === item.href);

  return (
    <FinanceProvider>
      <div className="min-h-screen text-[var(--notion-ink)]">
        <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-[var(--notion-hairline)] bg-white/90 px-5 py-6 shadow-[8px_0_30px_rgba(16,24,40,0.04)] backdrop-blur-xl lg:block">
          <Link href="/dashboard" className="mb-7 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-[var(--notion-brand-navy)] text-white shadow-[var(--notion-shadow-soft)]">
              <Bike size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--notion-slate)]">Bangladesh Family</p>
              <p className="text-lg font-semibold tracking-normal">Budget Control</p>
            </div>
          </Link>

          <nav className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--notion-steel)]">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          active
                            ? "bg-[var(--notion-tint-lavender)] text-[var(--notion-primary-deep)] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.1)]"
                            : "text-[var(--notion-slate)] hover:bg-[var(--notion-surface-soft)] hover:text-[var(--notion-ink)]"
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="absolute bottom-6 left-5 right-5 rounded-[var(--notion-radius)] border border-[#fedf89] bg-[var(--notion-tint-yellow)] p-4 text-[var(--notion-charcoal)] shadow-[var(--notion-shadow-soft)]">
            <p className="text-sm font-semibold">Baby fund touch করবেন না</p>
            <p className="mt-1 text-xs text-[var(--notion-slate)]">Save first. Spend after protection.</p>
          </div>
        </aside>

        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-5 lg:ml-72 lg:px-8 lg:pb-10">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-[var(--notion-hairline)] bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(16,24,40,0.08)] backdrop-blur lg:hidden">
          {mobileNav.map((item) => {
            const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
            const Icon = item.icon;
            const isAdd = item.href === "/add";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium ${
                  isAdd
                    ? "bg-[var(--notion-primary)] text-white shadow-[var(--notion-shadow-soft)]"
                    : active
                      ? "bg-[var(--notion-tint-lavender)] text-[var(--notion-primary-deep)]"
                      : "text-[var(--notion-slate)]"
                }`}
              >
                <Icon size={isAdd ? 24 : 20} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium ${moreActive ? "bg-[var(--notion-tint-lavender)] text-[var(--notion-primary-deep)]" : "text-[var(--notion-slate)]"}`}
          >
            <MoreHorizontal size={20} />
            More
          </button>
        </nav>

        {moreOpen ? (
          <div className="fixed inset-0 z-40 bg-[rgba(16,24,40,0.28)] lg:hidden" onClick={() => setMoreOpen(false)}>
            <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border border-[var(--notion-hairline)] bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[var(--notion-shadow-medium)]" onClick={(event) => event.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--notion-primary-deep)]">More</p>
                  <h2 className="text-lg font-semibold">Family budget tools</h2>
                </div>
                <button type="button" className="button-secondary min-h-11 px-3" onClick={() => setMoreOpen(false)}>Close</button>
              </div>
              <div className="grid gap-2">
                {moreNav.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${active ? "bg-[var(--notion-tint-lavender)] text-[var(--notion-primary-deep)]" : "bg-[var(--notion-surface-soft)] text-[var(--notion-ink)]"}`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </FinanceProvider>
  );
}
