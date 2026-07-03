import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function formatMonthLabel(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getTodayDateKey() {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export type MonthEditLockSource = "none" | "manual" | "auto";

export function formatMonthEditStatus(
  editLocked: boolean,
  editLockSource: MonthEditLockSource = "none"
) {
  if (!editLocked) return "Edit Open";
  if (editLockSource === "auto") return "Auto Locked";
  if (editLockSource === "manual") return "Locked";
  return "Locked";
}
