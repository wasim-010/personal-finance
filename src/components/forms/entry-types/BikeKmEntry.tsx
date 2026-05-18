import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { DescriptionField, LocationField } from "@/components/forms/entry-types/shared";
import { Field } from "@/components/forms/AddEntryForm";

export function BikeKmEntry({ form, setForm, costPerKm }: EntrySubFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={`KM (rate snapshot will be ৳${Math.round(costPerKm)}/km)`}>
        <input className="input" type="number" min="0" inputMode="decimal" value={form.km} onChange={(event) => setForm({ ...form, km: event.target.value })} />
      </Field>
      <LocationField label="From Location" value={form.fromLocation} onChange={(fromLocation) => setForm({ ...form, fromLocation })} />
      <DescriptionField form={form} setForm={setForm} placeholder="Office trip, market trip" />
    </div>
  );
}
