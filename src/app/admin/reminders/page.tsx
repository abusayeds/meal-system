"use client";

import { useEffect, useState } from "react";
import PageContainer, { PageHeader } from "@/components/PageContainer";

interface ReminderDetail {
  userName: string;
  phone: string;
  missingMeals: string[];
  message: string;
  status: "sent" | "failed" | "skipped";
  providerResponse?: string;
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
  const [bulksmsConfigured, setBulksmsConfigured] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [lastRun, setLastRun] = useState<{
    targetDate: string;
    details: ReminderDetail[];
  } | null>(null);

  async function load() {
    const res = await fetch("/api/admin/meal-reminder");
    const data = await res.json();
    if (res.ok) {
      setEnabled(data.mealReminderEnabled);
      setBulksmsConfigured(data.bulksmsConfigured);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveEnabled(next: boolean) {
    const res = await fetch("/api/admin/meal-reminder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealReminderEnabled: next }),
    });
    if (res.ok) {
      const data = await res.json();
      setEnabled(data.mealReminderEnabled);
    }
  }

  async function runNow() {
    setRunning(true);
    setMessage("");
    setLastRun(null);
    const res = await fetch("/api/admin/meal-reminder", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setMessage(
        `Done — checked ${data.checked}, reminders ${data.reminders}, sent ${data.sent}, failed ${data.failed}, skipped ${data.skipped}`
      );
      setLastRun({
        targetDate: data.targetDate,
        details: data.details ?? [],
      });
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
              <p className="font-semibold text-slate-900">Auto Reminder ON/OFF</p>
              <p className="text-xs text-slate-500">
                OFF থাকলে রাত ১০:৩০ auto SMS যাবে না। Manual &quot;Reminder
                Now&quot; সবসময় কাজ করবে।
              </p>
            </div>
            <ToggleSwitch
              on={enabled}
              onToggle={() => {
                const next = !enabled;
                setEnabled(next);
                saveEnabled(next);
              }}
              label="Toggle auto reminders"
            />
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                bulksmsConfigured
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {bulksmsConfigured ? "BulkSMS ready" : "BulkSMS not set"}
            </span>
            {!bulksmsConfigured && (
              <p className="mt-2 text-xs text-amber-800">
                Vercel বা .env.local-এ BULKSMS_API_KEY ও BULKSMS_SENDER_ID set
                করুন।
              </p>
            )}
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
          disabled={running || !bulksmsConfigured}
          className="btn-primary min-h-[48px] w-full bg-violet-600 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {running ? "Sending..." : "Reminder Now"}
        </button>

        {message && (
          <p
            className={`rounded-xl px-4 py-3 text-sm ring-1 ${
              message.startsWith("Done")
                ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                : "bg-red-50 text-red-800 ring-red-100"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {lastRun && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">Last Run Result</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Target date: {lastRun.targetDate} · reload করলে চলে যাবে
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {lastRun.details.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">
                কাউকে reminder লাগেনি — সবাই meal update করেছে
              </p>
            ) : (
              lastRun.details.map((item, i) => (
                <div key={`${item.userName}-${i}`} className="p-4 sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {item.userName}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.status === "sent"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Missing: {item.missingMeals.join(", ")} ·{" "}
                    {item.phone || "no phone"}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">{item.message}</p>
                  {item.status === "failed" && item.providerResponse && (
                    <p className="mt-1 text-xs text-red-600">
                      {item.providerResponse}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
