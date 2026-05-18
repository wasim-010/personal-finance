"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Bike, Database, Download, LockKeyhole, Save, Settings2, Upload, Wallet } from "lucide-react";
import { useAppState } from "@/lib/state/useAppState";
import { exportJSON, importAndMigrateJSON } from "@/lib/storage";
import { todayKey } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { BDTAmount } from "@/components/ui/BDTAmount";
import { MetricCard, Pill, SectionHeader } from "@/components/ui/Premium";
import { BUDGET_CATEGORIES } from "@/lib/defaults/categories";
import { calculateEngineOilCostPerKm, calculateFuelCostPerKm, calculateMaintenanceFundTarget, calculatePureMaintenanceCostPerKm, calculateWaterFilterMonthlyReserve } from "@/lib/calculations/bike";
import { getTotalProtectedBalance } from "@/lib/calculations/balance";
import { FUND_LABELS, type BikeMode, type BikePart, type BudgetCategory, type BudgetMode, type FundKey, type IncomeSource, type Settings, type Transaction } from "@/types/finance";

type SettingsTab = "general" | "income" | "funds" | "bike" | "budget" | "maintenance" | "data";

const tabs: { value: SettingsTab; label: string }[] = [
  { value: "general", label: "General" },
  { value: "income", label: "Income Cycle" },
  { value: "funds", label: "Funds" },
  { value: "bike", label: "Bike" },
  { value: "budget", label: "Budget Modes" },
  { value: "maintenance", label: "Maintenance" },
  { value: "data", label: "Data & Backup" },
];

const modeOptions: { value: BudgetMode; label: string; helper: string }[] = [
  { value: "normal", label: "Normal Month", helper: "Standard salary-cycle planning." },
  { value: "qurbani", label: "Qurbani Beef Period", helper: "Treat beef savings as baby/debt money." },
  { value: "saidpur", label: "Saidpur Separation", helper: "Income reduced. Baby fund first." },
  { value: "after_baby", label: "After Baby Birth", helper: "Baby care replaces delivery saving." },
];

const bikeModeOptions: { value: BikeMode; label: string }[] = [
  { value: "true_cost", label: "True Cost" },
  { value: "cash_running", label: "Cash Running" },
];

const incomeLabels: Record<IncomeSource, string> = {
  salary: "Salary",
  rental_income: "Rental Income",
  mother_in_law_support: "Mother-in-law Support",
  other: "Other Income",
};

const budgetKeys = BUDGET_CATEGORIES as BudgetCategory[];
const incomeKeys = Object.keys(incomeLabels) as IncomeSource[];
const fundKeys = Object.keys(FUND_LABELS) as FundKey[];

