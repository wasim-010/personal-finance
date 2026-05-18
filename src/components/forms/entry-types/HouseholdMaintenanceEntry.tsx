import type { HouseholdMaintenanceSubtype } from "@/types/finance";
import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, DescriptionField, LocationField } from "@/components/forms/entry-types/shared";
import { Field } from "@/components/forms/AddEntryForm";
import { useAppState } from "@/lib/state/useAppState";
import { BDTAmount } from "@/components/ui/BDTAmount";

const householdSubtypes: HouseholdMaintenanceSubtype[] = [
  "Water Filter Replacement",
  "Home Repair",
  "Other Household Maintenance",
];

export function HouseholdMaintenanceEntry({ form, setForm }: EntrySubFormProps) {
  const { state } = useAppState();
  const reserve = state.settings.waterFilter.monthlyReserveTarget;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Household subtype">
        <select className="input" value={form.householdSubtype} onChange={(event) => setForm({ ...form, householdSubtype: event.target.value as HouseholdMaintenanceSubtype })}>
          {householdSubtypes.map((subtype) => <option key={subtype}>{subtype}</option>)}
        </select>
      </Field>
      <LocationField label="Payment Location" value={form.fromLocation} onChange={(fromLocation) => setForm({ ...form, fromLocation })} />
      {form.householdSubtype === "Water Filter Replacement" ? (
        <>
          <Field label="Water filter cost">
            <input className="input" type="number" min="0" inputMode="decimal" value={form.waterFilterPrice} onChange={(event) => setForm({ ...form, waterFilterPrice: event.target.value })} />
          </Field>
          <div className="rounded-lg bg-[var(--notion-tint-lavender)] p-3 text-sm text-[var(--notion-primary-deep)]">
            Current reserve target <BDTAmount amount={reserve} /> per month
          </div>
        </>
      ) : (
        <AmountField form={form} setForm={setForm} />
      )}
      <DescriptionField form={form} setForm={setForm} placeholder="Water filter, repair, appliance service" />
    </div>
  );
}
