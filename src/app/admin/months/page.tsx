"use client";

import { useState } from "react";
import PageContainer, { PageHeader } from "@/components/PageContainer";
import { useMonth } from "@/components/MonthProvider";

export default function AdminMonthsPage() {
  const { months, refreshMonths, loading } = useMonth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    const res = await fetch("/api/months", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      await refreshMonths();
    }
    setCreating(false);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Manage Months"
        subtitle="Current month is created automatically. Manual create is optional."
      />

      <form
        onSubmit={handleCreate}
        className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:max-w-md sm:p-6"
      >
        <h2 className="font-semibold">Create New Month</h2>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleDateString("en", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 min-h-[44px] w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Month"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="font-semibold text-slate-900">Existing Months</h2>
        {loading ? (
          <p className="mt-2 text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="mt-3 space-y-2">
            {months.map((m) => (
              <div
                key={m.id}
                className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200"
              >
                {m.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
