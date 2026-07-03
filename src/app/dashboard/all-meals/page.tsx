"use client";

import { useEffect, useState } from "react";
import PageContainer, { PageHeader, MobileScrollTable } from "@/components/PageContainer";
import { useMonth } from "@/components/MonthProvider";
import { getMealSelectOptions, formatMeal } from "@/lib/format";
import { getMemberColor } from "@/lib/member-colors";

interface Member {
  id: string;
  name: string;
}

interface DayRow {
  day: number;
  date: string;
  weekday: string;
  meals: Record<string, { breakfast: number; lunch: number; dinner: number }>;
}

export default function AllMealsPage() {
  const { months, selectedMonthId, selectedMonth, loading } = useMonth();
  const [members, setMembers] = useState<Member[]>([]);
  const [calendar, setCalendar] = useState<DayRow[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.user?.role === "admin"));
  }, []);

  useEffect(() => {
    if (!selectedMonthId) return;
    fetch(`/api/months/${selectedMonthId}`)
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members);
        setCalendar(d.calendar);
      });
  }, [selectedMonthId]);

  async function updateMeal(
    date: string,
    userId: string,
    field: "breakfast" | "lunch" | "dinner",
    value: number,
    current: { breakfast: number; lunch: number; dinner: number }
  ) {
    const key = `${date}-${userId}`;
    setSaving(key);
    const payload = { ...current, [field]: value };

    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthId: selectedMonthId,
        userId,
        date,
        field,
        value,
      }),
    });

    setCalendar((prev) =>
      prev.map((day) =>
        day.date === date
          ? {
              ...day,
              meals: {
                ...day.meals,
                [userId]: payload,
              },
            }
          : day
      )
    );
    setSaving(null);
  }

  const totals: Record<string, number> = {};
  for (const m of members) totals[m.id] = 0;
  for (const day of calendar) {
    for (const m of members) {
      const meal = day.meals[m.id];
      if (meal) {
        totals[m.id] += meal.breakfast + meal.lunch + meal.dinner;
      }
    }
  }

  if (loading || months.length === 0) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="All Meals"
        subtitle={`${isAdmin ? "Edit anyone's meals — admin" : "View everyone's meals (read-only)"} — ${selectedMonth?.label}`}
      />

      {isAdmin && (
        <div className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-800 ring-1 ring-violet-200">
          <strong>Admin:</strong> Tap any meal value to update.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {members.map((m, i) => {
          const c = getMemberColor(m.name, i);
          return (
            <span
              key={m.id}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${c.badge}`}
            >
              {m.name}
            </span>
          );
        })}
      </div>

      {/* Mobile: day cards with all members */}
      <div className="mt-4 space-y-3 md:hidden">
        {calendar.map((day) => (
          <div
            key={day.date}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <p className="font-bold text-slate-900">
              {day.day}{" "}
              <span className="font-normal text-slate-400">{day.weekday}</span>
            </p>
            <div className="mt-3 space-y-3">
              {members.map((m, i) => {
                const c = getMemberColor(m.name, i);
                const meal = day.meals[m.id] ?? {
                  breakfast: 0,
                  lunch: 0,
                  dinner: 0,
                };
                const savingKey = `${day.date}-${m.id}`;
                const isSaving = saving === savingKey;

                return (
                  <div
                    key={m.id}
                    className={`rounded-xl p-3 ${c.cell} ${isSaving ? "opacity-60" : ""}`}
                  >
                    <p className={`mb-2 text-xs font-bold ${c.cellText}`}>{m.name}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["breakfast", "lunch", "dinner"] as const).map((field) => (
                        <div key={field}>
                          <p className="mb-1 text-center text-[10px] font-semibold uppercase text-slate-400">
                            {field === "breakfast" ? "B" : field === "lunch" ? "L" : "D"}
                          </p>
                          {isAdmin ? (
                            <select
                              value={meal[field]}
                              onChange={(e) =>
                                updateMeal(
                                  day.date,
                                  m.id,
                                  field,
                                  Number(e.target.value),
                                  meal
                                )
                              }
                              className="w-full min-h-[44px] rounded-lg border border-slate-200/80 bg-white/90 text-center text-sm font-medium focus:border-violet-500 focus:outline-none"
                            >
                              {getMealSelectOptions(meal[field]).map((v) => (
                                <option key={v} value={v}>
                                  {formatMeal(v)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="min-h-[44px] rounded-lg bg-white/60 py-3 text-center font-semibold">
                              {formatMeal(meal[field])}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-2xl bg-slate-800 p-4 text-white">
          <p className="font-bold">TOTAL</p>
          <div className="mt-2 space-y-1">
            {members.map((m, i) => {
              const c = getMemberColor(m.name, i);
              return (
                <div key={m.id} className="flex justify-between text-sm">
                  <span className={c.totalText}>{m.name}</span>
                  <span className="font-bold">{formatMeal(totals[m.id])}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
        <MobileScrollTable>
          <table className="w-full min-w-[480px] text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-slate-800 px-3 py-2 text-left text-white">
                  Date
                </th>
                {members.map((m, i) => {
                  const c = getMemberColor(m.name, i);
                  return (
                    <th
                      key={m.id}
                      colSpan={3}
                      className={`border-l border-white/20 px-2 py-2 text-center text-white ${c.header}`}
                    >
                      {m.name}
                    </th>
                  );
                })}
              </tr>
              <tr>
                <th className="sticky left-0 bg-slate-700 px-3 py-1" />
                {members.flatMap((m, i) => {
                  const c = getMemberColor(m.name, i);
                  return [
                    <th
                      key={`${m.id}-b`}
                      className={`px-1 py-1 text-center font-normal text-white ${c.headerSub}`}
                    >
                      B
                    </th>,
                    <th
                      key={`${m.id}-l`}
                      className={`px-1 py-1 text-center font-normal text-white ${c.headerSub}`}
                    >
                      L
                    </th>,
                    <th
                      key={`${m.id}-d`}
                      className={`px-1 py-1 text-center font-normal text-white ${c.headerSub}`}
                    >
                      D
                    </th>,
                  ];
                })}
              </tr>
            </thead>
            <tbody>
              {calendar.map((day) => (
                <tr key={day.date} className="border-b border-slate-100">
                  <td className="sticky left-0 bg-white px-3 py-1.5 font-medium text-slate-700">
                    {day.day}{" "}
                    <span className="text-slate-400">{day.weekday}</span>
                  </td>
                  {members.flatMap((m, i) => {
                    const c = getMemberColor(m.name, i);
                    const meal = day.meals[m.id] ?? {
                      breakfast: 0,
                      lunch: 0,
                      dinner: 0,
                    };
                    const cellClass = `px-1 py-1.5 text-center font-medium ${c.cell} ${c.cellText}`;
                    const savingKey = `${day.date}-${m.id}`;
                    const isSaving = saving === savingKey;

                    return (["breakfast", "lunch", "dinner"] as const).map(
                      (field) => (
                        <td
                          key={`${day.date}-${m.id}-${field}`}
                          className={`${cellClass} ${isSaving ? "opacity-60" : ""}`}
                        >
                          {isAdmin ? (
                            <select
                              value={meal[field]}
                              onChange={(e) =>
                                updateMeal(
                                  day.date,
                                  m.id,
                                  field,
                                  Number(e.target.value),
                                  meal
                                )
                              }
                              className="w-12 rounded border border-slate-200/80 bg-white/90 px-0.5 py-0.5 text-center text-xs focus:border-violet-500 focus:outline-none"
                            >
                              {getMealSelectOptions(meal[field]).map((v) => (
                                <option key={v} value={v}>
                                  {formatMeal(v)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            formatMeal(meal[field])
                          )}
                        </td>
                      )
                    );
                  })}
                </tr>
              ))}
              <tr className="font-bold">
                <td className="sticky left-0 bg-slate-800 px-3 py-2 text-white">
                  TOTAL
                </td>
                {members.map((m, i) => {
                  const c = getMemberColor(m.name, i);
                  return (
                    <td
                      key={`total-${m.id}`}
                      colSpan={3}
                      className={`px-2 py-2 text-center ${c.total} ${c.totalText}`}
                    >
                      {formatMeal(totals[m.id])}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </MobileScrollTable>
      </div>
    </PageContainer>
  );
}
