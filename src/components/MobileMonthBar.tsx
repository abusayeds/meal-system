"use client";

import { CalendarDays, ChevronDown } from "lucide-react";

export default function MobileMonthBar({
  label,
  isCurrent,
  menuOpen,
  onMenuClick,
}: {
  label?: string;
  isCurrent?: boolean;
  menuOpen: boolean;
  onMenuClick: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200/80 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex w-full items-center gap-3 px-4 py-3 transition-colors active:bg-slate-50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CalendarDays className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-bold text-slate-900">
            {label ?? "Loading..."}
          </p>
          {isCurrent && (
            <p className="text-[10px] font-semibold text-emerald-600">Current month</p>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
            menuOpen ? "rotate-180 text-emerald-500" : ""
          }`}
        />
      </button>
    </div>
  );
}
