"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Baby,
  Bike,
  CreditCard,
  CalendarDays,
  Home,
  LayoutDashboard,
  List,
  MoreHorizontal,
  PieChart,
  PlusCircle,
  Settings,
  WalletCards,
} from "lucide-react";
import { FinanceProvider } from "@/components/FinanceProvider";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add", label: "Add Entry", icon: PlusCircle },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/funds", label: "Money Buckets", icon: WalletCards },
  { href: "/bike", label: "Bike Tracker", icon: Bike },
  { href: "/cash-flow", label: "Cash Flow", icon: CalendarDays },
  { href: "/baby-fund", label: "Baby Fund", icon: Baby },
  { href: "/debt", label: "Debt", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

const mobileNav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/add", label: "Add", icon: PlusCircle },
  { href: "/transactions", label: "Entries", icon: List },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/settings", label: "More", icon: MoreHorizontal },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-[var(--notion-surface-soft)] text-[var(--notion-ink)]">
        <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-[var(--notion-hairline)] bg-white/95 px-5 py-6 backdrop-blur lg:block">
          <Link href="/dashboard" className="mb-8 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-[var(--notion-brand-navy)] text-white shadow-[var(--notion-shadow-soft)]">
              <Bike size={22} />
            </div>
            <div>
              <p className="text-sm text-[var(--notion-slate)]">Bangladesh Family</p>
              <p className="text-lg font-semibold tracking-normal">Budget Control</p>
            </div>
          </Link>
          <nav className="space-y-1.5">
            {primaryNav.map((item) => {
              const active = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-[var(--notion-tint-lavender)] text-[var(--notion-primary-deep)] shadow-[inset_0_0_0_1px_rgba(109,74,255,0.08)]" : "text-[var(--notion-slate)] hover:bg-[var(--notion-surface-soft)] hover:text-[var(--notion-ink)]"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-6 left-5 right-5 rounded-[var(--notion-radius)] bg-[var(--notion-tint-yellow-bold)] p-4 text-[var(--notion-charcoal)] shadow-[var(--notion-shadow-soft)]">
            <p className="text-sm font-semibold">Baby fund touch করবেন না</p>
            <p className="mt-1 text-xs text-[var(--notion-slate)]">Save first, then spend.</p>
          </div>
        </aside>

        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-[var(--notion-hairline)] bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(16,19,35,0.08)] backdrop-blur lg:hidden">
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
        </nav>
      </div>
    </FinanceProvider>
  );
}
