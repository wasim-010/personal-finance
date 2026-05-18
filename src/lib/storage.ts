"use client";

import { computeLocationBalances } from "@/lib/calculations/balance";
import { computeFundBalances } from "@/lib/calculations/funds";
import { getDefaultAppState, getDefaultDebtState, getDefaultSettings } from "@/lib/defaults/settings";
import type {
  AppState,
  BikeEntrySubtype,
  BikeMode,
  BudgetCategory,
  BudgetTargets,
  BudgetMode,
  FundKey,
  IncomeSource,
  Location,
  NeedWantWaste,
  Settings,
  Transaction,
  TransactionType,
} from "@/types/finance";

export const STORAGE_KEY = "bd-family-budget-v1";
export const CURRENT_VERSION = 4;

const TYPE_MAP: Record<string, TransactionType> = {
  Income: "income",
  Expense: "expense",
  "Opening Balance": "opening_balance",
  "Fund Deposit": "fund_deposit",
  "Fund Transfer": "fund_transfer",
  "Fund Withdrawal": "fund_withdrawal",
  "Debt Payment": "debt_payment",
  "Baby Fund Saving": "fund_deposit",
  "Bike KM Cost": "bike_km",
  "Bike Entry": "bike_entry",
  "Household Maintenance Entry": "household_maintenance",
  Transfer: "transfer",
  income: "income",
  expense: "expense",
  opening_balance: "opening_balance",
  fund_deposit: "fund_deposit",
  fund_transfer: "fund_transfer",
  fund_withdrawal: "fund_withdrawal",
  debt_payment: "debt_payment",
  bike_km: "bike_km",
  bike_entry: "bike_entry",
  household_maintenance: "household_maintenance",
  transfer: "transfer",
};

const locationMap: Record<string, Location> = {
  Bank: "bank",
  bank: "bank",
  Wallet: "wallet",
  "Wallet / Cash in Hand": "wallet",
  "Cash in Hand": "wallet",
  wallet: "wallet",
  "Cash Envelope": "cash_envelope",
  Cash: "wallet",
  cash_envelope: "cash_envelope",
  bKash: "bkash",
  bkash: "bkash",
  Nagad: "nagad",
  nagad: "nagad",
};

const fundMap: Record<string, FundKey> = {
  "Baby Delivery Fund": "baby_delivery",
  "Baby Starter Fund": "baby_starter",
  "Emergency Fund": "emergency",
  "Fuel Fund": "fuel",
  "Engine Oil Fund": "engine_oil",
  "Parking Fund": "parking",
  "Bike Maintenance Fund": "bike_maintenance",
  "Household Maintenance Fund": "household_maintenance",
  "Credit Card Payment Fund": "credit_card_payment",
  baby_delivery: "baby_delivery",
  baby_starter: "baby_starter",
  emergency: "emergency",
  fuel: "fuel",
  engine_oil: "engine_oil",
  parking: "parking",
  bike_maintenance: "bike_maintenance",
  household_maintenance: "household_maintenance",
  credit_card_payment: "credit_card_payment",
};

const incomeSourceMap: Record<string, IncomeSource> = {
  Salary: "salary",
  salary: "salary",
  "Rental Income": "rental_income",
  rental_income: "rental_income",
  "Mother-in-law Support": "mother_in_law_support",
  "Family Support": "mother_in_law_support",
  mother_in_law_support: "mother_in_law_support",
  "Other Income": "other",
  other: "other",
};

const classificationMap: Record<string, NeedWantWaste | undefined> = {
  Need: "need",
  need: "need",
  Want: "want",
  want: "want",
  Waste: "waste",
  waste: "waste",
  "Not Applicable": undefined,
};

