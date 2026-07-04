"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  User,
  Calendar,
  Banknote,
  FileText,
  X,
} from "lucide-react";
import PageContainer, { PageHeader, MobileScrollTable } from "@/components/PageContainer";
import ActionButton from "@/components/ui/ActionButton";
import BazarDescriptionInput from "@/components/ui/BazarDescriptionInput";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { useMonth } from "@/components/MonthProvider";
import { formatCurrency } from "@/lib/format";
import { getMemberColor } from "@/lib/member-colors";

interface Member {
  id: string;
  name: string;
}

interface DayBazar {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  description: string;
}

interface DayRow {
  day: number;
  date: string;
  weekday: string;
  bazars: DayBazar[];
}

function BazarEntryRow({
  entry,
  memberIdx,
  isAdmin,
  onEdit,
  onDelete,
}: {
  entry: DayBazar;
  memberIdx: number;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const c = getMemberColor(entry.userName, memberIdx >= 0 ? memberIdx : 0);

  return (
    <div className="rounded-2xl bg-slate-50/90 p-3.5 ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${c.badge}`}>
              {entry.userName}
            </span>
            <span className="text-base font-bold text-slate-900">
              {formatCurrency(entry.amount)}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-600">
            {entry.description || "No description"}
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-3 flex gap-2">
          <ActionButton
            icon={Pencil}
            label="Edit"
            variant="edit"
            onClick={onEdit}
            className="flex-1"
          />
          <ActionButton
            icon={Trash2}
            label="Delete"
            variant="delete"
            onClick={onDelete}
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
}

export default function AllBazarPage() {
  const { months, selectedMonthId, selectedMonth, loading } = useMonth();
  const [members, setMembers] = useState<Member[]>([]);
  const [calendar, setCalendar] = useState<DayRow[]>([]);
  const [totalBazar, setTotalBazar] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterUserId, setFilterUserId] = useState("all");

  const [formUserId, setFormUserId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{
    entry: DayBazar;
    date: string;
  } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.user?.role === "admin"));
  }, []);

  function loadData() {
    if (!selectedMonthId) return;
    fetch(`/api/months/${selectedMonthId}`)
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members);
        setCalendar(d.calendar);
        setTotalBazar(d.summary.totalBazar);
        if (!formUserId && d.members.length > 0) {
          setFormUserId(d.members[0].id);
        }
      });
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonthId]);

  function resetForm() {
    setFormDate("");
    setFormAmount("");
    setFormDescription("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      monthId: selectedMonthId,
      userId: formUserId,
      date: formDate,
      amount: Number(formAmount),
      description: formDescription,
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
      loadData();
    }
    setSubmitting(false);
  }

  function startEdit(entry: DayBazar, date: string) {
    setEditingId(entry.id);
    setFormUserId(entry.userId);
    setFormDate(date);
    setFormAmount(String(entry.amount));
    setFormDescription(entry.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDeleteModal(entry: DayBazar, date: string) {
    setDeleteTarget({ entry, date });
    setDeleteConfirmText("");
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    setDeleteConfirmText("");
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteConfirmText.trim().toLowerCase() !== "delete") return;
    setDeleting(true);
    await fetch(`/api/bazar/${deleteTarget.entry.id}`, { method: "DELETE" });
    if (editingId === deleteTarget.entry.id) resetForm();
    closeDeleteModal();
    loadData();
    setDeleting(false);
  }

  const visibleMembers =
    filterUserId === "all"
      ? members
      : members.filter((m) => m.id === filterUserId);

  const deposits: Record<string, number> = {};
  for (const m of members) deposits[m.id] = 0;
  for (const day of calendar) {
    for (const b of day.bazars) {
      if (filterUserId !== "all" && b.userId !== filterUserId) continue;
      deposits[b.userId] = (deposits[b.userId] ?? 0) + b.amount;
    }
  }

  const filteredTotal =
    filterUserId === "all" ? totalBazar : (deposits[filterUserId] ?? 0);

  const rowsWithBazar = calendar.filter((d) => {
    if (d.bazars.length === 0) return false;
    if (filterUserId === "all") return true;
    return d.bazars.some((b) => b.userId === filterUserId);
  });

  if (loading || months.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading bazar data...</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="All Bazar"
        subtitle={`${isAdmin ? "Add, edit or delete bazar entries" : "View everyone's bazar (read-only)"} — ${selectedMonth?.label}`}
      />

      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className={`mt-4 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all ${
            editingId ? "ring-violet-300 shadow-violet-100/50" : "ring-slate-200"
          }`}
        >
          {editingId && (
            <div className="flex items-center justify-between gap-3 bg-violet-600 px-4 py-3 text-white sm:px-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Pencil className="h-4 w-4" />
                Editing entry — update fields below
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 transition hover:bg-white/30"
                aria-label="Cancel edit"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {editingId ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </div>
              <h2 className="font-semibold text-slate-900">
                {editingId ? "Edit Bazar Entry" : "Add Bazar Entry"}
              </h2>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <User className="h-3.5 w-3.5" /> Member
                </label>
                <select
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  required
                  className="input-field"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <Calendar className="h-3.5 w-3.5" /> Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
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
                  value={formAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d*$/.test(v)) setFormAmount(v);
                  }}
                  required
                  placeholder="500"
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <FileText className="h-3.5 w-3.5" /> Description
                </label>
                <BazarDescriptionInput
                  value={formDescription}
                  onChange={setFormDescription}
                  placeholder="murgi, sobji"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary min-h-[48px] bg-violet-600 hover:bg-violet-700"
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
        </form>
      )}

      {isAdmin && (
        <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800 ring-1 ring-blue-100">
          <strong>Tip:</strong> Each entry has <strong>Edit</strong> and{" "}
          <strong>Delete</strong> buttons. No need to select a date first.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          {members.map((m, i) => {
            const c = getMemberColor(m.name, i);
            return (
              <span
                key={m.id}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${c.badge}`}
              >
                {m.name}
              </span>
            );
          })}
        </div>
        <select
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
          className="input-field sm:ml-auto sm:w-auto"
        >
          <option value="all">All Members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-4 text-white shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-emerald-100">Total Bazar</p>
          <p className="text-xl font-bold">{formatCurrency(filteredTotal)}</p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {rowsWithBazar.length === 0 ? (
          <div className="card-empty">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">No bazar entries yet</p>
          </div>
        ) : (
          rowsWithBazar.map((day) => {
            const dayBazars =
              filterUserId === "all"
                ? day.bazars
                : day.bazars.filter((b) => b.userId === filterUserId);

            const byUser: Record<string, number> = {};
            for (const b of dayBazars) {
              byUser[b.userId] = (byUser[b.userId] ?? 0) + b.amount;
            }

            return (
              <div
                key={day.date}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {day.day} <span className="font-medium text-slate-400">{day.weekday}</span>
                    </p>
                    <p className="text-xs text-slate-400">{day.date}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {dayBazars.length} {dayBazars.length === 1 ? "entry" : "entries"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {visibleMembers.map((m, i) => {
                    const idx = members.findIndex((x) => x.id === m.id);
                    const c = getMemberColor(m.name, idx >= 0 ? idx : i);
                    if (!byUser[m.id]) return null;
                    return (
                      <span
                        key={m.id}
                        className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${c.badge}`}
                      >
                        {m.name}: {formatCurrency(byUser[m.id])}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-3 space-y-2">
                  {dayBazars.map((entry) => {
                    const memberIdx = members.findIndex((m) => m.id === entry.userId);
                    return (
                      <BazarEntryRow
                        key={entry.id}
                        entry={entry}
                        memberIdx={memberIdx}
                        isAdmin={isAdmin}
                        onEdit={() => startEdit(entry, day.date)}
                        onDelete={() => openDeleteModal(entry, day.date)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        <div className="rounded-2xl bg-slate-800 p-4 text-white">
          <p className="font-bold">TOTAL</p>
          <div className="mt-2 space-y-1">
            {visibleMembers.map((m) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span>{m.name}</span>
                <span className="font-bold">{formatCurrency(deposits[m.id] ?? 0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
        <MobileScrollTable>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <th className="bg-slate-800 px-4 py-3 text-left text-xs uppercase text-white">
                  Date
                </th>
                {visibleMembers.map((m, i) => {
                  const idx = members.findIndex((x) => x.id === m.id);
                  const c = getMemberColor(m.name, idx >= 0 ? idx : i);
                  return (
                    <th
                      key={m.id}
                      className={`px-4 py-3 text-xs uppercase text-white ${c.header}`}
                    >
                      {m.name}
                    </th>
                  );
                })}
                <th className="bg-slate-800 px-4 py-3 text-xs uppercase text-white">
                  Entries & Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rowsWithBazar.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleMembers.length + 2}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No bazar entries yet
                  </td>
                </tr>
              ) : (
                rowsWithBazar.map((day) => {
                  const dayBazars =
                    filterUserId === "all"
                      ? day.bazars
                      : day.bazars.filter((b) => b.userId === filterUserId);

                  const byUser: Record<string, number> = {};
                  for (const b of dayBazars) {
                    byUser[b.userId] = (byUser[b.userId] ?? 0) + b.amount;
                  }

                  return (
                    <tr key={day.date} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="bg-white px-4 py-3 font-medium text-slate-700">
                        <p>{day.day} {day.weekday}</p>
                        <p className="text-xs text-slate-400">{day.date}</p>
                      </td>
                      {visibleMembers.map((m, i) => {
                        const idx = members.findIndex((x) => x.id === m.id);
                        const c = getMemberColor(m.name, idx >= 0 ? idx : i);
                        return (
                          <td
                            key={m.id}
                            className={`px-4 py-3 font-medium ${c.cell} ${c.cellText}`}
                          >
                            {byUser[m.id] ? formatCurrency(byUser[m.id]) : "—"}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          {dayBazars.map((entry) => {
                            const memberIdx = members.findIndex(
                              (m) => m.id === entry.userId
                            );
                            const c = getMemberColor(
                              entry.userName,
                              memberIdx >= 0 ? memberIdx : 0
                            );
                            return (
                              <div
                                key={entry.id}
                                className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100"
                              >
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.badge}`}
                                >
                                  {entry.userName}
                                </span>
                                <span className="text-xs font-medium text-slate-700">
                                  {entry.description || "—"}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {formatCurrency(entry.amount)}
                                </span>
                                {isAdmin && (
                                  <>
                                    <ActionButton
                                      icon={Pencil}
                                      label="Edit"
                                      variant="edit"
                                      onClick={() => startEdit(entry, day.date)}
                                    />
                                    <ActionButton
                                      icon={Trash2}
                                      label="Delete"
                                      variant="delete"
                                      onClick={() => openDeleteModal(entry, day.date)}
                                    />
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              <tr className="font-bold">
                <td className="bg-slate-800 px-4 py-3 text-white">TOTAL</td>
                {visibleMembers.map((m, i) => {
                  const idx = members.findIndex((x) => x.id === m.id);
                  const c = getMemberColor(m.name, idx >= 0 ? idx : i);
                  return (
                    <td
                      key={m.id}
                      className={`px-4 py-3 ${c.total} ${c.totalText}`}
                    >
                      {formatCurrency(deposits[m.id] ?? 0)}
                    </td>
                  );
                })}
                <td className="bg-slate-800" />
              </tr>
            </tbody>
          </table>
        </MobileScrollTable>
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        title="Delete Bazar Entry"
        subtitle="This cannot be undone. Type delete to enable the delete button."
        details={
          deleteTarget
            ? [
                { label: "Month", value: selectedMonth?.label ?? "—" },
                { label: "Member", value: deleteTarget.entry.userName },
                { label: "Date", value: deleteTarget.date },
                { label: "Amount", value: formatCurrency(deleteTarget.entry.amount) },
                {
                  label: "Description",
                  value: deleteTarget.entry.description || "—",
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
