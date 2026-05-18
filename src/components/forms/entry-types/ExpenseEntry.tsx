import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, ClassificationField, DescriptionField, ExpenseCategoryField, LocationField } from "@/components/forms/entry-types/shared";

export function ExpenseEntry({ form, setForm }: EntrySubFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ExpenseCategoryField form={form} setForm={setForm} />
      <AmountField form={form} setForm={setForm} />
      <LocationField label="From Location" value={form.fromLocation} onChange={(fromLocation) => setForm({ ...form, fromLocation })} />
      <ClassificationField form={form} setForm={setForm} />
      <DescriptionField form={form} setForm={setForm} placeholder="Rice, medicine, internet bill" />
    </div>
  );
}
