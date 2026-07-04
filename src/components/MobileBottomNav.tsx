"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface User {
  role: "admin" | "member";
}

export default function MobileBottomNav({
  user,
  menuOpen,
  onMenuClick,
}: {
  user: User;
  menuOpen: boolean;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();

  const items: { href: string; label: string; icon: LucideIcon }[] =
    user.role === "admin"
      ? [
          { href: "/dashboard", label: "Home", icon: LayoutDashboard },
          { href: "/dashboard/all-meals", label: "Meals", icon: UtensilsCrossed },
          { href: "/dashboard/all-bazar", label: "Bazar", icon: ShoppingCart },
          { href: "/dashboard/settlement", label: "Bill", icon: Wallet },
        ]
      : [
          { href: "/dashboard", label: "Home", icon: LayoutDashboard },
          { href: "/dashboard/meals", label: "Meals", icon: UtensilsCrossed },
          { href: "/dashboard/bazar", label: "Bazar", icon: ShoppingCart },
          { href: "/dashboard/settlement", label: "Bill", icon: Wallet },
        ];

  return (
    <nav className="mobile-bottom-nav shrink-0 border-t border-slate-200/80 bg-white shadow-[0_-4px_24px_rgba(15,23,42,0.08)] lg:hidden">
      <div className="flex items-stretch px-1 pt-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const isAllMeals = item.href === "/dashboard/all-meals";
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-all duration-200 active:scale-95 ${
                active ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-emerald-500 transition-all duration-300" />
              )}
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-200 ${
                  isAllMeals
                    ? active
                      ? "scale-105 border-emerald-500 bg-emerald-50"
                      : "border-transparent hover:border-emerald-500 hover:bg-emerald-50"
                    : active
                      ? "scale-105 border-transparent bg-emerald-50"
                      : "border-transparent"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
              </span>
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-all duration-300 active:scale-95 ${
            menuOpen ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {menuOpen && (
            <span className="absolute top-0 h-0.5 w-8 rounded-full bg-emerald-500 transition-all duration-300" />
          )}
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
              menuOpen ? "scale-105 rotate-90 bg-emerald-50" : ""
            }`}
          >
            {menuOpen ? (
              <X className="h-[18px] w-[18px]" strokeWidth={2.5} />
            ) : (
              <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
            )}
          </span>
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>
    </nav>
  );
}