const bikeSubtypeMap: Record<string, BikeEntrySubtype> = {
  "ODO Update": "ODO Update",
  "Fuel Fill-Up": "Fuel Fill-Up",
  "Fuel Fill Up": "Fuel Fill-Up",
  "Engine Oil Change": "Engine Oil Change",
  Parking: "Parking",
  "Maintenance / Parts": "Maintenance / Parts",
  "Maintenance/Parts": "Maintenance / Parts",
  "Bike KM Cost": "Bike KM Cost",
};

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function normalizeLocation(value: unknown): Location | undefined {
  if (!value || typeof value !== "string") return undefined;
  return locationMap[value] ?? undefined;
}

function normalizeFund(value: unknown): FundKey | undefined {
  if (!value || typeof value !== "string") return undefined;
  return fundMap[value] ?? undefined;
}

function inferLocation(record: Record<string, unknown>): Location | undefined {
  return (
    normalizeLocation(record.storageLocation) ??
    normalizeLocation(record.paymentMethod) ??
    normalizeLocation(record.fromLocation) ??
    normalizeLocation(record.toLocation)
  );
}

function migrateTransactionTypes(records: Record<string, unknown>[]): Transaction[] {
  return records.map((record) => {
    const rawType = String(record.type ?? record.entryType ?? "expense");
    const type = TYPE_MAP[rawType];
    if (!type) console.warn(`Unknown transaction type "${rawType}" - keeping as expense`);
    const safeType = type ?? "expense";
    const amount = Math.abs(Number(record.amount ?? 0));
    const date = String(record.date ?? new Date().toISOString().slice(0, 10));
    const createdAt = String(record.createdAt ?? `${date}T00:00:00.000Z`);
    const updatedAt = String(record.updatedAt ?? createdAt);
    const category = typeof record.category === "string" ? record.category : undefined;
    const location = inferLocation(record) ?? "bank";
    const fundKey = normalizeFund(record.fundKey) ?? normalizeFund(record.fundName) ?? normalizeFund(category);

    const transaction: Transaction = {
      id: typeof record.id === "string" ? record.id : generateId(),
      createdAt,
      updatedAt,
      date,
      type: safeType,
      amount,
      description: typeof record.description === "string" ? record.description : undefined,
      category: safeType === "expense" ? category : undefined,
      incomeSource: safeType === "income" ? incomeSourceMap[String(category ?? record.incomeSource ?? "other")] ?? "other" : undefined,
      classification:
        safeType === "expense" || safeType === "bike_km"
          ? classificationMap[String(record.classification ?? record.needWantWaste ?? "need")] ?? "need"
          : undefined,
      fundKey:
        safeType === "fund_deposit" || safeType === "fund_withdrawal" || safeType === "fund_transfer"
          ? fundKey ?? "baby_delivery"
          : safeType === "debt_payment"
            ? "credit_card_payment"
            : undefined,
      toFundKey: normalizeFund(record.toFundKey),
      km: record.km ? Number(record.km) : undefined,
      costPerKm: record.costPerKm ? Number(record.costPerKm) : record.bikeCostMode === "Cash Running" ? 3.5 : record.km ? amount / Number(record.km) : undefined,
      bikeSubtype: typeof record.bikeSubtype === "string" ? bikeSubtypeMap[record.bikeSubtype] ?? "ODO Update" : undefined,
      householdSubtype:
        record.householdSubtype === "Water Filter Replacement" ||
        record.householdSubtype === "Home Repair" ||
        record.householdSubtype === "Other Household Maintenance"
          ? record.householdSubtype
          : undefined,
      currentOdo: record.currentOdo ? Number(record.currentOdo) : undefined,
      previousOdo: record.previousOdo ? Number(record.previousOdo) : undefined,
      kmRun: record.kmRun ? Number(record.kmRun) : undefined,
      fuelLiters: record.fuelLiters ? Number(record.fuelLiters) : undefined,
      fuelPricePerLiter: record.fuelPricePerLiter ? Number(record.fuelPricePerLiter) : undefined,
      fullTank: typeof record.fullTank === "boolean" ? record.fullTank : undefined,
      engineOilPrice: record.engineOilPrice ? Number(record.engineOilPrice) : undefined,
      oilFilterPrice: record.oilFilterPrice ? Number(record.oilFilterPrice) : undefined,
      serviceCharge: record.serviceCharge ? Number(record.serviceCharge) : undefined,
      nextOilChangeAfterKm: record.nextOilChangeAfterKm ? Number(record.nextOilChangeAfterKm) : undefined,
      nextOilChangeOdo: record.nextOilChangeOdo ? Number(record.nextOilChangeOdo) : undefined,
      partName: typeof record.partName === "string" ? record.partName : undefined,
      planned: typeof record.planned === "boolean" ? record.planned : undefined,
      notes: typeof record.notes === "string" ? record.notes : undefined,
    };

    if (safeType === "income" || safeType === "opening_balance") transaction.toLocation = normalizeLocation(record.toLocation) ?? location;
    if (safeType === "expense" || safeType === "bike_km" || safeType === "bike_entry" || safeType === "household_maintenance" || safeType === "debt_payment") {
      transaction.fromLocation = normalizeLocation(record.fromLocation) ?? location;
    }
    if (safeType === "transfer") {
      transaction.fromLocation = normalizeLocation(record.fromLocation) ?? "bank";
      transaction.toLocation = normalizeLocation(record.toLocation) ?? "cash_envelope";
    }

    return transaction;
  });
}

