"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";

export default function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to change password");
      setSubmitting(false);
      return;
    }

    setSuccess("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSubmitting(false);

    window.setTimeout(() => handleClose(), 1500);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <div
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <KeyRound className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Enter your current password, then choose a new one.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4 sm:px-6">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
              {success}
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="input-field"
              placeholder="Your current password"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="input-field"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="input-field"
              placeholder="Type new password again"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary min-h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary min-h-[48px] bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
