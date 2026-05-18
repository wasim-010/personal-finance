import type { BudgetCategory, CashFlowAllocation, FundKey } from "@/types/finance";

export type CashFlowPhase = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  items: {
    label: string;
    amount: number;
    category?: BudgetCategory;
    fundKey?: FundKey;
    note?: string;
  }[];
};

export const CASH_FLOW_PHASES: CashFlowPhase[] = [
  {
    id: "salary-7-10",
    title: "Salary 44,000",
    subtitle: "Comes 7-10",
    amount: 44000,
    items: [
      { label: "Rent + water", amount: 16000, category: "House Rent + Water" },
      { label: "Gas", amount: 1100, category: "Gas" },
      { label: "Electricity", amount: 2000, category: "Electricity" },
      { label: "Internet", amount: 750, category: "Internet" },
      { label: "Maid", amount: 2200, category: "Maid" },
      { label: "Charity", amount: 500, category: "Charity" },
      { label: "Baby Delivery Fund first transfer", amount: 7000, category: "Baby Delivery Fund", fundKey: "baby_delivery" },
      { label: "Credit Card first payment", amount: 2000, category: "Credit Card Payment", fundKey: "credit_card_payment" },
      { label: "Food first half", amount: 6000, category: "Regular Groceries" },
      { label: "Bike fuel + parking", amount: 1400, category: "Fuel Fund", fundKey: "fuel" },
      { label: "Personal/eating out", amount: 1000, category: "Personal Expense" },
      { label: "Buffer until 20th", amount: 4050, note: "Do not spend early unless needed." },
    ],
  },
  {
    id: "mother-in-law-20-25",
    title: "Mother-in-law support 10,000",
    subtitle: "Comes 20-25",
    amount: 10000,
    items: [
      { label: "Baby Delivery Fund remaining", amount: 3000, category: "Baby Delivery Fund", fundKey: "baby_delivery" },
      { label: "Wife Medical", amount: 2500, category: "Wife Medical" },
      { label: "Emergency Fund", amount: 1500, category: "Emergency Fund", fundKey: "emergency" },
      { label: "Food second half", amount: 3000, category: "Regular Groceries" },
    ],
  },
  {
    id: "rental-25-27",
    title: "Rental income 5,000",
    subtitle: "Comes 25-27",
    amount: 5000,
    items: [
      { label: "Credit Card extra payment", amount: 1000, category: "Credit Card Payment", fundKey: "credit_card_payment" },
      { label: "Engine Oil Fund", amount: 400, category: "Engine Oil Fund", fundKey: "engine_oil" },
      { label: "Bike Maintenance Fund", amount: 500, category: "Bike Maintenance Fund", fundKey: "bike_maintenance" },
      { label: "Baby Starter Fund", amount: 1000, category: "Baby Starter Fund", fundKey: "baby_starter" },
      { label: "Month-end cushion", amount: 2100, note: "Keep this for month-end food/household pressure." },
    ],
  },
];

export const DEFAULT_CASH_FLOW_ALLOCATIONS: CashFlowAllocation[] = CASH_FLOW_PHASES.flatMap((phase) =>
  phase.items.map((item, index) => ({
    id: `${phase.id}-${index + 1}`,
    label: item.label,
    amount: item.amount,
    fundKey: item.fundKey,
    category: item.category,
    priority: index + 1,
  })),
);
