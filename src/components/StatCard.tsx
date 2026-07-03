export default function StatCard({
  label,
  value,
  sub,
  color = "emerald",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "blue" | "amber" | "violet" | "rose";
}) {
  const colors = {
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    violet: "from-violet-500 to-violet-600",
    rose: "from-rose-500 to-rose-600",
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className={`h-1 bg-gradient-to-r ${colors[color]}`} />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}
