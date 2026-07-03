"use client";

import { useEffect, useState } from "react";
import PageContainer, { PageHeader } from "@/components/PageContainer";
import { useMonth } from "@/components/MonthProvider";
import { formatCurrency } from "@/lib/format";

interface RentField {
  name: string;
  amount: number;
}

export default function AdminRentPage() {
  const { months, selectedMonthId, selectedMonth, loading } = useMonth();
  const [fields, setFields] = useState<RentField[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedMonthId) return;
    fetch(`/api/rent?monthId=${selectedMonthId}`)
      .then((r) => r.json())
      .then((d) => setFields(d.fields));
  }, [selectedMonthId]);

  function addField() {
    setFields([...fields, { name: "", amount: 0 }]);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  function updateField(index: number, key: keyof RentField, value: string) {
    const updated = [...fields];
    if (key === "amount") {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
      updated[index].amount = value === "" ? 0 : Number(value);
    } else {
      updated[index].name = value;
    }
    setFields(updated);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/rent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthId: selectedMonthId, fields }),
    });
    if (res.ok) {
      setMessage("Saved successfully!");
    } else {
      setMessage("Failed to save");
    }
    setSaving(false);
  }

  const total = fields.reduce((s, f) => s + f.amount, 0);

  if (loading || months.length === 0) {
    return <div className="p-8"><p className="text-slate-500">Loading...</p></div>;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Rent & Bills"
        subtitle={`Dynamic fields — add any bill type — ${selectedMonth?.label}`}
      />

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:max-w-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Bill Items</h2>
          <button
            onClick={addField}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            + Add Field
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {fields.map((field, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <input
                value={field.name}
                onChange={(e) => updateField(i, "name", e.target.value)}
                placeholder="Field name (e.g. Gas)"
                className="min-h-[44px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={field.amount === 0 ? "" : String(field.amount)}
                  onChange={(e) => updateField(i, "amount", e.target.value)}
                  placeholder="0"
                  className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-32"
                />
                <button
                  onClick={() => removeField(i)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove field"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-slate-700">
            Grand Total: {formatCurrency(total)}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-[44px] rounded-lg bg-violet-600 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {message && (
          <p className="mt-2 text-sm text-emerald-600">{message}</p>
        )}
      </div>
    </PageContainer>
  );
}
