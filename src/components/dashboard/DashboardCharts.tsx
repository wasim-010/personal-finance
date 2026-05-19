"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from "recharts";
import { formatBDT } from "@/lib/format";

const COLORS = ["#6c47ff", "#0b1020", "#d98324", "#d94a38", "#0b66d8"];

export function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <EmptyChart message="No expenses yet" />;

  return (
    <div className="rounded-xl border border-[var(--notion-hairline)] bg-white p-4 shadow-[rgba(15,15,15,0.04)_0px_1px_2px]">
      <h2 className="mb-3 text-base font-semibold">Top expense categories</h2>
      <div className="h-52 min-h-52 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 5)} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={118} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatBDT(Number(value))} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#6c47ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function NeedWantWasteChart({
  need,
  want,
  waste,
}: {
  need: number;
  want: number;
  waste: number;
}) {
  const data = [
    { name: "Need", value: need },
    { name: "Want", value: want },
    { name: "Waste", value: waste },
  ].filter((item) => item.value > 0);

  if (!data.length) return <EmptyChart message="Need/Want/Waste will appear after expenses" />;

  return (
    <div className="rounded-xl border border-[var(--notion-hairline)] bg-white p-4 shadow-[rgba(15,15,15,0.04)_0px_1px_2px]">
      <h2 className="mb-3 text-base font-semibold">Need vs Want vs Waste</h2>
      <div className="h-52 min-h-52 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={3}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatBDT(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-[var(--notion-hairline-strong)] bg-white p-4 text-center text-sm text-[var(--notion-slate)]">
      {message}
    </div>
  );
}
