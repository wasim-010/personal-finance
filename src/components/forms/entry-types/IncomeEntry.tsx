import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, DescriptionField, IncomeSourceField, LocationField } from "@/components/forms/entry-types/shared";

export function IncomeEntry({ form, setForm }: EntrySubFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <IncomeSourceField form={form} setForm={setForm} />
      <AmountField form={form} setForm={setForm} />
      <LocationField label="To Location" value={form.toLocation} onChange={(toLocation) => setForm({ ...form, toLocation })} />
      <DescriptionField form={form} setForm={setForm} placeholder="Salary, rental income" />
    </div>
  );
}
