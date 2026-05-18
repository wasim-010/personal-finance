import { AlertTriangle } from "lucide-react";

export function Insights({ messages }: { messages: string[] }) {
  return (
    <section className="rounded-xl bg-[var(--notion-tint-yellow-bold)] p-4 text-[var(--notion-charcoal)] shadow-[rgba(15,15,15,0.08)_0px_4px_12px]">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle size={19} />
        <h2 className="font-semibold">Money coach</h2>
      </div>
      <div className="space-y-2">
        {messages.map((message) => (
          <p key={message} className="rounded-lg bg-white/80 px-3 py-2 text-sm leading-6 text-[var(--notion-charcoal)]">
            {message}
          </p>
        ))}
      </div>
    </section>
  );
}
