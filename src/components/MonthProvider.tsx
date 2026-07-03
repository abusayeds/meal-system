"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Month {
  id: string;
  year: number;
  month: number;
  label: string;
  isCurrent?: boolean;
  editLocked?: boolean;
  editLockSource?: "none" | "manual" | "auto";
}

interface MonthContextType {
  months: Month[];
  selectedMonthId: string;
  setSelectedMonthId: (id: string) => void;
  selectedMonth: Month | undefined;
  loading: boolean;
  refreshMonths: () => Promise<void>;
}

const MonthContext = createContext<MonthContextType | null>(null);
const STORAGE_KEY = "meal-system-selected-month";

export function MonthProvider({ children }: { children: ReactNode }) {
  const [months, setMonths] = useState<Month[]>([]);
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [loading, setLoading] = useState(true);

  async function refreshMonths() {
    const res = await fetch("/api/months");
    if (res.ok) {
      const data = await res.json();
      setMonths(data.months);

      setSelectedMonthId((prev) => {
        if (prev && data.months.some((m: Month) => m.id === prev)) return prev;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && data.months.some((m: Month) => m.id === stored)) return stored;
        return data.currentMonthId ?? data.months[0]?.id ?? "";
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    refreshMonths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedMonthId) {
      localStorage.setItem(STORAGE_KEY, selectedMonthId);
    }
  }, [selectedMonthId]);

  const selectedMonth = months.find((m) => m.id === selectedMonthId);

  return (
    <MonthContext.Provider
      value={{
        months,
        selectedMonthId,
        setSelectedMonthId,
        selectedMonth,
        loading,
        refreshMonths,
      }}
    >
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within MonthProvider");
  return ctx;
}
