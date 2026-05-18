import type { Cycle } from "@/types/finance";

export function formatBDT(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.abs(value));
  return `${value < 0 ? "-" : ""}৳${formatted}`;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

export function formatDateShort(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

export function formatCycleLabel(cycle: Cycle): string {
  return cycle.label;
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetween(a: Date, b: Date): number {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export const formatPercent = (value: number) => `${Math.round(value)}%`;
export const todayKey = () => toDateString(new Date());
export const currentMonthKey = () => todayKey().slice(0, 7);
export const getMonthKey = (date: string) => date.slice(0, 7);
