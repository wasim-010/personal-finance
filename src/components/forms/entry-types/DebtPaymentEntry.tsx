import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, DescriptionField, LocationField } from "@/components/forms/entry-types/shared";

export function DebtPaymentEntry({ form, setForm }: EntrySubFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AmountField form={form} setForm={setForm} label="Debt Payment Amount" />
      <LocationField label="From Location" value={form.fromLocation} onChange={(fromLocation) => setForm({ ...form, fromLocation })} />
      <DescriptionField form={form} setForm={setForm} placeholder="Credit card payment" />
    </div>
  );
}
