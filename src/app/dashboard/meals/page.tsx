"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import PageContainer, { PageHeader } from "@/components/PageContainer";
import { useMonth } from "@/components/MonthProvider";
import { getMealSelectOptions, formatMeal } from "@/lib/format";
import { getTodayDateKey } from "@/lib/utils";

interface DayRow {
  day: number;
  date: string;
  weekday: string;
  meals: Record<
    string,
    { breakfast: number; lunch: number; dinner: number }
  >;
}

export default function MyMealsPage() {
  const { months, selectedMonthId, selectedMonth, loading } = useMonth();
  const [calendar, setCalendar] = useState<DayRow[]>([]);
  const [userId, setUserId] = useState("");
  const [userCanEdit, setUserCanEdit] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [daySearch, setDaySearch] = useState("");
  const [highlightDate, setHighlightDate] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const monthLocked = selectedMonth?.editLocked ?? false;
  const canEditMeals = userCanEdit && !monthLocked;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUserId(d.user.id);
        setUserCanEdit(d.user.canEdit !== false);
      });
  }, []);

  useEffect(() => {
    if (!selectedMonthId) return;
    fetch(`/api/months/${selectedMonthId}`)
      .then((r) => r.json())
      .then((d) => setCalendar(d.calendar));
  }, [selectedMonthId]);

  async function updateMeal(
    date: string,
    field: "breakfast" | "lunch" | "dinner",
    value: number,
    current: { breakfast: number; lunch: number; dinner: number }
  ) {
    setSaving(date);
    const payload = { ...current, [field]: value };

    await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthId: selectedMonthId,
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

  function findDayBySearch(query: string): DayRow | undefined {
    const q = query.trim();
    if (!q || !/^\d+$/.test(q)) return undefined;

    const num = parseInt(q, 10);
    const exact = calendar.find((d) => d.day === num);
    if (exact) return exact;

    return calendar.find((d) => String(d.day).startsWith(q));
  }

  function scrollToDay(query: string) {
    const target = findDayBySearch(query);
    if (!target) return;

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const el = document.getElementById(
      isDesktop ? `meal-day-desktop-${target.date}` : `meal-day-mobile-${target.date}`
    );
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightDate(target.date);

    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightDate(null), 2500);
  }

  useEffect(() => {
    if (!daySearch.trim()) {
      setHighlightDate(null);
      return;
    }

    const timer = setTimeout(() => scrollToDay(daySearch), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daySearch, calendar]);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  const todayKey = getTodayDateKey();
  const todayInMonth = calendar.find((d) => d.date === todayKey);
  const todayMeals = todayInMonth?.meals[userId];
  const todayTotal = todayMeals
    ? todayMeals.breakfast + todayMeals.lunch + todayMeals.dinner
    : 0;
  const todayAdded = todayMeals !== undefined && todayTotal > 0;

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
        title="My Meals"
        subtitle={`${canEditMeals ? "Track your daily meals" : "View your meals (read-only)"} — ${selectedMonth?.label}`}
      />

      {!canEditMeals && (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          <strong>View only:</strong>{" "}
          {monthLocked
            ? "This month is locked by admin."
            : "Your edit permission is disabled."}{" "}
          You can check if your meals are added.
        </div>
      )}

      {todayInMonth && (
        <div
          className={`mt-4 hidden rounded-xl px-4 py-3 text-sm ring-1 md:block ${
            todayAdded
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
              : "bg-slate-50 text-slate-700 ring-slate-200"
          }`}
        >
          <strong>Today ({todayKey}):</strong>{" "}
          {todayAdded ? (
            <>
              Meals added — B: {formatMeal(todayMeals!.breakfast)}, L:{" "}
              {formatMeal(todayMeals!.lunch)}, D: {formatMeal(todayMeals!.dinner)}{" "}
              (Total: {formatMeal(todayTotal)})
            </>
          ) : (
            <>Meals not added yet — waiting for admin or your entry</>
          )}
        </div>
      )}

      {canEditMeals && (
        <div className="mt-4 hidden rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 md:block">
          <strong>Tip:</strong> Select 0, 0.5, or 1–9 per meal (Breakfast, Lunch,
          Dinner).
        </div>
      )}

      {calendar.length > 0 && (
        <div className="sticky top-0 z-20 mt-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 backdrop-blur-md md:static md:shadow-none">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Search className="h-3.5 w-3.5" />
            Jump to date — type day number (e.g. 20)
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={daySearch}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setDaySearch(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") scrollToDay(daySearch);
              }}
              placeholder="Search by Date"
              className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm font-medium text-slate-900 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            {daySearch && (
              <button
                type="button"
                onClick={() => {
                  setDaySearch("");
                  setHighlightDate(null);
                }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {daySearch && !findDayBySearch(daySearch) && (
            <p className="mt-1.5 text-xs text-amber-600">
              No date found for &quot;{daySearch}&quot; in this month
            </p>
          )}
        </div>
      )}

      {/* Mobile: card per day */}
      <div className="mt-4 space-y-3 md:hidden">
        {calendar.map((day) => {
          const meal = day.meals[userId] ?? {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
          };
          const total = meal.breakfast + meal.lunch + meal.dinner;
          const isToday = day.date === todayKey;
          const isSaving = saving === day.date;

          const isHighlighted = highlightDate === day.date;

          return (
            <div
              key={day.date}
              id={`meal-day-mobile-${day.date}`}
              className={`scroll-mt-24 rounded-2xl bg-white p-4 shadow-sm ring-1 transition-all duration-300 ${
                isHighlighted
                  ? "ring-2 ring-emerald-500 shadow-md shadow-emerald-100"
                  : isToday
                    ? "ring-emerald-300"
                    : "ring-slate-200"
              } ${isSaving ? "opacity-70" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    {day.day} {day.weekday}
                  </p>
                  {isToday && (
                    <span className="text-xs font-medium text-emerald-600">
                      Today
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                  {formatMeal(total)}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["breakfast", "lunch", "dinner"] as const).map((field) => (
                  <div key={field}>
                    <p className="mb-1 text-center text-[10px] font-semibold uppercase text-slate-400">
                      {field === "breakfast" ? "B" : field === "lunch" ? "L" : "D"}
                    </p>
                    {canEditMeals ? (
                      <select
                        value={meal[field]}
                        onChange={(e) =>
                          updateMeal(
                            day.date,
                            field,
                            Number(e.target.value),
                            meal
                          )
                        }
                        className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-medium focus:border-emerald-500 focus:outline-none"
                      >
                        {getMealSelectOptions(meal[field]).map((v) => (
                          <option key={v} value={v}>
                            {formatMeal(v)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="min-h-[44px] rounded-xl bg-slate-50 py-3 text-center font-semibold text-slate-700">
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

      {/* Desktop: table */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-left text-xs uppercase text-white">
                <th className="px-4 py-3">Date</th>
                <th className="px-3 py-3">Day</th>
                <th className="px-3 py-3 text-center">Breakfast</th>
                <th className="px-3 py-3 text-center">Lunch</th>
                <th className="px-3 py-3 text-center">Dinner</th>
                <th className="px-4 py-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calendar.map((day) => {
                const meal = day.meals[userId] ?? {
                  breakfast: 0,
                  lunch: 0,
                  dinner: 0,
                };
                const total = meal.breakfast + meal.lunch + meal.dinner;
                const isSaving = saving === day.date;
                const isToday = day.date === todayKey;

                const isHighlighted = highlightDate === day.date;

                return (
                  <tr
                    key={day.date}
                    id={`meal-day-desktop-${day.date}`}
                    className={`scroll-mt-24 transition-colors duration-300 ${
                      isHighlighted
                        ? "bg-emerald-100 ring-2 ring-inset ring-emerald-400"
                        : isSaving
                          ? "bg-emerald-50"
                          : isToday
                            ? "bg-emerald-50/50"
                            : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-slate-700">
                      {day.day}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{day.weekday}</td>
                    {(["breakfast", "lunch", "dinner"] as const).map((field) => (
                      <td key={field} className="px-2 py-1 text-center">
                        {canEditMeals ? (
                          <select
                            value={meal[field]}
                            onChange={(e) =>
                              updateMeal(
                                day.date,
                                field,
                                Number(e.target.value),
                                meal
                              )
                            }
                            className="w-16 rounded-lg border border-slate-200 px-1 py-1.5 text-center text-sm focus:border-emerald-500 focus:outline-none"
                          >
                            {getMealSelectOptions(meal[field]).map((v) => (
                              <option key={v} value={v}>
                                {formatMeal(v)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-medium text-slate-700">
                            {formatMeal(meal[field])}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center font-semibold text-emerald-700">
                      {formatMeal(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
