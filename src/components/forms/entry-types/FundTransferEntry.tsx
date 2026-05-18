import type { EntrySubFormProps } from "@/components/forms/AddEntryForm";
import { AmountField, DescriptionField, FundField } from "@/components/forms/entry-types/shared";

export function FundTransferEntry({ form, setForm }: EntrySubFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FundField label="From Fund" value={form.fundKey} onChange={(fundKey) => setForm({ ...form, fundKey })} />
      <FundField label="To Fund" value={form.toFundKey} onChange={(toFundKey) => setForm({ ...form, toFundKey })} />
      <AmountField form={form} setForm={setForm} />
      <DescriptionField form={form} setForm={setForm} placeholder="Move protected money between funds" />
    </div>
  );
}
