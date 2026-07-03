"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  UtensilsCrossed,
  ShoppingCart,
  UserCog,
  Home,
  CalendarDays,
  LogOut,
  X,
  ChefHat,
  KeyRound,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMonth } from "@/components/MonthProvider";
import MonthSelector from "@/components/MonthSelector";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { APP_NAME, APP_SHORT } from "@/lib/brand";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

const sharedNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/all-meals", label: "All Meals", icon: Users },
  { href: "/dashboard/all-bazar", label: "All Bazar", icon: ClipboardList },
  { href: "/dashboard/settlement", label: "Settlement", icon: Wallet },
];

const memberNavItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard/meals", label: "My Meals", icon: UtensilsCrossed },
  { href: "/dashboard/bazar", label: "My Bazar", icon: ShoppingCart },
];

const adminItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/users", label: "Manage Users", icon: UserCog },
  { href: "/admin/reminders", label: "SMS Reminders", icon: Bell },
  { href: "/admin/rent", label: "Rent & Bills", icon: Home },
  { href: "/admin/months", label: "Months", icon: CalendarDays },
];

export default function Sidebar({
  user,
  onNavigate,
  onClose,
  closeOnMonthChange = false,
  variant = "desktop",
}: {
  user: User;
  onNavigate?: () => void;
  onClose?: () => void;
  closeOnMonthChange?: boolean;
  variant?: "desktop" | "sheet";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    months,
    selectedMonthId,
    setSelectedMonthId,
    selectedMonth,
    loading,
    refreshMonths,
  } = useMonth();
  const [togglingMonth, setTogglingMonth] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function toggleMonthEdit() {
    if (!selectedMonthId || !selectedMonth) return;
    setTogglingMonth(true);
    const nextLocked = !selectedMonth.editLocked;
    const res = await fetch(`/api/months/${selectedMonthId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editLocked: nextLocked }),
    });
    if (res.ok) await refreshMonths();
    setTogglingMonth(false);
  }

  const navItems =
    user.role === "admin"
      ? sharedNavItems
      : [sharedNavItems[0], ...memberNavItems, ...sharedNavItems.slice(1)];

  const monthEditOpen = !selectedMonth?.editLocked;

  function handleMonthChange(id: string) {
    setSelectedMonthId(id);
    if (closeOnMonthChange) onClose?.();
  }

  function NavLink({
    href,
    label,
    icon: Icon,
    accent = "emerald",
  }: {
    href: string;
    label: string;
    icon: LucideIcon;
    accent?: "emerald" | "violet";
  }) {
    const active = pathname === href;
    const activeClass =
      accent === "violet"
        ? "bg-violet-600 text-white shadow-md shadow-violet-200"
        : "bg-emerald-600 text-white shadow-md shadow-emerald-200";

    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={`flex min-h-[46px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${
          active ? activeClass : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.5 : 2} />
        {label}
      </Link>
    );
  }

  const isSheet = variant === "sheet";

  return (
    <aside
      className={`w-full bg-white ${
        isSheet
          ? "grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden"
          : "flex h-full flex-col lg:w-64 lg:border-r lg:border-slate-200"
      }`}
    >
      <div className={`shrink-0 border-b border-slate-200 ${isSheet ? "px-4 pb-4 pt-1" : "p-5"}`}>
        <div className="flex items-center justify-between gap-2">
          {isSheet ? (
            <h2 className="text-base font-bold text-slate-900">{APP_NAME}</h2>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
                <ChefHat className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">{APP_NAME}</h1>
                <p className="text-xs text-slate-500">{APP_SHORT}</p>
              </div>
            </div>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95"
            >
              <X className="h-5 w-5" strokeWidth={2.25} />
            </button>
          )}
        </div>

        <div className={isSheet ? "mt-3" : "mt-4"}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Month / Year
          </p>
          {loading ? (
            <p className="text-xs text-slate-400">Loading...</p>
          ) : months.length > 0 ? (
            <MonthSelector
              months={months}
              selectedId={selectedMonthId}
              onChange={handleMonthChange}
              className="w-full"
            />
          ) : (
            <p className="text-xs text-slate-400">No month available</p>
          )}
          {selectedMonth?.isCurrent && (
            <p className="mt-1.5 text-[10px] font-medium text-emerald-600">
              Current month
            </p>
          )}

          {selectedMonth && user.role === "admin" && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
              <span
                className={`text-xs font-semibold ${
                  monthEditOpen ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {monthEditOpen ? "Month Edit ON" : "Month Edit OFF"}
              </span>
              <button
                type="button"
                onClick={toggleMonthEdit}
                disabled={togglingMonth}
                aria-label={
                  monthEditOpen ? "Turn month edit off" : "Turn month edit on"
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${
                  monthEditOpen ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    monthEditOpen ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          )}
          {selectedMonth && user.role === "member" && selectedMonth.editLocked && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              Month Edit OFF
            </p>
          )}
        </div>
      </div>

      <nav className="min-h-0 space-y-1 overflow-y-auto overscroll-contain p-3">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main
        </p>
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {user.role === "admin" && (
          <>
            <p className="mt-4 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Admin
            </p>
            {adminItems.map((item) => (
              <NavLink key={item.href} {...item} accent="violet" />
            ))}
          </>
        )}
      </nav>

      <div
        className={`border-t border-slate-200 bg-white ${
          isSheet ? "px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" : "p-4"
        }`}
      >
        {isSheet ? (
          <>
            <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  user.role === "admin"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {user.role}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPasswordOpen(true)}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
              >
                <KeyRound className="h-4 w-4 shrink-0" />
                Password
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <span
                className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  user.role === "admin"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {user.role}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="mb-2 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </>
        )}
      </div>

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </aside>
  );
}
