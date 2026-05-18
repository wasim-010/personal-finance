"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { UniversalInputForm } from "@/components/forms/UniversalInputForm";

export default function AddPage() {
  return (
    <>
      <PageHeader title="Add Money Entry" subtitle="One form for money, bike ODO, fuel, oil, parts, and household maintenance" />
      <UniversalInputForm />
    </>
  );
}
