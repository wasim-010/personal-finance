import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, DescriptionField, LocationField } from "@/components/forms/entry-types/shared";

export function OpeningBalanceEntry({ form, setForm }: EntrySubFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AmountField form={form} setForm={setForm} label="Starting Amount" />
      <LocationField label="To Location" value={form.toLocation} onChange={(toLocation) => setForm({ ...form, toLocation })} />
      <DescriptionField form={form} setForm={setForm} placeholder="Cash in hand, bank balance" />
    </div>
  );
}
