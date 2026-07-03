"use client";

import { useEffect, useState } from "react";
import PageContainer, { PageHeader } from "@/components/PageContainer";
import { useMonth } from "@/components/MonthProvider";
import StatCard from "@/components/StatCard";
import { formatCurrency, formatMealRate } from "@/lib/format";
import { getMemberColor } from "@/lib/member-colors";

interface MonthData {
  summary: {
    totalBazar: number;
    totalMeals: number;
    mealRate: number;
    totalRent: number;
    rentShare: number;
    users: {
      userId: string;
      name: string;
      totalMeals: number;
      deposit: number;
      consume: number;
      foodDue: number;
      finalPayable: number;
    }[];
  };
  members: { id: string; name: string }[];
}

export default function DashboardPage() {
  const { months, selectedMonthId, selectedMonth, loading } = useMonth();
  const [data, setData] = useState<MonthData | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!selectedMonthId) return;
    setFetching(true);
    fetch(`/api/months/${selectedMonthId}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setFetching(false));
  }, [selectedMonthId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (months.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-4xl">📅</p>
          <p className="mt-4 text-lg font-medium text-slate-700">
            No month created yet
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Ask admin to create a month from Admin → Months
          </p>
        </div>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        subtitle={`Monthly summary for ${selectedMonth?.label}`}
      />

      {fetching ? (
        <p className="mt-8 text-slate-500">Loading data...</p>
      ) : summary ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Total Bazar"
              value={formatCurrency(summary.totalBazar)}
              sub="All market expenses"
              color="emerald"
            />
            <StatCard
              label="Total Meals"
              value={summary.totalMeals.toString()}
              sub="Breakfast + Lunch + Dinner"
              color="blue"
            />
            <StatCard
              label="Meal Rate"
              value={formatMealRate(summary.mealRate)}
              sub="Bazar ÷ Total Meals"
              color="amber"
            />
            <StatCard
              label="Total Rent & Bills"
              value={formatCurrency(summary.totalRent)}
              sub={`${formatCurrency(summary.rentShare)} per person`}
              color="violet"
            />
          </div>

          {/* Mobile member cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {summary.users.map((u, i) => {
              const c = getMemberColor(u.name, i);
              return (
                <div
                  key={u.userId}
                  className={`rounded-2xl p-4 ring-1 ring-slate-200 ${c.cell}`}
                >
                  <p className={`font-bold ${c.cellText}`}>{u.name}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <span>Meals: <strong>{u.totalMeals}</strong></span>
                    <span>Deposit: <strong>{formatCurrency(u.deposit)}</strong></span>
                    <span>Due: <strong className={u.foodDue >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(u.foodDue)}</strong></span>
                    <span>Final: <strong>{formatCurrency(u.finalPayable)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Member Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-4 py-3">Meals</th>
                    <th className="px-4 py-3">Deposit</th>
                    <th className="px-4 py-3">Consume</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Final</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.users.map((u, i) => {
                    const c = getMemberColor(u.name, i);
                    return (
                      <tr key={u.userId} className={`border-b border-slate-100 ${c.cell}`}>
                        <td className={`px-6 py-3 font-semibold ${c.cellText}`}>
                          <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${c.header}`} />
                          {u.name}
                        </td>
                        <td className={`px-4 py-3 ${c.cellText}`}>{u.totalMeals}</td>
                        <td className={`px-4 py-3 ${c.cellText}`}>{formatCurrency(u.deposit)}</td>
                        <td className={`px-4 py-3 ${c.cellText}`}>{formatCurrency(u.consume)}</td>
                        <td
                          className={`px-4 py-3 font-medium ${
                            u.foodDue >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(u.foodDue)}
                        </td>
                        <td className={`px-4 py-3 font-bold ${c.cellText}`}>
                          {formatCurrency(u.finalPayable)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
