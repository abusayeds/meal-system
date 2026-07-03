"use client";

import type { LucideIcon } from "lucide-react";

export default function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "edit",
  className = "",
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "edit" | "delete";
  className?: string;
}) {
  const styles =
    variant === "edit"
      ? "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100 active:bg-violet-200"
      : "bg-red-50 text-red-600 ring-red-200 hover:bg-red-100 active:bg-red-200";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition-all active:scale-95 ${styles} ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
      <span>{label}</span>
    </button>
  );
}
