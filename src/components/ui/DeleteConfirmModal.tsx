"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  details: { label: string; value: string }[];
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  deleting?: boolean;
  confirmWord?: string;
}

export default function DeleteConfirmModal({
  open,
  title,
  subtitle = "Review the details below. Type delete to confirm.",
  details,
  confirmText,
  onConfirmTextChange,
  onConfirm,
  onClose,
  deleting = false,
  confirmWord = "delete",
}: DeleteConfirmModalProps) {
  if (!open) return null;

  const canDelete = confirmText.trim().toLowerCase() === confirmWord;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
              <AlertTriangle className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4 sm:px-6">
          <dl className="space-y-2.5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            {details.map((item) => (
              <div key={item.label} className="flex justify-between gap-4 text-sm">
                <dt className="text-slate-500">{item.label}</dt>
                <dd className="max-w-[58%] text-right font-semibold text-slate-900">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Type <span className="rounded-md bg-red-50 px-1.5 py-0.5 font-bold text-red-600">{confirmWord}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => onConfirmTextChange(e.target.value)}
              placeholder={`Type ${confirmWord} here`}
              autoComplete="off"
              autoFocus
              className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />
            {confirmText && !canDelete && (
              <p className="mt-2 text-xs text-amber-600">
                Please type exactly <strong>{confirmWord}</strong> (lowercase)
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="min-h-[48px] rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Entry"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
