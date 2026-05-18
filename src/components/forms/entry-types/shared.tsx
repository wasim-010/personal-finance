import type { EntryFormState } from "@/components/forms/AddEntryForm";
import { Field, locationOptions } from "@/components/forms/AddEntryForm";
import { EXPENSE_CATEGORIES } from "@/lib/defaults/categories";
import { FUND_LABELS, type FundKey, type IncomeSource, type Location, type NeedWantWaste } from "@/types/finance";

export function AmountField({ form, setForm, label = "Amount" }: SubProps & { label?: string }) {
  return (
    <Field label={label}>
      <input className="input" type="number" min="0" inputMode="decimal" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
    </Field>
  );
}

export function DescriptionField({ form, setForm, placeholder = "Short description" }: SubProps & { placeholder?: string }) {
  return (
    <Field label="Description">
      <input className="input" value={form.description} placeholder={placeholder} onChange={(event) => setForm({ ...form, description: event.target.value })} />
    </Field>
  );
}

export function LocationField({ label, value, onChange }: { label: string; value: Location; onChange: (value: Location) => void }) {
  return (
    <Field label={label}>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value as Location)}>
        {locationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Field>
  );
}

export function FundField({ label, value, onChange }: { label: string; value: FundKey; onChange: (value: FundKey) => void }) {
  return (
    <Field label={label}>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value as FundKey)}>
        {(Object.keys(FUND_LABELS) as FundKey[]).map((key) => <option key={key} value={key}>{FUND_LABELS[key]}</option>)}
      </select>
    </Field>
  );
}

export function ExpenseCategoryField({ form, setForm }: SubProps) {
  return (
    <Field label="Expense Category">
      <select className="input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
        {EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
      </select>
    </Field>
  );
}

export function IncomeSourceField({ form, setForm }: SubProps) {
  const options: { value: IncomeSource; label: string }[] = [
    { value: "salary", label: "Salary" },
    { value: "rental_income", label: "Rental Income" },
    { value: "mother_in_law_support", label: "Mother-in-law Support" },
    { value: "other", label: "Other Income" },
  ];
  return (
    <Field label="Income Source">
      <select className="input" value={form.incomeSource} onChange={(event) => setForm({ ...form, incomeSource: event.target.value as IncomeSource })}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Field>
  );
}

export function ClassificationField({ form, setForm }: SubProps) {
  const options: { value: NeedWantWaste; label: string }[] = [
    { value: "need", label: "Need" },
    { value: "want", label: "Want" },
    { value: "waste", label: "Waste" },
  ];
  return (
    <Field label="Need / Want / Waste">
      <select className="input" value={form.classification} onChange={(event) => setForm({ ...form, classification: event.target.value as NeedWantWaste })}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </Field>
  );
}

export type SubProps = {
  form: EntryFormState;
  setForm: React.Dispatch<React.SetStateAction<EntryFormState>>;
};
