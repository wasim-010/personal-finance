"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import type {
  BikeEntrySubtype,
  FundKey,
  HouseholdMaintenanceSubtype,
  IncomeSource,
  Location,
  NeedWantWaste,
  Transaction,
  TransactionType,
} from "@/types/finance";
import { useAppState } from "@/lib/state/useAppState";
import { computeFundBalances } from "@/lib/calculations/funds";
import { computeLocationBalances, computeSpendable } from "@/lib/calculations/balance";
import { calculateKmFromOdo, calculateNextOilChangeOdo, calculateNextWaterFilterDate, getBikeKmCost, getLastBikeOdo } from "@/lib/calculations/bike";
import { todayKey } from "@/lib/format";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { Pill, SectionHeader } from "@/components/ui/Premium";
import { OpeningBalanceEntry } from "@/components/forms/entry-types/OpeningBalanceEntry";
import { IncomeEntry } from "@/components/forms/entry-types/IncomeEntry";
import { ExpenseEntry } from "@/components/forms/entry-types/ExpenseEntry";
import { FundDepositEntry } from "@/components/forms/entry-types/FundDepositEntry";
import { FundTransferEntry } from "@/components/forms/entry-types/FundTransferEntry";
import { FundWithdrawalEntry } from "@/components/forms/entry-types/FundWithdrawalEntry";
import { DebtPaymentEntry } from "@/components/forms/entry-types/DebtPaymentEntry";
import { BikeKmEntry } from "@/components/forms/entry-types/BikeKmEntry";
import { BikeEntry } from "@/components/forms/entry-types/BikeEntry";
import { HouseholdMaintenanceEntry } from "@/components/forms/entry-types/HouseholdMaintenanceEntry";
import { TransferEntry } from "@/components/forms/entry-types/TransferEntry";

export const transactionTypeOptions: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "opening_balance", label: "Opening Balance" },
  { value: "fund_deposit", label: "Fund Deposit" },
  { value: "fund_transfer", label: "Fund Transfer" },
  { value: "fund_withdrawal", label: "Fund Withdrawal" },
  { value: "debt_payment", label: "Debt Payment" },
  { value: "bike_entry", label: "Bike Entry" },
  { value: "household_maintenance", label: "Household Maintenance" },
  { value: "bike_km", label: "Bike KM" },
  { value: "transfer", label: "Location Transfer" },
];

const mostUsedTypes: TransactionType[] = ["expense", "income", "fund_deposit"];

const groupedMoreTypes: { title: string; helper: string; types: TransactionType[] }[] = [
  {
    title: "Planning",
    helper: "Debt, baby saving, and physical money movement",
    types: ["debt_payment", "transfer"],
  },
  {
    title: "Bike & Maintenance",
    helper: "ODO, fuel, oil, water filter, and home repairs",
    types: ["bike_entry", "household_maintenance"],
  },
  {
    title: "Advanced",
    helper: "Use only when adjusting protected funds or starting balances",
    types: ["opening_balance", "fund_transfer", "fund_withdrawal", "bike_km"],
  },
];

