import { formatBDT } from "@/lib/format";

interface BDTAmountProps {
  amount: number;
  size?: "sm" | "md" | "lg" | "hero";
  showSign?: boolean;
  className?: string;
}

export function BDTAmount({ amount, size = "md", showSign, className }: BDTAmountProps) {
  const signAmount = showSign && amount > 0 ? `+${formatBDT(amount)}` : formatBDT(amount);
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-medium",
    hero: "text-4xl font-semibold tracking-normal",
  }[size];

  return <span className={`${sizeClass} ${className ?? ""}`}>{signAmount}</span>;
}
