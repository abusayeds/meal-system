"use client";

import { useEffect, useState } from "react";
import PageContainer, { PageHeader, MobileScrollTable } from "@/components/PageContainer";
import RentBreakdownCard from "@/components/RentBreakdownCard";
import { useMonth } from "@/components/MonthProvider";
import { formatCurrency, formatMealRate } from "@/lib/format";
import { getMemberColor } from "@/lib/member-colors";

interface Summary {
  totalBazar: number;
  totalMeals: number;
  mealRate: number;
  totalRent: number;
  rentShare: number;
  memberCount: number;
  users: {
    userId: string;
    name: string;
    totalMeals: number;
    deposit: number;
    consume: number;
    foodDue: number;
    rentShare: number;
    finalPayable: number;
  }[];
}

interface RentField {
  name: string;
  amount: number;
}

export default function SettlementPage() {
  const { months, selectedMonthId, selectedMonth, loading } = useMonth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rentFields, setRentFields] = useState<RentField[]>([]);

  useEffect(() => {
    if (!selectedMonthId) return;
    fetch(`/api/months/${selectedMonthId}`)
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary);
        setRentFields(d.rentFields);
      });
  }, [selectedMonthId]);

  if (loading || months.length === 0) {
    return <div className="p-8"><p className="text-slate-500">Loading...</p></div>;
  }

  const totals = summary?.users.reduce(
    (acc, u) => ({
      totalMeals: acc.totalMeals + u.totalMeals,
      deposit: acc.deposit + u.deposit,
      consume: acc.consume + u.consume,
      foodDue: acc.foodDue + u.foodDue,
      rentShare: acc.rentShare + u.rentShare,
      finalPayable: acc.finalPayable + u.finalPayable,
    }),
    {
      totalMeals: 0,
      deposit: 0,
      consume: 0,
      foodDue: 0,
      rentShare: 0,
      finalPayable: 0,
    }
  );

  return (
    <PageContainer>
      <PageHeader
        title="Settlement"
        subtitle={`Final monthly bill — ${selectedMonth?.label}`}
      />

      {summary && (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <h2 className="font-semibold text-slate-900">Meal Rate Calculation</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Bazar Expense</span>
                  <span className="font-medium">{formatCurrency(summary.totalBazar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Meals</span>
                  <span className="font-medium">{summary.totalMeals}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="font-semibold text-emerald-700">Meal Rate</span>
                  <span className="font-bold text-emerald-700">
                    {formatMealRate(summary.mealRate)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Formula: Total Bazar ÷ Total Meals
              </p>
            </div>

            <RentBreakdownCard
              rentFields={rentFields}
              totalRent={summary.totalRent}
              rentShare={summary.rentShare}
              memberCount={summary.memberCount}
            />
          </div>

          {/* Mobile settlement cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {summary.users.map((u, i) => {
              const c = getMemberColor(u.name, i);
              return (
                <div
                  key={u.userId}
                  className={`rounded-2xl p-4 shadow-sm ring-1 ring-slate-200 ${c.cell}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${c.header}`} />
                    <p className={`text-base font-bold ${c.cellText}`}>{u.name}</p>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                      <dt className="text-slate-500">Meals</dt>
                      <dd className="font-semibold">{u.totalMeals}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Deposit</dt>
                      <dd className="font-semibold">{formatCurrency(u.deposit)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Consume</dt>
                      <dd className="font-semibold">{formatCurrency(u.consume)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Due</dt>
                      <dd
                        className={`font-semibold ${
                          u.foodDue >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(u.foodDue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Rent</dt>
                      <dd className="font-semibold">{formatCurrency(u.rentShare)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Final</dt>
                      <dd className={`text-lg font-bold ${c.cellText}`}>
                        {formatCurrency(u.finalPayable)}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
            {totals && (
              <div className="rounded-2xl bg-slate-800 p-4 text-white">
                <p className="font-bold">TOTAL</p>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-slate-300">Meals</dt>
                    <dd className="font-semibold">{totals.totalMeals}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-300">Final</dt>
                    <dd className="font-bold">{formatCurrency(totals.finalPayable)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          <div className="mt-8 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
              <h2 className="font-semibold text-slate-900">Final Settlement Table</h2>
              <p className="mt-1 text-xs text-slate-500">
                Due = Deposit − Consume | Final = Rent Share − Due
              </p>
            </div>
            <MobileScrollTable>
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-4 py-3">Total Meals</th>
                    <th className="px-4 py-3">Deposit</th>
                    <th className="px-4 py-3">Consume</th>
                    <th className="px-4 py-3">Due (Food)</th>
                    <th className="px-4 py-3">Rent Share</th>
                    <th className="px-4 py-3">Final Payable</th>
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
                        <td className={`px-4 py-3 ${c.cellText}`}>{formatCurrency(u.rentShare)}</td>
                        <td className={`px-4 py-3 font-bold ${c.cellText}`}>
                          {formatCurrency(u.finalPayable)}
                        </td>
                      </tr>
                    );
                  })}
                  {totals && (
                    <tr className="bg-slate-800 font-bold text-white">
                      <td className="px-6 py-3">TOTAL</td>
                      <td className="px-4 py-3">{totals.totalMeals}</td>
                      <td className="px-4 py-3">{formatCurrency(totals.deposit)}</td>
                      <td className="px-4 py-3">{formatCurrency(totals.consume)}</td>
                      <td
                        className={`px-4 py-3 ${
                          totals.foodDue >= 0 ? "text-emerald-300" : "text-red-300"
                        }`}
                      >
                        {formatCurrency(totals.foodDue)}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(totals.rentShare)}</td>
                      <td className="px-4 py-3">{formatCurrency(totals.finalPayable)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </MobileScrollTable>
          </div>
        </>
      )}
    </PageContainer>
  );
}