export const locationOptions: { value: Location; label: string }[] = [
  { value: "bank", label: "Bank" },
  { value: "wallet", label: "Wallet / Cash in Hand" },
  { value: "cash_envelope", label: "Cash Envelope" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
];

const transactionTypeHelpers: Record<TransactionType, string> = {
  expense: "Money spent from a location",
  income: "Money entering a location",
  opening_balance: "Start tracking from today",
  fund_deposit: "Protect spendable money",
  fund_transfer: "Move protected money between funds",
  fund_withdrawal: "Release protected money",
  debt_payment: "Reduce credit card debt",
  bike_entry: "ODO, fuel, oil, parking, parts",
  household_maintenance: "Water filter or home repair",
  bike_km: "Legacy KM x cost entry",
  transfer: "Move physical money",
};

export type EntryFormState = {
  date: string;
  type: TransactionType;
  amount: string;
  description: string;
  fromLocation: Location;
  toLocation: Location;
  category: string;
  incomeSource: IncomeSource;
  classification: NeedWantWaste;
  fundKey: FundKey;
  toFundKey: FundKey;
  bikeSubtype: BikeEntrySubtype;
  householdSubtype: HouseholdMaintenanceSubtype;
  currentOdo: string;
  previousOdo: string;
  km: string;
  fuelLiters: string;
  fuelPricePerLiter: string;
  fullTank: boolean;
  engineOilPrice: string;
  oilFilterPrice: string;
  serviceCharge: string;
  nextOilChangeAfterKm: string;
  partName: string;
  planned: boolean;
  waterFilterPrice: string;
  notes: string;
};

export type EntrySubFormProps = {
  form: EntryFormState;
  setForm: React.Dispatch<React.SetStateAction<EntryFormState>>;
  costPerKm: number;
  previousOdo?: number;
};

const initialForm = (): EntryFormState => ({
  date: todayKey(),
  type: "expense",
  amount: "",
  description: "",
  fromLocation: "wallet",
  toLocation: "bank",
  category: "Regular Groceries",
  incomeSource: "salary",
  classification: "need",
  fundKey: "baby_delivery",
  toFundKey: "emergency",
  bikeSubtype: "ODO Update",
  householdSubtype: "Water Filter Replacement",
  currentOdo: "",
  previousOdo: "",
  km: "",
  fuelLiters: "",
  fuelPricePerLiter: "",
  fullTank: false,
  engineOilPrice: "",
  oilFilterPrice: "",
  serviceCharge: "",
  nextOilChangeAfterKm: "",
  partName: "",
  planned: true,
  waterFilterPrice: "",
  notes: "",
});

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function AddEntryForm() {
  const { state, dispatch } = useAppState();
  const [form, setForm] = useState<EntryFormState>(initialForm);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const costPerKm = getBikeKmCost(state.settings);
  const previousOdo = getLastBikeOdo(state.transactions);
  const amount = useMemo(() => {
    if (form.type === "bike_km") return Number(form.km || 0) * costPerKm;
    if (form.type === "bike_entry") {
      if (form.bikeSubtype === "ODO Update") return 0;
      if (form.bikeSubtype === "Fuel Fill-Up") return Number(form.fuelLiters || 0) * Number(form.fuelPricePerLiter || state.settings.bikeSettings.fuelPricePerLiter);
      if (form.bikeSubtype === "Engine Oil Change") return Number(form.engineOilPrice || state.settings.bikeSettings.engineOilPrice) + Number(form.oilFilterPrice || 0) + Number(form.serviceCharge || 0);
      return Number(form.amount || 0);
    }
    if (form.type === "household_maintenance" && form.householdSubtype === "Water Filter Replacement") {
      return Number(form.waterFilterPrice || state.settings.waterFilter.price);
    }
    return Number(form.amount || 0);
  }, [costPerKm, form.amount, form.bikeSubtype, form.engineOilPrice, form.fuelLiters, form.fuelPricePerLiter, form.householdSubtype, form.km, form.oilFilterPrice, form.serviceCharge, form.type, form.waterFilterPrice, state.settings.bikeSettings.engineOilPrice, state.settings.bikeSettings.fuelPricePerLiter, state.settings.waterFilter.price]);

  const setType = (type: TransactionType) => {
    setError("");
    setSaved("");
    setForm((current) => ({
      ...current,
      type,
      amount: "",
      km: "",
      currentOdo: "",
      previousOdo: type === "bike_entry" ? String(previousOdo) : current.previousOdo,
      fuelLiters: type === "bike_entry" ? "" : current.fuelLiters,
      fuelPricePerLiter: type === "bike_entry" ? String(state.settings.bikeSettings.fuelPricePerLiter) : current.fuelPricePerLiter,
      engineOilPrice: type === "bike_entry" ? String(state.settings.bikeSettings.engineOilPrice) : current.engineOilPrice,
      oilFilterPrice: type === "bike_entry" ? String(state.settings.bikeSettings.oilFilterPrice ?? 0) : current.oilFilterPrice,
      nextOilChangeAfterKm: type === "bike_entry" ? String(state.settings.bikeSettings.oilChangeIntervalKm) : current.nextOilChangeAfterKm,
      waterFilterPrice: type === "household_maintenance" ? String(state.settings.waterFilter.price) : current.waterFilterPrice,
      category: type === "expense" ? "Regular Groceries" : current.category,
      description:
        type === "fund_deposit"
          ? "Protect money in fund"
          : type === "fund_withdrawal"
            ? "Release money from fund"
            : type === "fund_transfer"
              ? "Move protected money between funds"
            : type === "transfer"
              ? "Move money between locations"
              : type === "bike_entry"
                ? "Bike tracking"
                : type === "household_maintenance"
                  ? "Household maintenance"
                : "",
    }));
  };

  const buildTransaction = (): Transaction => {
    const now = new Date().toISOString();
    const base = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      date: form.date,
      type: form.type,
      amount,
      description: form.description.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    if (form.type === "opening_balance") return { ...base, toLocation: form.toLocation };
    if (form.type === "income") return { ...base, toLocation: form.toLocation, incomeSource: form.incomeSource };
    if (form.type === "expense") return { ...base, fromLocation: form.fromLocation, category: form.category, classification: form.classification };
    if (form.type === "bike_km") return { ...base, fromLocation: form.fromLocation, category: "Fuel Fund", classification: "need", km: Number(form.km), costPerKm };
    if (form.type === "bike_entry") {
      const currentOdo = Number(form.currentOdo || 0);
      const previous = Number(form.previousOdo || previousOdo || 0);
      const kmRun = currentOdo >= previous ? calculateKmFromOdo(previous, currentOdo) : 0;
      const category = getBikeCategory(form.bikeSubtype);
      const paidEntry = form.bikeSubtype !== "ODO Update";
      const nextOilChangeAfterKm = Number(form.nextOilChangeAfterKm || state.settings.bikeSettings.oilChangeIntervalKm);
      return {
        ...base,
        fromLocation: paidEntry ? form.fromLocation : undefined,
        category,
        classification: "need",
        bikeSubtype: form.bikeSubtype,
        currentOdo,
        previousOdo: previous,
        kmRun,
        km: kmRun,
        fuelLiters: form.bikeSubtype === "Fuel Fill-Up" ? Number(form.fuelLiters || 0) : undefined,
        fuelPricePerLiter: form.bikeSubtype === "Fuel Fill-Up" ? Number(form.fuelPricePerLiter || state.settings.bikeSettings.fuelPricePerLiter) : undefined,
        fullTank: form.bikeSubtype === "Fuel Fill-Up" ? form.fullTank : undefined,
        engineOilPrice: form.bikeSubtype === "Engine Oil Change" ? Number(form.engineOilPrice || state.settings.bikeSettings.engineOilPrice) : undefined,
        oilFilterPrice: form.bikeSubtype === "Engine Oil Change" ? Number(form.oilFilterPrice || 0) : undefined,
        serviceCharge: form.bikeSubtype === "Engine Oil Change" ? Number(form.serviceCharge || 0) : undefined,
        nextOilChangeAfterKm: form.bikeSubtype === "Engine Oil Change" ? nextOilChangeAfterKm : undefined,
        nextOilChangeOdo: form.bikeSubtype === "Engine Oil Change" ? calculateNextOilChangeOdo(currentOdo, nextOilChangeAfterKm) : undefined,
        partName: form.bikeSubtype === "Maintenance / Parts" ? form.partName.trim() || undefined : undefined,
        planned: form.bikeSubtype === "Maintenance / Parts" ? form.planned : undefined,
      };
    }
    if (form.type === "household_maintenance") {
      const category = form.householdSubtype;
      return {
        ...base,
        fromLocation: form.fromLocation,
        category,
        classification: "need",
        householdSubtype: form.householdSubtype,
      };
    }
    if (form.type === "debt_payment") return { ...base, fromLocation: form.fromLocation, fundKey: "credit_card_payment" };
    if (form.type === "transfer") return { ...base, fromLocation: form.fromLocation, toLocation: form.toLocation };
    if (form.type === "fund_transfer") return { ...base, fundKey: form.fundKey, toFundKey: form.toFundKey };
    if (form.type === "fund_withdrawal") return { ...base, fundKey: form.fundKey };
    return { ...base, fundKey: form.fundKey };
  };

  const validate = (transaction: Transaction) => {
    if (!transaction.date) return "Date is required.";
    if (transaction.type !== "bike_entry" || transaction.bikeSubtype !== "ODO Update") {
      if (!transaction.amount || transaction.amount <= 0) return "Amount must be more than 0.";
    }
    if (transaction.type === "bike_km" && (!transaction.km || transaction.km <= 0)) return "KM must be more than 0.";
    if (transaction.type === "bike_entry") {
      if (typeof transaction.currentOdo !== "number" || transaction.currentOdo <= 0) return "Current ODO reading is required.";
      if (typeof transaction.previousOdo === "number" && transaction.currentOdo < transaction.previousOdo) return "Current ODO cannot be lower than previous ODO.";
      if (transaction.bikeSubtype === "Fuel Fill-Up" && (!transaction.fuelLiters || transaction.fuelLiters <= 0)) return "Fuel quantity must be more than 0.";
      if (transaction.bikeSubtype === "Maintenance / Parts" && !transaction.partName) return "Part or service name is required.";
    }
    if (transaction.type === "transfer" && transaction.fromLocation === transaction.toLocation) return "Choose two different locations.";
    if (transaction.type === "fund_transfer" && transaction.fundKey === transaction.toFundKey) return "Choose two different funds.";

    const currentFundBalances = state.fundBalances;
    if ((transaction.type === "fund_withdrawal" || transaction.type === "fund_transfer") && transaction.fundKey) {
      if ((currentFundBalances[transaction.fundKey] ?? 0) < transaction.amount) return "This fund does not have enough protected balance.";
    }

    const nextTransactions = [...state.transactions, transaction];
    const nextSpendable = computeSpendable(
      computeLocationBalances(nextTransactions),
      computeFundBalances(nextTransactions),
    );
    if (nextSpendable < 0) return "This entry would make spendable balance negative.";

    return "";
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const transaction = buildTransaction();
    const validation = validate(transaction);
    if (validation) {
      setError(validation);
      setSaved("");
      return;
    }
    dispatch({ type: "ADD_TRANSACTION", payload: transaction });
    applyFollowUpUpdates(transaction);
    setForm(initialForm());
    setSaved("Entry saved. আজকের খরচ লিখেছেন?");
    setError("");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-[var(--notion-radius)] bg-[var(--notion-tint-yellow-bold)] p-4 text-sm font-medium text-[var(--notion-charcoal)]">
        Past data unknown. From today, every taka has a record.
      </div>

      <section className="notion-card p-4">
        <SectionHeader
          title="What are you recording?"
          description="Choose one type. The form below will only show the fields needed for that money movement."
        />
        <div className="grid grid-cols-3 gap-2">
          {transactionTypeOptions.filter((option) => mostUsedTypes.includes(option.value)).map((option) => {
            const active = form.type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`min-h-12 rounded-xl border p-2 text-center transition sm:p-3 sm:text-left ${
                  active
                    ? "border-[var(--notion-primary)] bg-[var(--notion-tint-lavender)] text-[var(--notion-primary-deep)] shadow-[inset_0_0_0_1px_rgba(109,74,255,0.12)]"
                    : "border-[var(--notion-hairline)] bg-white text-[var(--notion-ink)] hover:border-[var(--notion-hairline-strong)]"
                }`}
              >
                <span className="text-sm font-semibold">{option.label}</span>
                <span className={`mt-1 hidden text-xs sm:block ${active ? "text-[var(--notion-primary-deep)]" : "text-[var(--notion-slate)]"}`}>
                  {transactionTypeHelpers[option.value]}
                </span>
              </button>
            );
          })}
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer rounded-xl border border-[var(--notion-hairline)] bg-white px-3 py-2 text-sm font-semibold text-[var(--notion-slate)]">More entry types</summary>
          <div className="mt-3 space-y-3">
            {groupedMoreTypes.map((group) => (
              <div key={group.title} className="rounded-xl border border-[var(--notion-hairline)] bg-white p-3">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-[var(--notion-ink)]">{group.title}</p>
                  <p className="text-xs text-[var(--notion-slate)]">{group.helper}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.types.map((type) => {
                    const option = transactionTypeOptions.find((item) => item.value === type);
                    if (!option) return null;
                    const active = form.type === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setType(option.value)}
                        className={`min-h-12 rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-[var(--notion-primary)] bg-[var(--notion-tint-lavender)] text-[var(--notion-primary-deep)]"
                            : "border-[var(--notion-hairline)] bg-white text-[var(--notion-ink)]"
                        }`}
                      >
                        <span className="text-sm font-semibold">{option.label}</span>
                        <span className={`mt-1 block text-xs ${active ? "text-[var(--notion-primary-deep)]" : "text-[var(--notion-slate)]"}`}>
                          {transactionTypeHelpers[option.value]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </details>
      </section>

      <section className="notion-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--notion-ink)]">{transactionTypeOptions.find((option) => option.value === form.type)?.label}</h2>
            <p className="text-sm text-[var(--notion-slate)]">{transactionTypeHelpers[form.type]}</p>
          </div>
          <Pill tone="primary">আজকের খরচ লিখেছেন?</Pill>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="hidden rounded-xl bg-[var(--notion-surface-soft)] p-3 text-sm text-[var(--notion-slate)] sm:block sm:col-span-2">
            <p className="font-semibold text-[var(--notion-ink)]">Fast entry rule</p>
            <p className="mt-1">Amount, category, date, and location are enough for most entries.</p>
          </div>

          <div className="sm:col-span-2">
          {form.type === "opening_balance" && <OpeningBalanceEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          {form.type === "income" && <IncomeEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          {form.type === "expense" && <ExpenseEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          {form.type === "fund_deposit" && <FundDepositEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          {form.type === "fund_transfer" && <FundTransferEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          {form.type === "fund_withdrawal" && <FundWithdrawalEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          {form.type === "debt_payment" && <DebtPaymentEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          {form.type === "bike_entry" && <BikeEntry form={form} setForm={setForm} costPerKm={costPerKm} previousOdo={previousOdo} />}
          {form.type === "household_maintenance" && <HouseholdMaintenanceEntry form={form} setForm={setForm} costPerKm={costPerKm} previousOdo={previousOdo} />}
          {form.type === "bike_km" && <BikeKmEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          {form.type === "transfer" && <TransferEntry form={form} setForm={setForm} costPerKm={costPerKm} />}
          </div>

          <Field label="Date">
            <input className="input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </Field>
          <details className="sm:col-span-2">
            <summary className="cursor-pointer rounded-xl border border-[var(--notion-hairline)] bg-white px-3 py-2 text-sm font-semibold text-[var(--notion-slate)]">Optional notes</summary>
            <div className="mt-3">
              <Field label="Notes">
                <input className="input" value={form.notes} placeholder="Optional" onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </Field>
            </div>
          </details>
        </div>
      </section>

      {form.type === "bike_km" ? (
        <div className="rounded-[var(--notion-radius)] border border-[var(--notion-hairline)] bg-[var(--notion-tint-lavender)] p-4 text-sm text-[var(--notion-primary-deep)]">
          Bike cost preview: {form.km || 0} km x <BDTAmount amount={costPerKm} /> = <BDTAmount amount={amount} className="font-semibold" />
        </div>
      ) : null}
      {form.type === "bike_entry" && Number(form.currentOdo || 0) > 0 ? (
        <div className="rounded-[var(--notion-radius)] border border-[var(--notion-hairline)] bg-[var(--notion-tint-lavender)] p-4 text-sm text-[var(--notion-primary-deep)]">
          ODO preview: {form.currentOdo} - {form.previousOdo || previousOdo} = {Math.max(Number(form.currentOdo || 0) - Number(form.previousOdo || previousOdo || 0), 0)} km run. Entry amount: <BDTAmount amount={amount} className="font-semibold" />
        </div>
      ) : null}

      {error ? <p className="rounded-[var(--notion-radius)] bg-[var(--notion-tint-rose)] px-4 py-3 text-sm text-[var(--notion-error)]">{error}</p> : null}
      {saved ? <p className="rounded-[var(--notion-radius)] bg-[var(--notion-brand-navy)] px-4 py-3 text-sm text-white">{saved}</p> : null}

      <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-10 lg:static">
        <button className="notion-primary-button flex h-14 w-full items-center justify-center gap-2 text-base">
          <Save size={20} />
          Save Entry {amount > 0 ? <BDTAmount amount={amount} /> : null}
        </button>
      </div>
    </form>
  );

  function applyFollowUpUpdates(transaction: Transaction) {
    if (transaction.type === "bike_entry" && transaction.bikeSubtype === "Fuel Fill-Up") {
      dispatch({
        type: "UPDATE_SETTINGS",
        payload: {
          bikeSettings: {
            ...state.settings.bikeSettings,
            fuelPricePerLiter: transaction.fuelPricePerLiter ?? state.settings.bikeSettings.fuelPricePerLiter,
            lastFuelLiters: transaction.fuelLiters,
            lastFuelAmount: transaction.amount,
          },
        },
      });
    }

    if (transaction.type === "bike_entry" && transaction.bikeSubtype === "Engine Oil Change" && transaction.currentOdo && transaction.nextOilChangeOdo) {
      dispatch({
        type: "UPDATE_SETTINGS",
        payload: {
          bikeSettings: {
            ...state.settings.bikeSettings,
            lastOilChangeOdo: transaction.currentOdo,
            nextOilChangeOdo: transaction.nextOilChangeOdo,
            engineOilPrice: transaction.engineOilPrice ?? state.settings.bikeSettings.engineOilPrice,
            oilFilterPrice: transaction.oilFilterPrice ?? state.settings.bikeSettings.oilFilterPrice,
            oilChangeIntervalKm: transaction.nextOilChangeAfterKm ?? state.settings.bikeSettings.oilChangeIntervalKm,
          },
        },
      });
    }

    if (transaction.type === "bike_entry" && transaction.bikeSubtype === "Maintenance / Parts" && transaction.partName) {
      dispatch({
        type: "UPDATE_SETTINGS",
        payload: {
          bikeParts: state.settings.bikeParts.map((part) =>
            part.name === transaction.partName
              ? { ...part, lastReplacedDate: transaction.date, lastReplacedOdo: transaction.currentOdo }
              : part,
          ),
        },
      });
    }

    if (transaction.type === "household_maintenance" && transaction.householdSubtype === "Water Filter Replacement") {
      dispatch({
        type: "UPDATE_SETTINGS",
        payload: {
          waterFilter: {
            ...state.settings.waterFilter,
            price: transaction.amount,
            lastChangedDate: transaction.date,
            nextChangeDate: calculateNextWaterFilterDate(transaction.date, state.settings.waterFilter.replacementIntervalMonths),
          },
        },
      });
    }
  }
}

function getBikeCategory(subtype: BikeEntrySubtype) {
  if (subtype === "Fuel Fill-Up") return "Fuel Fund";
  if (subtype === "Engine Oil Change") return "Engine Oil Fund";
  if (subtype === "Parking") return "Parking";
  if (subtype === "Maintenance / Parts") return "Bike Maintenance Fund";
  return "Fuel Fund";
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-medium text-[var(--notion-slate)]">
      <span>{label}</span>
      {children}
    </label>
  );
}
