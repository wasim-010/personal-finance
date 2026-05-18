import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, DescriptionField, FundField } from "@/components/forms/entry-types/shared";

export function FundDepositEntry({ form, setForm }: EntrySubFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FundField label="Fund Name" value={form.fundKey} onChange={(fundKey) => setForm({ ...form, fundKey })} />
      <AmountField form={form} setForm={setForm} label="Protected Amount" />
      <DescriptionField form={form} setForm={setForm} placeholder="Protect money for future use" />
    </div>
  );
}
