"use client";

import { useEffect, useState } from "react";
import PageContainer, { PageHeader } from "@/components/PageContainer";

interface ReminderLog {
  id: string;
  userName: string;
  phone: string;
  targetDate: string;
  missingMeals: string[];
  message: string;
  status: string;
  providerResponse?: string;
  createdAt: string;
}

function ToggleSwitch({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}

export default function AdminRemindersPage() {
  const [enabled, setEnabled] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/meal-reminder");
    const data = await res.json();
    if (res.ok) {
      setEnabled(data.mealReminderEnabled);
      setLiveMode(data.smsLiveMode);
      setLogs(data.logs);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSettings(next: {
    mealReminderEnabled?: boolean;
    smsLiveMode?: boolean;
  }) {
    const res = await fetch("/api/admin/meal-reminder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (res.ok) {
      const data = await res.json();
      setEnabled(data.mealReminderEnabled);
      setLiveMode(data.smsLiveMode);
    }
  }

  async function runNow() {
    setRunning(true);
    setMessage("");
    const res = await fetch("/api/admin/meal-reminder", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setMessage(
        `Done — checked ${data.checked}, reminders ${data.reminders} (${data.mode} mode: sent ${data.sent}, test ${data.test}, failed ${data.failed}, skipped ${data.skipped})`
      );
      load();
    } else {
      setMessage(data.error || "Failed");
    }
    setRunning(false);
  }

  return (
    <PageContainer>
      <PageHeader
        title="SMS Reminders"
        subtitle="Daily 10:30 PM (Bangladesh) — reminds members who forgot yesterday's meals"
      />

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">Reminder ON/OFF</p>
              <p className="text-xs text-slate-500">Cron + manual run</p>
            </div>
            <ToggleSwitch
              on={enabled}
              onToggle={() => {
                const next = !enabled;
                setEnabled(next);
                saveSettings({ mealReminderEnabled: next });
              }}
              label="Toggle reminders"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <div>
              <p className="font-semibold text-slate-900">
                {liveMode ? "Live SMS" : "Test mode"}
              </p>
              <p className="text-xs text-slate-500">
                {liveMode
                  ? "Real SMS via BulkSMS BD"
                  : "Log only — no SMS sent (no balance needed)"}
              </p>
            </div>
            <ToggleSwitch
              on={liveMode}
              onToggle={() => {
                const next = !liveMode;
                setLiveMode(next);
                saveSettings({ smsLiveMode: next });
              }}
              label="Toggle live SMS"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800 ring-1 ring-blue-100">
          <strong>Logic:</strong> গতকাল যে meal add করা নেই (Breakfast/Lunch/Dinner)
          শুধু সেগুলোর reminder। <strong>০</strong> দিয়ে save করলে = খায়নি, SMS
          যাবে না।
        </div>

        <button
          type="button"
          onClick={runNow}
          disabled={running}
          className="btn-primary min-h-[48px] w-full bg-violet-600 hover:bg-violet-700 sm:w-auto"
        >
          {running ? "Running..." : "Run Reminder Now (Test)"}
        </button>

        {message && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
            {message}
          </p>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-900">Recent Logs</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {logs.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">No logs yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{log.userName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      log.status === "sent"
                        ? "bg-emerald-100 text-emerald-700"
                        : log.status === "test"
                          ? "bg-blue-100 text-blue-700"
                          : log.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-xs text-slate-400">{log.targetDate}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Missing: {log.missingMeals.join(", ")} · {log.phone || "no phone"}
                </p>
                <p className="mt-2 text-sm text-slate-700">{log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
