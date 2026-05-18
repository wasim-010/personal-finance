import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, DescriptionField, LocationField } from "@/components/forms/entry-types/shared";

export function TransferEntry({ form, setForm }: EntrySubFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LocationField label="From Location" value={form.fromLocation} onChange={(fromLocation) => setForm({ ...form, fromLocation })} />
      <LocationField label="To Location" value={form.toLocation} onChange={(toLocation) => setForm({ ...form, toLocation })} />
      <AmountField form={form} setForm={setForm} />
      <DescriptionField form={form} setForm={setForm} placeholder="Bank to cash envelope" />
    </div>
  );
}
