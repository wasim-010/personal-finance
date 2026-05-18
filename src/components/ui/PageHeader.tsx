export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-col gap-3 border-b border-[var(--notion-hairline)] pb-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-5">
      <div>
        <p className="text-xs font-semibold text-[var(--notion-primary-deep)] sm:text-sm">{subtitle}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[var(--notion-ink)] sm:text-[2.35rem]">{title}</h1>
      </div>
      {action}
    </header>
  );
}
