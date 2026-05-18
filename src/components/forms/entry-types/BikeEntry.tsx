import type { BikeEntrySubtype } from "@/types/finance";
import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, DescriptionField, LocationField } from "@/components/forms/entry-types/shared";
import { Field } from "@/components/forms/AddEntryForm";
import { useAppState } from "@/lib/state/useAppState";
import { calculateFuelCostPerKm } from "@/lib/calculations/bike";
import { BDTAmount } from "@/components/ui/BDTAmount";

const bikeSubtypes: BikeEntrySubtype[] = [
  "ODO Update",
  "Fuel Fill-Up",
  "Engine Oil Change",
  "Parking",
  "Maintenance / Parts",
  "Bike KM Cost",
];

export function BikeEntry({ form, setForm, previousOdo }: EntrySubFormProps) {
  const { state } = useAppState();
  const fuelPrice = Number(form.fuelPricePerLiter || state.settings.bikeSettings.fuelPricePerLiter);
  const fuelLiters = Number(form.fuelLiters || 0);
  const estimatedDistance = fuelLiters * state.settings.bikeSettings.expectedMileageKmPerLiter;
  const fuelCostPerKm = calculateFuelCostPerKm(fuelPrice, state.settings.bikeSettings.expectedMileageKmPerLiter);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Bike entry subtype">
        <select className="input" value={form.bikeSubtype} onChange={(event) => setForm({ ...form, bikeSubtype: event.target.value as BikeEntrySubtype })}>
          {bikeSubtypes.map((subtype) => <option key={subtype}>{subtype}</option>)}
        </select>
      </Field>
      <Field label="Current ODO Reading">
        <input className="input" type="number" min="0" inputMode="numeric" value={form.currentOdo} onChange={(event) => setForm({ ...form, currentOdo: event.target.value })} />
      </Field>
      <Field label="Previous ODO Reading">
        <input className="input" type="number" min="0" inputMode="numeric" value={form.previousOdo || previousOdo || ""} onChange={(event) => setForm({ ...form, previousOdo: event.target.value })} />
      </Field>
      <Field label="KM Run">
        <input className="input bg-[var(--notion-surface)]" readOnly value={Math.max(Number(form.currentOdo || 0) - Number(form.previousOdo || previousOdo || 0), 0)} />
      </Field>

      {form.bikeSubtype !== "ODO Update" ? (
        <LocationField label="Payment Location" value={form.fromLocation} onChange={(fromLocation) => setForm({ ...form, fromLocation })} />
      ) : null}

      {form.bikeSubtype === "Fuel Fill-Up" ? (
        <>
          <Field label="Fuel quantity in liters">
            <input className="input" type="number" min="0" inputMode="decimal" value={form.fuelLiters} onChange={(event) => setForm({ ...form, fuelLiters: event.target.value })} />
          </Field>
          <Field label="Fuel price per liter">
            <input className="input" type="number" min="0" inputMode="decimal" value={form.fuelPricePerLiter} onChange={(event) => setForm({ ...form, fuelPricePerLiter: event.target.value })} />
          </Field>
          <label className="flex items-center gap-2 rounded-lg bg-[var(--notion-surface)] px-3 py-3 text-sm font-medium text-[var(--notion-slate)]">
            <input type="checkbox" checked={form.fullTank} onChange={(event) => setForm({ ...form, fullTank: event.target.checked })} />
            Full tank
          </label>
          <div className="rounded-lg bg-[var(--notion-tint-lavender)] p-3 text-sm text-[var(--notion-primary-deep)]">
            Estimated distance {Math.round(estimatedDistance)} km · fuel cost/km <BDTAmount amount={fuelCostPerKm} />
          </div>
        </>
      ) : null}

      {form.bikeSubtype === "Engine Oil Change" ? (
        <>
          <Field label="Engine oil price">
            <input className="input" type="number" min="0" inputMode="decimal" value={form.engineOilPrice} onChange={(event) => setForm({ ...form, engineOilPrice: event.target.value })} />
          </Field>
          <Field label="Oil filter price">
            <input className="input" type="number" min="0" inputMode="decimal" value={form.oilFilterPrice} onChange={(event) => setForm({ ...form, oilFilterPrice: event.target.value })} />
          </Field>
          <Field label="Service charge">
            <input className="input" type="number" min="0" inputMode="decimal" value={form.serviceCharge} onChange={(event) => setForm({ ...form, serviceCharge: event.target.value })} />
          </Field>
          <Field label="Next oil change after KM">
            <input className="input" type="number" min="0" inputMode="numeric" value={form.nextOilChangeAfterKm} onChange={(event) => setForm({ ...form, nextOilChangeAfterKm: event.target.value })} />
          </Field>
        </>
      ) : null}

      {form.bikeSubtype === "Maintenance / Parts" ? (
        <>
          <Field label="Part / service name">
            <select className="input" value={form.partName} onChange={(event) => setForm({ ...form, partName: event.target.value })}>
              <option value="">Choose part or service</option>
              {state.settings.bikeParts.map((part) => <option key={part.id} value={part.name}>{part.name}</option>)}
            </select>
          </Field>
          <AmountField form={form} setForm={setForm} />
          <label className="flex items-center gap-2 rounded-lg bg-[var(--notion-surface)] px-3 py-3 text-sm font-medium text-[var(--notion-slate)]">
            <input type="checkbox" checked={form.planned} onChange={(event) => setForm({ ...form, planned: event.target.checked })} />
            Planned maintenance
          </label>
        </>
      ) : null}

      {form.bikeSubtype === "Parking" || form.bikeSubtype === "Bike KM Cost" ? (
        <AmountField form={form} setForm={setForm} label={form.bikeSubtype === "Parking" ? "Parking Amount" : "Bike Cost Amount"} />
      ) : null}

      <DescriptionField form={form} setForm={setForm} placeholder="Monthly ODO, fuel, oil, parking, service" />
    </div>
  );
}
