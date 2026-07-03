"use client";

interface Month {
  id: string;
  year: number;
  month: number;
  label: string;
  isCurrent?: boolean;
}

export default function MonthSelector({
  months,
  selectedId,
  onChange,
  className = "",
}: {
  months: Month[];
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <select
      value={selectedId}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${className}`}
    >
      {months.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}{m.isCurrent ? " (Current)" : ""}
        </option>
      ))}
    </select>
  );
}