function migrateSettings(existing: Record<string, unknown> = {}): Settings {
  const defaults = getDefaultSettings();
  const oldMode = existing.activeBudgetMode;
  const budgetMode: BudgetMode =
    existing.budgetMode === "qurbani" || oldMode === "Qurbani Beef Period"
      ? "qurbani"
      : existing.budgetMode === "saidpur" || oldMode === "Saidpur Separation"
        ? "saidpur"
        : existing.budgetMode === "after_baby" || oldMode === "After Baby Birth"
          ? "after_baby"
          : "normal";
  const bikeMode: BikeMode = existing.bikeMode === "cash_running" || existing.bikeCostMode === "Cash Running" ? "cash_running" : "true_cost";
  const existingFundTargets = typeof existing.fundTargets === "object" && existing.fundTargets ? existing.fundTargets as Partial<Record<FundKey, number>> : undefined;
  const existingBudgets = typeof existing.budgets === "object" && existing.budgets ? existing.budgets as Partial<Record<BudgetMode, Partial<Record<BudgetCategory, number>>>> : undefined;
  const existingBikeSettings = typeof existing.bikeSettings === "object" && existing.bikeSettings ? existing.bikeSettings as Partial<Settings["bikeSettings"]> : undefined;
  const oldTrueCost =
    existing.bikeTotalMonthlyCost && existing.bikeAvgMonthlyKm
      ? Number(existing.bikeTotalMonthlyCost) / Number(existing.bikeAvgMonthlyKm)
      : defaults.bikeSettings.bikeTrueCostPerKm;

  return {
    ...defaults,
    ...existing,
    salaryDate: Math.min(Math.max(Number(existing.salaryDate ?? existing.budgetCycleStartDay ?? 7), 1), 28),
    budgetMode,
    bikeMode,
    bikeTotalMonthlyCost: Number(existing.bikeTotalMonthlyCost ?? 8000),
    bikeAvgMonthlyKm: Number(existing.bikeAvgMonthlyKm ?? existing.monthlyBikeKmEstimate ?? 400),
    bikeCashCostPerKm: Number(existing.bikeCashCostPerKm ?? 4),
    expectedIncome: {
      ...defaults.expectedIncome,
      ...(typeof existing.expectedIncome === "object" && existing.expectedIncome ? existing.expectedIncome : {}),
    },
    fundTargets: {
      ...defaults.fundTargets,
      baby_delivery: Number(existingFundTargets?.baby_delivery ?? existing.babyFundTarget ?? defaults.fundTargets.baby_delivery),
      baby_starter: Number(existingFundTargets?.baby_starter ?? existing.babyStarterTarget ?? defaults.fundTargets.baby_starter),
      emergency: Number(existingFundTargets?.emergency ?? defaults.fundTargets.emergency),
      fuel: Number(existingFundTargets?.fuel ?? defaults.fundTargets.fuel),
      engine_oil: Number(existingFundTargets?.engine_oil ?? defaults.fundTargets.engine_oil),
      parking: Number(existingFundTargets?.parking ?? defaults.fundTargets.parking),
      bike_maintenance: Number(existingFundTargets?.bike_maintenance ?? defaults.fundTargets.bike_maintenance),
      household_maintenance: Number(existingFundTargets?.household_maintenance ?? defaults.fundTargets.household_maintenance),
      credit_card_payment: Number(existingFundTargets?.credit_card_payment ?? existing.creditCardDebtStartingAmount ?? defaults.fundTargets.credit_card_payment),
    },
    budgets: {
      normal: migrateBudgetTargets(existingBudgets?.normal, defaults.budgets.normal),
      qurbani: migrateBudgetTargets(existingBudgets?.qurbani, defaults.budgets.qurbani),
      saidpur: migrateBudgetTargets(existingBudgets?.saidpur, defaults.budgets.saidpur),
      after_baby: migrateBudgetTargets(existingBudgets?.after_baby, defaults.budgets.after_baby),
    },
    cashFlowAllocations: Array.isArray(existing.cashFlowAllocations) ? existing.cashFlowAllocations as Settings["cashFlowAllocations"] : defaults.cashFlowAllocations,
    bikeSettings: {
      ...defaults.bikeSettings,
      ...(existingBikeSettings ?? {}),
      fuelPricePerLiter: Number(existingBikeSettings?.fuelPricePerLiter ?? defaults.bikeSettings.fuelPricePerLiter),
      expectedMileageKmPerLiter: Number(existingBikeSettings?.expectedMileageKmPerLiter ?? defaults.bikeSettings.expectedMileageKmPerLiter),
      bikeTrueCostPerKm: Number(existingBikeSettings?.bikeTrueCostPerKm ?? oldTrueCost),
      bikeCashCostPerKm: Number(existingBikeSettings?.bikeCashCostPerKm ?? existing.bikeCashCostPerKm ?? defaults.bikeSettings.bikeCashCostPerKm),
      engineOilPrice: Number(existingBikeSettings?.engineOilPrice ?? defaults.bikeSettings.engineOilPrice),
      oilChangeIntervalKm: Number(existingBikeSettings?.oilChangeIntervalKm ?? defaults.bikeSettings.oilChangeIntervalKm),
      expectedMonthlyKm: Number(existingBikeSettings?.expectedMonthlyKm ?? existing.monthlyBikeKmEstimate ?? defaults.bikeSettings.expectedMonthlyKm),
    },
    bikeParts: Array.isArray(existing.bikeParts) ? existing.bikeParts as Settings["bikeParts"] : defaults.bikeParts,
    waterFilter: {
      ...defaults.waterFilter,
      ...(typeof existing.waterFilter === "object" && existing.waterFilter ? existing.waterFilter : {}),
    },
  };
}

