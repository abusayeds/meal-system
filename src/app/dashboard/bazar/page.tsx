"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X, Calendar, Banknote, FileText } from "lucide-react";
import PageContainer, { PageHeader } from "@/components/PageContainer";
import ActionButton from "@/components/ui/ActionButton";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useMonth } from "@/components/MonthProvider";
import { formatCurrency } from "@/lib/format";
import { getTodayDateKey } from "@/lib/utils";

interface Bazar {
  id: string;
  date: string;
  amount: number;
  description: string;
}

export default function MyBazarPage() {
  const { months, selectedMonthId, selectedMonth, loading } = useMonth();
  const [bazars, setBazars] = useState<Bazar[]>([]);
  const [userCanEdit, setUserCanEdit] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Bazar | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const monthLocked = selectedMonth?.editLocked ?? false;
  const canEditBazar = userCanEdit && !monthLocked;

  function loadBazars() {
    if (!selectedMonthId) return;
    fetch(`/api/bazar?monthId=${selectedMonthId}`)
      .then((r) => r.json())
      .then((d) => setBazars(d.bazars));
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUserCanEdit(d.user.canEdit !== false));
  }, []);

  useEffect(() => {
    loadBazars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonthId]);

  function resetForm() {
    setDate("");
    setAmount("");
    setDescription("");
    setEditingId(null);
  }

  function startEdit(entry: Bazar) {
    setEditingId(entry.id);
    setDate(entry.date);
    setAmount(String(entry.amount));
    setDescription(entry.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      monthId: selectedMonthId,
      date,
      amount: Number(amount),
      description,
    };

    const res = editingId
      ? await fetch(`/api/bazar/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/bazar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      resetForm();
      loadBazars();
    }
    setSubmitting(false);
  }

  function openDeleteModal(entry: Bazar) {
    setDeleteTarget(entry);
    setDeleteConfirmText("");
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    setDeleteConfirmText("");
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteConfirmText.trim().toLowerCase() !== "delete") return;
    setDeleting(true);
    await fetch(`/api/bazar/${deleteTarget.id}`, { method: "DELETE" });
    if (editingId === deleteTarget.id) resetForm();
    closeDeleteModal();
    loadBazars();
    setDeleting(false);
  }

  const total = bazars.reduce((s, b) => s + b.amount, 0);
  const todayKey = getTodayDateKey();
  const todayEntries = bazars.filter((b) => b.date === todayKey);
  const todayTotal = todayEntries.reduce((s, b) => s + b.amount, 0);

  if (loading || months.length === 0) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="My Bazar"
        subtitle={`${canEditBazar ? "Add or edit your market expenses" : "View your bazar (read-only)"} — ${selectedMonth?.label}`}
      />

      {!canEditBazar && (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          <strong>View only:</strong>{" "}
          {monthLocked
            ? "This month is locked by admin."
            : "Your edit permission is disabled."}
        </div>
      )}

      <div
        className={`mt-4 hidden rounded-xl px-4 py-3 text-sm ring-1 md:block ${
          todayEntries.length > 0
            ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
            : "bg-slate-50 text-slate-700 ring-slate-200"
        }`}
      >
        <strong>Today ({todayKey}):</strong>{" "}
        {todayEntries.length > 0 ? (
          <>
            Bazar added — {formatCurrency(todayTotal)}
            {todayEntries[0].description &&
              ` (${todayEntries.map((e) => e.description).join(", ")})`}
          </>
        ) : (
          <>Bazar not added yet</>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3 lg:gap-6">
        {canEditBazar && (
          <form
            onSubmit={handleSubmit}
            className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all lg:col-span-1 ${
              editingId ? "ring-emerald-300" : "ring-slate-200"
            }`}
          >
            {editingId && (
              <div className="flex items-center justify-between gap-2 bg-emerald-600 px-4 py-3 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Pencil className="h-4 w-4" />
                  Editing entry
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20"
                  aria-label="Cancel edit"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="p-4 sm:p-6">
              <h2 className="font-semibold text-slate-900">
                {editingId ? "Edit Bazar Entry" : "Add Bazar Entry"}
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Calendar className="h-3.5 w-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <Banknote className="h-3.5 w-3.5" /> Amount (৳)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
                    }}
                    required
                    className="input-field"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <FileText className="h-3.5 w-3.5" /> Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    placeholder="murgi, sobji, dim"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary min-h-[48px] flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Save Changes"
                        : "Add Entry"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary min-h-[48px]"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}

        <div
          className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 ${canEditBazar ? "lg:col-span-2" : "lg:col-span-3"}`}
        >
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">Your Entries</h2>
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              Total: {formatCurrency(total)}
            </span>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {bazars.length === 0 ? (
              <p className="py-6 text-center text-slate-400">No bazar entries yet</p>
            ) : (
              bazars.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-2xl p-4 ring-1 transition-all ${
                    editingId === b.id
                      ? "bg-emerald-50 ring-emerald-300"
                      : b.date === todayKey
                        ? "bg-emerald-50/50 ring-emerald-200"
                        : "bg-slate-50 ring-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{b.date}</p>
                      <p className="mt-1 text-lg font-bold text-emerald-700">
                        {formatCurrency(b.amount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {b.description || "No description"}
                      </p>
                    </div>
                    {b.date === todayKey && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Today
                      </span>
                    )}
                  </div>
                  {canEditBazar && (
                    <div className="mt-3 flex gap-2">
                      <ActionButton
                        icon={Pencil}
                        label="Edit"
                        variant="edit"
                        onClick={() => startEdit(b)}
                        className="flex-1"
                      />
                      <ActionButton
                        icon={Trash2}
                        label="Delete"
                        variant="delete"
                        onClick={() => openDeleteModal(b)}
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Description</th>
                  {canEditBazar && <th className="px-4 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bazars.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canEditBazar ? 4 : 3}
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No bazar entries yet
                    </td>
                  </tr>
                ) : (
                  bazars.map((b) => (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50 ${
                        editingId === b.id
                          ? "bg-emerald-50"
                          : b.date === todayKey
                            ? "bg-emerald-50/50"
                            : ""
                      }`}
                    >
                      <td className="px-6 py-3">{b.date}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(b.amount)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {b.description || "—"}
                      </td>
                      {canEditBazar && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <ActionButton
                              icon={Pencil}
                              label="Edit"
                              variant="edit"
                              onClick={() => startEdit(b)}
                            />
                            <ActionButton
                              icon={Trash2}
                              label="Delete"
                              variant="delete"
                              onClick={() => openDeleteModal(b)}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        title="Delete Bazar Entry"
        subtitle="Type delete to confirm. This cannot be undone."
        details={
          deleteTarget
            ? [
                { label: "Month", value: selectedMonth?.label ?? "—" },
                { label: "Date", value: deleteTarget.date },
                { label: "Amount", value: formatCurrency(deleteTarget.amount) },
                {
                  label: "Description",
                  value: deleteTarget.description || "—",
                },
              ]
            : []
        }
        confirmText={deleteConfirmText}
        onConfirmTextChange={setDeleteConfirmText}
        onConfirm={confirmDelete}
        onClose={closeDeleteModal}
        deleting={deleting}
      />
    </PageContainer>
  );
}
