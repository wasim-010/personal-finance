export type TransactionType =
  | "opening_balance"
  | "income"
  | "expense"
  | "fund_deposit"
  | "fund_transfer"
  | "fund_withdrawal"
  | "debt_payment"
  | "bike_km"
  | "bike_entry"
  | "household_maintenance"
  | "transfer";

export type Location = "bank" | "wallet" | "cash_envelope" | "bkash" | "nagad";

export type NeedWantWaste = "need" | "want" | "waste";

export type IncomeSource = "salary" | "rental_income" | "mother_in_law_support" | "other";

export type FundKey =
  | "baby_delivery"
  | "baby_starter"
  | "emergency"
  | "fuel"
  | "engine_oil"
  | "parking"
  | "bike_maintenance"
  | "household_maintenance"
  | "credit_card_payment";

export type BudgetMode = "normal" | "qurbani" | "saidpur" | "after_baby";

export type BikeMode = "true_cost" | "cash_running";

export type BikeEntrySubtype =
  | "ODO Update"
  | "Fuel Fill-Up"
  | "Engine Oil Change"
  | "Parking"
  | "Maintenance / Parts"
  | "Bike KM Cost";

export type HouseholdMaintenanceSubtype =
  | "Water Filter Replacement"
  | "Home Repair"
  | "Other Household Maintenance";

export interface Transaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  date: string;
  type: TransactionType;
  amount: number;
  description?: string;
  fromLocation?: Location;
  toLocation?: Location;
  category?: string;
  incomeSource?: IncomeSource;
  classification?: NeedWantWaste;
  fundKey?: FundKey;
  toFundKey?: FundKey;
  km?: number;
  costPerKm?: number;
  bikeSubtype?: BikeEntrySubtype;
  householdSubtype?: HouseholdMaintenanceSubtype;
  currentOdo?: number;
  previousOdo?: number;
  kmRun?: number;
  fuelLiters?: number;
  fuelPricePerLiter?: number;
  fullTank?: boolean;
  engineOilPrice?: number;
  oilFilterPrice?: number;
  serviceCharge?: number;
  nextOilChangeAfterKm?: number;
  nextOilChangeOdo?: number;
  partName?: string;
  planned?: boolean;
  notes?: string;
}

export interface DebtState {
  outstanding: number;
  originalAmount: number;
  minimumPayment: number;
  interestRate: number;
}

export type BudgetCategory =
  | "House Rent + Water"
  | "Gas"
  | "Electricity"
  | "Internet"
  | "Mobile Recharge"
  | "Regular Groceries"
  | "Beef"
  | "Chicken"
  | "Fish"
  | "Milk"
  | "Wife Medical"
  | "Maid"
  | "Charity"
  | "Personal Expense"
  | "Eating Out"
  | "Fuel Fund"
  | "Parking"
  | "Engine Oil Fund"
  | "Bike Maintenance Fund"
  | "Baby Delivery Fund"
  | "Baby Starter Fund"
  | "Emergency Fund"
  | "Credit Card Payment"
  | "Saidpur Support"
  | "Unknown Adjustment"
  | "Diaper"
  | "Baby Medicine"
  | "Baby Doctor"
  | "Baby Milk"
  | "Baby Clothes"
  | "Mother Nutrition"
  | "Baby Monthly Care Fund"
  | "Water Filter"
  | "Water Filter Replacement"
  | "Household Maintenance Fund"
  | "Home Repair"
  | "Other Household Maintenance";

export type BudgetTargets = Record<BudgetCategory, number>;

export interface CashFlowAllocation {
  id: string;
  label: string;
  amount: number;
  toLocation?: Location;
  fundKey?: FundKey;
  category?: string;
  priority: number;
}

export interface BikeSettings {
  fuelPricePerLiter: number;
  lastFuelLiters?: number;
  lastFuelAmount?: number;
  expectedMileageKmPerLiter: number;
  fullTankLiters: number;
  bikeTrueCostPerKm: number;
  bikeCashCostPerKm: number;
  engineOilPrice: number;
  oilFilterPrice?: number;
  oilChangeIntervalKm: number;
  lastOilChangeOdo?: number;
  nextOilChangeOdo?: number;
  monthlyParkingCost: number;
  expectedMonthlyKm: number;
  monthlyFuelFundTarget: number;
  monthlyEngineOilFundTarget: number;
  monthlyBikeMaintenanceMinimum: number;
  monthlyBikeMaintenanceIdeal: number;
}

export interface BikePart {
  id: string;
  name: string;
  estimatedPrice: number;
  replacementIntervalKm?: number;
  replacementIntervalMonths?: number;
  lastReplacedOdo?: number;
  lastReplacedDate?: string;
  reminderEnabled: boolean;
}

export interface WaterFilterSettings {
  price: number;
  replacementIntervalMonths: number;
  lastChangedDate?: string;
  nextChangeDate?: string;
  monthlyReserveTarget: number;
  reminderEnabled: boolean;
}

export interface BikeEntry {
  id: string;
  date: string;
  subtype: BikeEntrySubtype;
  currentOdo?: number;
  previousOdo?: number;
  kmRun?: number;
  amount?: number;
  fuelLiters?: number;
  fuelPricePerLiter?: number;
  engineOilPrice?: number;
  oilFilterPrice?: number;
  partName?: string;
  planned?: boolean;
  notes?: string;
}

export interface Settings {
  salaryDate: number;
  budgetMode: BudgetMode;
  bikeMode: BikeMode;
  bikeTotalMonthlyCost: number;
  bikeAvgMonthlyKm: number;
  bikeCashCostPerKm: number;
  expectedIncome: Record<IncomeSource, number>;
  budgets: Record<BudgetMode, BudgetTargets>;
  fundTargets: Record<FundKey, number>;
  cashFlowAllocations: CashFlowAllocation[];
  bikeSettings: BikeSettings;
  bikeParts: BikePart[];
  waterFilter: WaterFilterSettings;
}

export const FUND_LABELS: Record<FundKey, string> = {
  baby_delivery: "Baby Delivery",
  baby_starter: "Baby Starter",
  emergency: "Emergency",
  fuel: "Fuel Fund",
  engine_oil: "Engine Oil Fund",
  parking: "Parking Fund",
  bike_maintenance: "Bike Maintenance",
  household_maintenance: "Household Maintenance",
  credit_card_payment: "Credit Card Payment",
};

export interface AppState {
  schemaVersion: number;
  transactions: Transaction[];
  locationBalances: Record<Location, number>;
  fundBalances: Record<FundKey, number>;
  debt: DebtState;
  settings: Settings;
  lastUpdated: string;
  migrationNotice?: string;
}

export type Cycle = {
  start: string;
  end: string;
  daysTotal: number;
  daysElapsed: number;
  label: string;
};