function migrateBudgetTargets(
  existing: Partial<Record<BudgetCategory, number>> | undefined,
  defaults: BudgetTargets,
): BudgetTargets {
  const migrated = { ...defaults };
  if (!existing) return migrated;
  for (const category of Object.keys(defaults) as BudgetCategory[]) {
    const value = existing[category];
    if (typeof value === "number" && Number.isFinite(value)) migrated[category] = value;
  }
  return migrated;
}

function runMigrations(data: Record<string, unknown>, fromVersion: number): AppState {
  let transactions = migrateTransactionTypes((data.transactions as Record<string, unknown>[] | undefined) ?? []);
  let settings = migrateSettings((data.settings as Record<string, unknown> | undefined) ?? {});
  const debtPayments = transactions.filter((tx) => tx.type === "debt_payment").reduce((sum, tx) => sum + tx.amount, 0);
  const oldDebt = Number((data.settings as Record<string, unknown> | undefined)?.creditCardDebtStartingAmount ?? 0);
  const existingDebt = data.debt as Partial<AppState["debt"]> | undefined;
  const defaultDebt = getDefaultDebtState();
  const debt = {
    ...defaultDebt,
    originalAmount: Number(existingDebt?.originalAmount ?? (oldDebt || defaultDebt.originalAmount)),
    outstanding: Number(existingDebt?.outstanding ?? Math.max((oldDebt || defaultDebt.originalAmount) - debtPayments, 0)),
    minimumPayment: Number(existingDebt?.minimumPayment ?? defaultDebt.minimumPayment),
    interestRate: Number(existingDebt?.interestRate ?? defaultDebt.interestRate),
  };

  if (fromVersion >= CURRENT_VERSION && data.schemaVersion === CURRENT_VERSION) {
    transactions = (data.transactions as Transaction[] | undefined) ?? transactions;
    settings = migrateSettings(data.settings as Record<string, unknown> | undefined);
  }

  return {
    schemaVersion: CURRENT_VERSION,
    transactions,
    locationBalances: computeLocationBalances(transactions),
    fundBalances: computeFundBalances(transactions),
    debt,
    settings,
    lastUpdated: String(data.lastUpdated ?? new Date().toISOString()),
    migrationNotice:
      typeof data.migrationNotice === "string"
        ? data.migrationNotice
        : fromVersion < CURRENT_VERSION
          ? "App updated — your data is safe."
          : undefined,
  };
}

