import type {
  AppState,
  BudgetTargets,
  DebtState,
  FundKey,
  IncomeSource,
  Settings,
} from "@/types/finance";

const normalBudget: BudgetTargets = {
  "House Rent + Water": 16000,
  Gas: 1100,
  Electricity: 2000,
  Internet: 750,
  "Mobile Recharge": 100,
  "Regular Groceries": 7000,
  Beef: 3400,
  Chicken: 1600,
  Fish: 1000,
  Milk: 825,
  "Wife Medical": 2500,
  Maid: 2200,
  Charity: 500,
  "Personal Expense": 2500,
  "Eating Out": 500,
  "Fuel Fund": 900,
  Parking: 500,
  "Engine Oil Fund": 400,
  "Bike Maintenance Fund": 500,
  "Baby Delivery Fund": 10000,
  "Baby Starter Fund": 1000,
  "Emergency Fund": 1500,
  "Credit Card Payment": 3000,
  "Saidpur Support": 0,
  "Unknown Adjustment": 0,
  Diaper: 0,
  "Baby Medicine": 0,
  "Baby Doctor": 0,
  "Baby Milk": 0,
  "Baby Clothes": 0,
  "Mother Nutrition": 0,
  "Baby Monthly Care Fund": 0,
  "Water Filter": 200,
  "Water Filter Replacement": 0,
  "Household Maintenance Fund": 500,
  "Home Repair": 0,
  "Other Household Maintenance": 0,
};

const qurbaniBudget: BudgetTargets = {
  ...normalBudget,
  Beef: 0,
  "Credit Card Payment": 5000,
  "Emergency Fund": 2000,
  "Baby Starter Fund": 1000,
};

const saidpurBudget: BudgetTargets = {
  ...normalBudget,
  Electricity: 1700,
  "Regular Groceries": 5500,
  Beef: 0,
  Chicken: 0,
  Fish: 0,
  Milk: 0,
  "Personal Expense": 2000,
  "Baby Delivery Fund": 9000,
  "Emergency Fund": 1000,
  "Credit Card Payment": 2000,
  "Saidpur Support": 3000,
};

const afterBabyBudget: BudgetTargets = {
  ...normalBudget,
  "Baby Delivery Fund": 0,
  "Baby Starter Fund": 0,
  Diaper: 3000,
  "Baby Medicine": 1000,
  "Baby Doctor": 1500,
  "Baby Milk": 0,
  "Baby Clothes": 750,
  "Mother Nutrition": 2500,
  "Baby Monthly Care Fund": 10000,
};

export function getDefaultSettings(): Settings {
  return {
    salaryDate: 7,
    budgetMode: "normal",
    bikeMode: "true_cost",
    bikeTotalMonthlyCost: 8000,
    bikeAvgMonthlyKm: 400,
    bikeCashCostPerKm: 4,
    expectedIncome: {
      salary: 44000,
      rental_income: 5000,
      mother_in_law_support: 10000,
      other: 0,
    },
    fundTargets: {
      baby_delivery: 30000,
      baby_starter: 5000,
      emergency: 50000,
      fuel: 900,
      engine_oil: 400,
      parking: 500,
      bike_maintenance: 500,
      household_maintenance: 500,
      credit_card_payment: 19000,
    },
    budgets: {
      normal: normalBudget,
      qurbani: qurbaniBudget,
      saidpur: saidpurBudget,
      after_baby: afterBabyBudget,
    },
    cashFlowAllocations: [],
    bikeSettings: {
      fuelPricePerLiter: 140,
      expectedMileageKmPerLiter: 50,
      fullTankLiters: 10,
      bikeTrueCostPerKm: 6,
      bikeCashCostPerKm: 3.5,
      engineOilPrice: 1400,
      oilFilterPrice: 0,
      oilChangeIntervalKm: 3000,
      monthlyParkingCost: 500,
      expectedMonthlyKm: 300,
      monthlyFuelFundTarget: 900,
      monthlyEngineOilFundTarget: 400,
      monthlyBikeMaintenanceMinimum: 500,
      monthlyBikeMaintenanceIdeal: 900,
    },
    bikeParts: [
      { id: "tire", name: "Tire", estimatedPrice: 4500, replacementIntervalKm: 25000, reminderEnabled: true },
      { id: "brake-pad", name: "Brake pad/shoe", estimatedPrice: 900, replacementIntervalKm: 8000, reminderEnabled: true },
      { id: "chain-set", name: "Chain set", estimatedPrice: 2500, replacementIntervalKm: 18000, reminderEnabled: true },
      { id: "suspension", name: "Suspension service", estimatedPrice: 2500, replacementIntervalKm: 20000, reminderEnabled: true },
      { id: "air-filter", name: "Air filter", estimatedPrice: 650, replacementIntervalKm: 10000, reminderEnabled: true },
      { id: "spark-plug", name: "Spark plug", estimatedPrice: 350, replacementIntervalKm: 8000, reminderEnabled: true },
      { id: "battery", name: "Battery", estimatedPrice: 2800, replacementIntervalMonths: 24, reminderEnabled: true },
      { id: "clutch-cable", name: "Clutch cable", estimatedPrice: 450, replacementIntervalKm: 12000, reminderEnabled: true },
      { id: "brake-cable", name: "Brake cable", estimatedPrice: 450, replacementIntervalKm: 12000, reminderEnabled: true },
      { id: "general-servicing", name: "General servicing", estimatedPrice: 800, replacementIntervalKm: 3000, reminderEnabled: true },
      { id: "other-parts", name: "Other parts", estimatedPrice: 1000, replacementIntervalKm: 10000, reminderEnabled: false },
    ],
    waterFilter: {
      price: 1200,
      replacementIntervalMonths: 6,
      monthlyReserveTarget: 200,
      reminderEnabled: true,
    },
  };
}

export function getDefaultDebtState(): DebtState {
  return {
    outstanding: 19000,
    originalAmount: 19000,
    minimumPayment: 3000,
    interestRate: 0,
  };
}

export function getEmptyLocationBalances() {
  return { bank: 0, wallet: 0, cash_envelope: 0, bkash: 0, nagad: 0 };
}

export function getEmptyFundBalances(): Record<FundKey, number> {
  return {
    baby_delivery: 0,
    baby_starter: 0,
    emergency: 0,
    fuel: 0,
    engine_oil: 0,
    parking: 0,
    bike_maintenance: 0,
    household_maintenance: 0,
    credit_card_payment: 0,
  };
}

export function getDefaultAppState(): AppState {
  return {
    schemaVersion: 4,
    transactions: [],
    locationBalances: getEmptyLocationBalances(),
    fundBalances: getEmptyFundBalances(),
    debt: getDefaultDebtState(),
    settings: getDefaultSettings(),
    lastUpdated: new Date().toISOString(),
  };
}

export const incomeSourceLabels: Record<IncomeSource, string> = {
  salary: "Salary",
  rental_income: "Rental Income",
  mother_in_law_support: "Mother-in-law Support",
  other: "Other Income",
};
