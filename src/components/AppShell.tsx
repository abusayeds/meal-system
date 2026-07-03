"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileMonthBar from "@/components/MobileMonthBar";
import { useMonth } from "@/components/MonthProvider";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

const DRAWER_MS = 320;

export default function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { selectedMonth } = useMonth();

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setDrawerVisible(false);
    window.setTimeout(() => setMenuOpen(false), DRAWER_MS);
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) closeMenu();
    else openMenu();
  }, [menuOpen, closeMenu, openMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const frame = requestAnimationFrame(() => setDrawerVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar user={user} />
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ease-out lg:hidden ${
              drawerVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMenu}
          />
          <div
            className={`fixed inset-x-0 bottom-0 z-50 flex h-[92dvh] max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(15,23,42,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform lg:hidden ${
              drawerVisible ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="flex shrink-0 justify-center pt-3 pb-2">
              <div className="h-1 w-12 rounded-full bg-slate-200" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <Sidebar
                user={user}
                variant="sheet"
                onNavigate={closeMenu}
                onClose={closeMenu}
                closeOnMonthChange
              />
            </div>
          </div>
        </>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <MobileMonthBar
          label={selectedMonth?.label}
          isCurrent={selectedMonth?.isCurrent}
          menuOpen={menuOpen}
          onMenuClick={toggleMenu}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 lg:pb-0">
          {children}
        </main>

        {!menuOpen && (
          <MobileBottomNav
            user={user}
            menuOpen={menuOpen}
            onMenuClick={toggleMenu}
          />
        )}
      </div>
    </div>
  );
}