function backupBeforeMigration(raw: string, backupKey: string): void {
  if (!localStorage.getItem(backupKey)) {
    localStorage.setItem(backupKey, raw);
    window.dispatchEvent(new CustomEvent("migration-backup-ready", { detail: backupKey }));
  }
}

function recoverAccidentalEmptyState(data: Record<string, unknown>, backupKey: string): Record<string, unknown> {
  const currentCount = Array.isArray(data.transactions) ? data.transactions.length : 0;
  if (currentCount > 0) return data;

  const backupRaw = localStorage.getItem(backupKey);
  if (!backupRaw) return data;

  try {
    const backup = JSON.parse(backupRaw) as Record<string, unknown>;
    const backupCount = Array.isArray(backup.transactions) ? backup.transactions.length : 0;
    return backupCount > 0 ? { ...backup, migrationNotice: "Recovered your saved data from the migration backup." } : data;
  } catch {
    return data;
  }
}

export function loadAndMigrate(storageKey = STORAGE_KEY): AppState {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return getDefaultAppState();

  try {
    const backupKey = `${storageKey}_backup_v1`;
    const data = recoverAccidentalEmptyState(JSON.parse(raw) as Record<string, unknown>, backupKey);
    const version = Number(data.schemaVersion ?? 1);
    if (version >= CURRENT_VERSION) return runMigrations(data, version);

    backupBeforeMigration(raw, backupKey);
    const migrated = runMigrations(data, version);
    localStorage.setItem(storageKey, JSON.stringify(migrated));
    return migrated;
  } catch (error) {
    console.error("Migration failed — user data preserved", error);
    return getDefaultAppState();
  }
}

export function saveState(state: AppState, storageKey = STORAGE_KEY): void {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      ...state,
      schemaVersion: CURRENT_VERSION,
      lastUpdated: new Date().toISOString(),
    }),
  );
}

export function exportJSON(state: AppState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `finance-backup-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importAndMigrateJSON(json: string): AppState | { error: string } {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    if (!Array.isArray(data.transactions)) return { error: "File does not contain valid finance data" };
    const version = Number(data.schemaVersion ?? 1);
    return runMigrations(data, version);
  } catch (error) {
    return { error: `Migration of imported data failed: ${String(error)}` };
  }
}
