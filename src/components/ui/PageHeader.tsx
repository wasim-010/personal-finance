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
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[var(--notion-primary-deep)]">{subtitle}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[var(--notion-ink)] sm:text-4xl">{title}</h1>
      </div>
      {action}
    </header>
  );
}
