"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import PageContainer, { PageHeader, MobileScrollTable } from "@/components/PageContainer";
import { useMonth } from "@/components/MonthProvider";
import { getMealSelectOptions, formatMeal } from "@/lib/format";
import { dateCardRingClass, dateRowRingClass, isDateActive } from "@/lib/date-highlight";
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
  const [currentUserId, setCurrentUserId] = useState("");
  const [mobileMemberId, setMobileMemberId] = useState("");
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setIsAdmin(d.user?.role === "admin");
        setCurrentUserId(d.user?.id ?? "");
      });
  }, []);

  useEffect(() => {
    if (!currentUserId || members.length === 0) return;
    const exists = members.some((m) => m.id === currentUserId);
    setMobileMemberId(exists ? currentUserId : members[0].id);
  }, [currentUserId, members, selectedMonthId]);

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

  const mobileMember = members.find((m) => m.id === mobileMemberId);
  const mobileMemberIdx = members.findIndex((m) => m.id === mobileMemberId);
  const mobileTotal = mobileMemberId ? (totals[mobileMemberId] ?? 0) : 0;
  const mobileColor =
    mobileMember && mobileMemberIdx >= 0
      ? getMemberColor(mobileMember.name, mobileMemberIdx)
      : null;

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

      <div className="mt-4 hidden flex-wrap gap-2 md:flex">
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

      {/* Mobile: one member at a time */}
      <div className="mt-4 md:hidden">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Select member
        </label>
        <select
          value={mobileMemberId}
          onChange={(e) => setMobileMemberId(e.target.value)}
          className="input-field w-full"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {mobileMember && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-4 text-white shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-100">
                {mobileMember.name} — Total Meals
              </p>
              <p className="text-xl font-bold">{formatMeal(mobileTotal)}</p>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
        {calendar.map((day) => {
          if (!mobileMemberId) return null;
          const meal = day.meals[mobileMemberId] ?? {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
          };
          const dayTotal = meal.breakfast + meal.lunch + meal.dinner;
          const savingKey = `${day.date}-${mobileMemberId}`;
          const isSaving = saving === savingKey;

          const isActive = isDateActive(day.date, activeDate);

          return (
            <div
              key={day.date}
              onClick={() => setActiveDate(day.date)}
              className={`rounded-2xl bg-white p-4 shadow-sm transition-all duration-200 ${dateCardRingClass(isActive)} ${isSaving ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900">
                  {day.day}{" "}
                  <span className="font-normal text-slate-400">{day.weekday}</span>
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    mobileColor ? mobileColor.badge : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {formatMeal(dayTotal)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["breakfast", "lunch", "dinner"] as const).map((field) => (
                  <div key={field}>
                    <p className="mb-1 text-center text-[10px] font-semibold uppercase text-slate-400">
                      {field === "breakfast" ? "B" : field === "lunch" ? "L" : "D"}
                    </p>
                    {isAdmin ? (
                      <select
                        value={meal[field]}
                        onFocus={() => setActiveDate(day.date)}
                        onChange={(e) =>
                          updateMeal(
                            day.date,
                            mobileMemberId,
                            field,
                            Number(e.target.value),
                            meal
                          )
                        }
                        className="w-full min-h-[44px] rounded-lg border border-slate-200/80 bg-slate-50 text-center text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        {getMealSelectOptions(meal[field]).map((v) => (
                          <option key={v} value={v}>
                            {formatMeal(v)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="min-h-[44px] rounded-lg bg-slate-50 py-3 text-center font-semibold text-slate-700">
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
              {calendar.map((day) => {
                const isActive = isDateActive(day.date, activeDate);

                return (
                <tr
                  key={day.date}
                  onClick={() => setActiveDate(day.date)}
                  className={`cursor-pointer border-b border-slate-100 transition-all duration-200 ${dateRowRingClass(isActive)}`}
                >
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
                              onFocus={() => setActiveDate(day.date)}
                              onChange={(e) =>
                                updateMeal(
                                  day.date,
                                  m.id,
                                  field,
                                  Number(e.target.value),
                                  meal
                                )
                              }
                              className="w-12 rounded border border-slate-200/80 bg-white/90 px-0.5 py-0.5 text-center text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                );
              })}
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