export default function SettingsPage() {
  const { state, dispatch } = useAppState();
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [budgetModeToEdit, setBudgetModeToEdit] = useState<BudgetMode>(state.settings.budgetMode);
  const fileRef = useRef<HTMLInputElement>(null);
  const settings = state.settings;
  const debt = state.debt;
  const protectedMoney = getTotalProtectedBalance(state.fundBalances);
  const expectedIncomeTotal = incomeKeys.reduce((sum, source) => sum + settings.expectedIncome[source], 0);

  const updateSettings = (patch: Partial<Settings>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: patch });
  };

  const save = () => {
    setMessage("Settings already saved. Salary money is not available money.");
  };

  const exportCsv = () => {
    const headers: (keyof Transaction)[] = [
      "date",
      "type",
      "description",
      "amount",
      "fromLocation",
      "toLocation",
      "category",
      "incomeSource",
      "classification",
      "fundKey",
      "toFundKey",
      "km",
      "costPerKm",
      "bikeSubtype",
      "householdSubtype",
      "currentOdo",
      "previousOdo",
      "kmRun",
      "fuelLiters",
      "fuelPricePerLiter",
      "engineOilPrice",
      "oilFilterPrice",
      "partName",
      "planned",
      "notes",
    ];
    const rows = state.transactions.map((transaction) =>
      headers.map((key) => JSON.stringify(String(transaction[key] ?? ""))).join(","),
    );
    downloadBlob(new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" }), "finance-transactions.csv");
  };

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = importAndMigrateJSON(await file.text());
    if ("error" in result) {
      setMessage(result.error);
      return;
    }
    if (window.confirm("Replace current app data with this imported backup?")) {
      dispatch({ type: "REPLACE_STATE", payload: result });
      setMessage("Imported backup. Your data was migrated safely.");
    }
    event.target.value = "";
  };

  const addExpectedIncome = () => {
    const now = new Date().toISOString();
    const entries = incomeKeys
      .filter((source) => settings.expectedIncome[source] > 0)
      .map((source): Transaction => ({
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        date: todayKey(),
        type: "income",
        amount: settings.expectedIncome[source],
        incomeSource: source,
        toLocation: "bank",
        description: incomeLabels[source],
      }));

    if (!entries.length) {
      setMessage("Set expected income amounts before adding income entries.");
      return;
    }

    entries.forEach((entry) => dispatch({ type: "ADD_TRANSACTION", payload: entry }));
    setMessage("Expected income entries added to Bank.");
  };

  const updateBikeSettings = (patch: Partial<Settings["bikeSettings"]>) => {
    updateSettings({ bikeSettings: { ...settings.bikeSettings, ...patch } });
  };

  const updateWaterFilter = (patch: Partial<Settings["waterFilter"]>) => {
    updateSettings({ waterFilter: { ...settings.waterFilter, ...patch } });
  };

  const updateBikePart = (id: string, patch: Partial<BikePart>) => {
    updateSettings({
      bikeParts: settings.bikeParts.map((part) => (part.id === id ? { ...part, ...patch } : part)),
    });
  };

  const fuelCostPerKm = calculateFuelCostPerKm(settings.bikeSettings.fuelPricePerLiter, settings.bikeSettings.expectedMileageKmPerLiter);
  const oilCostPerKm = calculateEngineOilCostPerKm(settings.bikeSettings.engineOilPrice + (settings.bikeSettings.oilFilterPrice ?? 0), settings.bikeSettings.oilChangeIntervalKm);
  const maintenanceCostPerKm = calculatePureMaintenanceCostPerKm(settings.bikeSettings.bikeTrueCostPerKm, fuelCostPerKm, oilCostPerKm);
  const maintenanceTarget = calculateMaintenanceFundTarget(settings.bikeSettings.expectedMonthlyKm, maintenanceCostPerKm);
  const waterReserve = calculateWaterFilterMonthlyReserve(settings.waterFilter.price, settings.waterFilter.replacementIntervalMonths);

  return (
    <>
      <PageHeader title="Settings" subtitle="Personal system controls, not generic app settings" />

      {state.migrationNotice ? (
        <section className="mb-4 notion-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-[var(--notion-primary-deep)]">{state.migrationNotice}</p>
            <button className="button-secondary" onClick={() => dispatch({ type: "DISMISS_MIGRATION_NOTICE" })}>Dismiss</button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active Mode" value={modeOptions.find((mode) => mode.value === settings.budgetMode)?.label} icon={Settings2} tone="dark" />
        <MetricCard label="Salary Cycle Starts" value={`Day ${settings.salaryDate}`} icon={Wallet} note="Clamped to 28 for month safety" />
        <MetricCard label="Expected Income" value={<BDTAmount amount={expectedIncomeTotal} />} icon={Wallet} />
        <MetricCard label="Protected Funds" value={<BDTAmount amount={protectedMoney} />} icon={LockKeyhole} tone="success" />
      </section>

      <section className="mt-5 notion-card p-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                activeTab === tab.value
                  ? "bg-[var(--notion-brand-navy)] text-white"
                  : "text-[var(--notion-slate)] hover:bg-[var(--notion-surface-soft)] hover:text-[var(--notion-ink)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "general" ? (
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <SettingsCard title="Personal Budget Mode" description="Mode changes planning targets only. It never changes past transactions.">
            <div className="grid gap-3">
              {modeOptions.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => updateSettings({ budgetMode: mode.value })}
                  className={`rounded-xl border p-3 text-left transition ${
                    settings.budgetMode === mode.value
                      ? "border-[var(--notion-primary)] bg-[var(--notion-tint-lavender)]"
                      : "border-[var(--notion-hairline)] bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[var(--notion-ink)]">{mode.label}</p>
                    {settings.budgetMode === mode.value ? <Pill tone="primary">Active</Pill> : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--notion-slate)]">{mode.helper}</p>
                </button>
              ))}
            </div>
          </SettingsCard>

          <SettingsCard title="Cycle & Debt" description="Salary date drives all cycle-based dashboard and budget calculations.">
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField
                label="Salary date"
                value={settings.salaryDate}
                min={1}
                max={28}
                onChange={(value) => updateSettings({ salaryDate: Math.min(Math.max(value, 1), 28) })}
              />
              <NumberField label="Current outstanding" value={debt.outstanding} onChange={(value) => dispatch({ type: "UPDATE_DEBT", payload: { outstanding: value } })} />
              <NumberField label="Original debt" value={debt.originalAmount} onChange={(value) => dispatch({ type: "UPDATE_DEBT", payload: { originalAmount: value } })} />
              <NumberField label="Minimum payment" value={debt.minimumPayment} onChange={(value) => dispatch({ type: "UPDATE_DEBT", payload: { minimumPayment: value } })} />
              <NumberField label="Annual interest %" value={debt.interestRate} onChange={(value) => dispatch({ type: "UPDATE_DEBT", payload: { interestRate: value } })} />
            </div>
            <p className="mt-3 rounded-xl bg-[var(--notion-surface-soft)] p-3 text-sm text-[var(--notion-slate)]">
              Salary money is not available money. Divide it first.
            </p>
          </SettingsCard>
        </section>
      ) : null}

      {activeTab === "income" ? (
        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.75fr]">
          <SettingsCard title="Expected Income" description="These are planning assumptions. Adding income entries still records real money into Bank.">
            <div className="grid gap-3 sm:grid-cols-2">
              {incomeKeys.map((source) => (
                <NumberField
                  key={source}
                  label={incomeLabels[source]}
                  value={settings.expectedIncome[source]}
                  onChange={(value) => updateSettings({ expectedIncome: { ...settings.expectedIncome, [source]: value } })}
                />
              ))}
            </div>
          </SettingsCard>
          <SettingsCard title="Income Actions" description="Use this only when you want to seed expected income for today.">
            <div className="space-y-3">
              <button className="notion-primary-button w-full" onClick={addExpectedIncome}>Add expected income entries</button>
              <p className="rounded-xl bg-[var(--notion-tint-yellow)] p-3 text-sm text-[#6f4e00]">
                Entries go to Bank. Real tracking starts from the date you add them.
              </p>
            </div>
          </SettingsCard>
        </section>
      ) : null}

      {activeTab === "funds" ? (
        <section className="mt-4">
          <SettingsCard title="Fund Targets" description="Targets guide warnings and progress. Existing saved balances are never overwritten.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fundKeys.map((fundKey) => (
                <NumberField
                  key={fundKey}
                  label={FUND_LABELS[fundKey]}
                  value={settings.fundTargets[fundKey]}
                  onChange={(value) => updateSettings({ fundTargets: { ...settings.fundTargets, [fundKey]: value } })}
                />
              ))}
            </div>
          </SettingsCard>
        </section>
      ) : null}

      {activeTab === "bike" ? (
        <section className="mt-4 space-y-4">
          <SettingsCard title="Bike Cost Tracker" description="Future bike estimates use these values. Old bike entries keep their historical rates.">
            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Fuel / KM" value={<BDTAmount amount={fuelCostPerKm} />} />
              <MetricCard label="Oil / KM" value={<BDTAmount amount={oilCostPerKm} />} />
              <MetricCard label="Maintenance / KM" value={<BDTAmount amount={maintenanceCostPerKm} />} />
              <MetricCard label="Monthly Maintenance" value={<BDTAmount amount={maintenanceTarget} />} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Bike mode">
                <select className="input" value={settings.bikeMode} onChange={(event) => updateSettings({ bikeMode: event.target.value as BikeMode })}>
                  {bikeModeOptions.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
                </select>
              </Field>
              <NumberField label="Fuel price/liter" value={settings.bikeSettings.fuelPricePerLiter} onChange={(value) => updateBikeSettings({ fuelPricePerLiter: value })} />
              <NumberField label="Expected mileage km/liter" value={settings.bikeSettings.expectedMileageKmPerLiter} onChange={(value) => updateBikeSettings({ expectedMileageKmPerLiter: value })} />
              <NumberField label="Full tank liters" value={settings.bikeSettings.fullTankLiters} onChange={(value) => updateBikeSettings({ fullTankLiters: value })} />
              <NumberField label="True bike cost/km" value={settings.bikeSettings.bikeTrueCostPerKm} onChange={(value) => updateBikeSettings({ bikeTrueCostPerKm: value })} />
              <NumberField label="Cash running cost/km" value={settings.bikeSettings.bikeCashCostPerKm} onChange={(value) => updateBikeSettings({ bikeCashCostPerKm: value })} />
              <NumberField label="Engine oil price" value={settings.bikeSettings.engineOilPrice} onChange={(value) => updateBikeSettings({ engineOilPrice: value })} />
              <NumberField label="Oil filter price" value={settings.bikeSettings.oilFilterPrice ?? 0} onChange={(value) => updateBikeSettings({ oilFilterPrice: value })} />
              <NumberField label="Oil interval KM" value={settings.bikeSettings.oilChangeIntervalKm} onChange={(value) => updateBikeSettings({ oilChangeIntervalKm: value })} />
              <NumberField label="Last oil change ODO" value={settings.bikeSettings.lastOilChangeOdo ?? 0} onChange={(value) => updateBikeSettings({ lastOilChangeOdo: value, nextOilChangeOdo: value + settings.bikeSettings.oilChangeIntervalKm })} />
              <NumberField label="Expected monthly KM" value={settings.bikeSettings.expectedMonthlyKm} onChange={(value) => updateBikeSettings({ expectedMonthlyKm: value })} />
              <NumberField label="Monthly parking" value={settings.bikeSettings.monthlyParkingCost} onChange={(value) => updateBikeSettings({ monthlyParkingCost: value })} />
              <NumberField label="Maintenance minimum" value={settings.bikeSettings.monthlyBikeMaintenanceMinimum} onChange={(value) => updateBikeSettings({ monthlyBikeMaintenanceMinimum: value })} />
              <NumberField label="Maintenance ideal" value={settings.bikeSettings.monthlyBikeMaintenanceIdeal} onChange={(value) => updateBikeSettings({ monthlyBikeMaintenanceIdeal: value })} />
            </div>
          </SettingsCard>
        </section>
      ) : null}

      {activeTab === "budget" ? (
        <section className="mt-4">
          <SettingsCard title="Budget Modes" description="Edit one mode at a time. Switching modes only changes planning and warnings.">
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {modeOptions.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setBudgetModeToEdit(mode.value)}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold ${
                    budgetModeToEdit === mode.value
                      ? "bg-[var(--notion-brand-navy)] text-white"
                      : "border border-[var(--notion-hairline)] bg-white text-[var(--notion-slate)]"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {budgetKeys.map((key) => (
                <NumberField
                  key={key}
                  label={key}
                  value={settings.budgets[budgetModeToEdit][key]}
                  onChange={(value) =>
                    updateSettings({
                      budgets: {
                        ...settings.budgets,
                        [budgetModeToEdit]: { ...settings.budgets[budgetModeToEdit], [key]: value },
                      },
                    })
                  }
                />
              ))}
            </div>
          </SettingsCard>
        </section>
      ) : null}

      {activeTab === "maintenance" ? (
        <section className="mt-4 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <SettingsCard title="Water Filter" description="Household maintenance, separate from bike.">
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Water filter price" value={settings.waterFilter.price} onChange={(value) => updateWaterFilter({ price: value, monthlyReserveTarget: calculateWaterFilterMonthlyReserve(value, settings.waterFilter.replacementIntervalMonths) })} />
              <NumberField label="Interval months" value={settings.waterFilter.replacementIntervalMonths} onChange={(value) => updateWaterFilter({ replacementIntervalMonths: value, monthlyReserveTarget: calculateWaterFilterMonthlyReserve(settings.waterFilter.price, value) })} />
              <Field label="Last changed date">
                <input className="input" type="date" value={settings.waterFilter.lastChangedDate ?? ""} onChange={(event) => updateWaterFilter({ lastChangedDate: event.target.value })} />
              </Field>
              <Field label="Next change date">
                <input className="input" type="date" value={settings.waterFilter.nextChangeDate ?? ""} onChange={(event) => updateWaterFilter({ nextChangeDate: event.target.value })} />
              </Field>
            </div>
            <p className="mt-3 rounded-xl bg-[var(--notion-surface-soft)] p-3 text-sm text-[var(--notion-slate)]">
              Monthly water filter reserve: <BDTAmount amount={waterReserve} />.
            </p>
          </SettingsCard>

          <SettingsCard title="Bike Parts Price List" description="Update prices and intervals for future forecast reminders.">
            <div className="space-y-3">
              {settings.bikeParts.map((part) => (
                <div key={part.id} className="rounded-xl border border-[var(--notion-hairline)] bg-white p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Bike size={17} className="text-[var(--notion-primary)]" />
                      <strong>{part.name}</strong>
                    </div>
                    <Pill tone={part.reminderEnabled ? "success" : "neutral"}>{part.reminderEnabled ? "Reminder on" : "Reminder off"}</Pill>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Part name">
                      <input className="input" value={part.name} onChange={(event) => updateBikePart(part.id, { name: event.target.value })} />
                    </Field>
                    <NumberField label="Estimated price" value={part.estimatedPrice} onChange={(value) => updateBikePart(part.id, { estimatedPrice: value })} />
                    <NumberField label="Interval KM" value={part.replacementIntervalKm ?? 0} onChange={(value) => updateBikePart(part.id, { replacementIntervalKm: value || undefined })} />
                    <NumberField label="Interval months" value={part.replacementIntervalMonths ?? 0} onChange={(value) => updateBikePart(part.id, { replacementIntervalMonths: value || undefined })} />
                    <NumberField label="Last replaced ODO" value={part.lastReplacedOdo ?? 0} onChange={(value) => updateBikePart(part.id, { lastReplacedOdo: value || undefined })} />
                    <Field label="Last replaced date">
                      <input className="input" type="date" value={part.lastReplacedDate ?? ""} onChange={(event) => updateBikePart(part.id, { lastReplacedDate: event.target.value || undefined })} />
                    </Field>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-[var(--notion-slate)]">
                    <input type="checkbox" checked={part.reminderEnabled} onChange={(event) => updateBikePart(part.id, { reminderEnabled: event.target.checked })} />
                    Reminder active
                  </label>
                </div>
              ))}
            </div>
          </SettingsCard>
        </section>
      ) : null}

      {activeTab === "data" ? (
        <section className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <SettingsCard title="Data & Backup" description="Export before risky changes. Import asks for confirmation before replacing current data.">
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="notion-primary-button" onClick={() => exportJSON(state)}><Download size={18} /> Export JSON</button>
              <button className="button-secondary" onClick={exportCsv}><Download size={18} /> Export CSV</button>
              <button className="button-secondary" onClick={() => fileRef.current?.click()}><Upload size={18} /> Import JSON</button>
              <button className="button-secondary" onClick={save}><Save size={18} /> Settings autosaved</button>
              <input ref={fileRef} className="hidden" type="file" accept="application/json" onChange={importJson} />
            </div>
          </SettingsCard>
          <SettingsCard title="Data Safety" description="LocalStorage is preserved by migrations. Reset is intentionally not exposed here.">
            <div className="rounded-xl bg-[var(--notion-tint-yellow)] p-4 text-sm text-[#6f4e00]">
              আগে future money আলাদা, তারপর spending. Export a JSON backup before importing new data.
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[var(--notion-surface-soft)] p-3 text-sm text-[var(--notion-slate)]">
              <Database size={17} />
              Current records: {state.transactions.length}
            </div>
          </SettingsCard>
        </section>
      ) : null}

      {message ? <p className="mt-4 rounded-[var(--notion-radius)] bg-[var(--notion-brand-navy)] px-4 py-3 text-sm text-white">{message}</p> : null}
    </>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="notion-card p-4">
      <SectionHeader title={title} description={description} />
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-[var(--notion-slate)]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  min = 0,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        className="input"
        type="number"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value || 0))}
      />
    </Field>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
