"use client";

import { useEffect, useState } from "react";
import PageContainer, { PageHeader } from "@/components/PageContainer";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  canEditMealsBazar: boolean;
  phone?: string;
}

function ToggleSwitch({
  on,
  onToggle,
  label,
  activeColor = "bg-emerald-500",
  offColor = "bg-slate-300",
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  activeColor?: string;
  offColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? activeColor : offColor}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [lockAll, setLockAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    phone: "",
  });
  const [error, setError] = useState("");

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users);
  }

  async function loadSettings() {
    const res = await fetch("/api/settings");
    const data = await res.json();
    if (res.ok) setLockAll(data.lockAllMemberEdits);
  }

  useEffect(() => {
    loadUsers();
    loadSettings();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setForm({ name: "", email: "", password: "", role: "member", phone: "" });
    setShowForm(false);
    loadUsers();
  }

  async function toggleActive(user: User) {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    loadUsers();
  }

  async function setUserEditAccess(user: User, canEdit: boolean) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, canEditMealsBazar: canEdit } : u
      )
    );

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canEditMealsBazar: canEdit }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to update edit permission");
      loadUsers();
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, canEditMealsBazar: data.user.canEditMealsBazar }
          : u
      )
    );
    setError("");
  }

  async function saveLockAllSetting(next: boolean) {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lockAllMemberEdits: next }),
    });
    if (res.ok) setLockAll(next);
  }

  async function savePhone(user: User, phone: string) {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    loadUsers();
  }

  const members = users.filter((u) => u.role !== "admin");

  return (
    <PageContainer>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Manage Users"
          subtitle="Create and manage member accounts"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="min-h-[44px] shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          + Create User
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span
            className={`text-sm font-semibold ${lockAll ? "text-red-600" : "text-emerald-600"}`}
          >
            {lockAll ? "User Edit OFF" : "User Edit ON"}
          </span>
          <ToggleSwitch
            on={!lockAll}
            onToggle={() => saveLockAllSetting(!lockAll)}
            label={lockAll ? "Turn user edit on" : "Turn user edit off"}
            activeColor="bg-emerald-500"
            offColor="bg-red-500"
          />
        </div>
      </div>

      {/* Mobile user cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {members.map((u) => (
          <div
            key={u.id}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  u.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {u.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-[10px] font-medium text-slate-500">
                Phone (SMS)
              </label>
              <input
                type="tel"
                defaultValue={u.phone ?? ""}
                placeholder="01XXXXXXXXX"
                onBlur={(e) => {
                  if (e.target.value !== (u.phone ?? "")) {
                    savePhone(u, e.target.value);
                  }
                }}
                className="input-field text-sm"
              />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
              <span
                className={`text-xs font-semibold ${
                  u.canEditMealsBazar ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {u.canEditMealsBazar ? "User Edit ON" : "User Edit OFF"}
              </span>
              <ToggleSwitch
                on={u.canEditMealsBazar}
                onToggle={() => setUserEditAccess(u, !u.canEditMealsBazar)}
                label={
                  u.canEditMealsBazar
                    ? "Turn user edit off"
                    : "Turn user edit on"
                }
                activeColor="bg-emerald-500"
                offColor="bg-red-400"
              />
            </div>

            <button
              onClick={() => toggleActive(u)}
              className="mt-3 min-h-[40px] w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600"
            >
              {u.isActive ? "Deactivate Account" : "Activate Account"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <th className="px-6 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">User Edit</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <input
                    type="tel"
                    defaultValue={u.phone ?? ""}
                    placeholder="01XXXXXXXXX"
                    onBlur={(e) => {
                      if (e.target.value !== (u.phone ?? "")) {
                        savePhone(u, e.target.value);
                      }
                    }}
                    className="w-36 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  {u.isActive ? (
                    <span className="text-emerald-600">Active</span>
                  ) : (
                    <span className="text-red-500">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      on={u.canEditMealsBazar}
                      onToggle={() =>
                        setUserEditAccess(u, !u.canEditMealsBazar)
                      }
                      label={
                        u.canEditMealsBazar
                          ? "Turn user edit off"
                          : "Turn user edit on"
                      }
                      activeColor="bg-emerald-500"
                      offColor="bg-red-400"
                    />
                    <span
                      className={`text-xs font-semibold ${
                        u.canEditMealsBazar ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {u.canEditMealsBazar ? "User Edit ON" : "User Edit OFF"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(u)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6"
        >
          <h2 className="font-semibold">New User</h2>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="tel"
              placeholder="Phone 01XXXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="min-h-[44px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 min-h-[44px] w-full rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white sm:w-auto"
          >
            Create Account
          </button>
        </form>
      )}
    </PageContainer>
  );
}
