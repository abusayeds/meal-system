"use client";

import { useEffect, useState } from "react";
import PageContainer, { PageHeader } from "@/components/PageContainer";
import { useMonth } from "@/components/MonthProvider";
import { formatCurrency } from "@/lib/format";
import {
  rentFieldTotal,
  splitRentFields,
  type RentField,
} from "@/lib/rent-fields";

export default function AdminRentPage() {
  const { months, selectedMonthId, selectedMonth, loading } = useMonth();
  const [fixedFields, setFixedFields] = useState<RentField[]>([]);
  const [otherFields, setOtherFields] = useState<RentField[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedMonthId) return;
    fetch(`/api/rent?monthId=${selectedMonthId}`)
      .then((r) => r.json())
      .then((d) => {
        const { fixedFields: fixed, otherFields: others } = splitRentFields(
          d.fields ?? []
        );
        setFixedFields(fixed);
        setOtherFields(others);
      });
  }, [selectedMonthId]);

  function addOtherField() {
    setOtherFields([...otherFields, { name: "", amount: 0 }]);
  }

  function removeOtherField(index: number) {
    setOtherFields(otherFields.filter((_, i) => i !== index));
  }

  function updateFixedField(index: number, amount: string) {
    if (amount !== "" && !/^\d*\.?\d*$/.test(amount)) return;
    const updated = [...fixedFields];
    updated[index].amount = amount === "" ? 0 : Number(amount);
    setFixedFields(updated);
  }

  function updateOtherField(
    index: number,
    key: keyof RentField,
    value: string
  ) {
    const updated = [...otherFields];
    if (key === "amount") {
      if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
      updated[index].amount = value === "" ? 0 : Number(value);
    } else {
      updated[index].name = value;
    }
    setOtherFields(updated);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/rent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthId: selectedMonthId,
        fixedFields,
        otherFields,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      const { fixedFields: fixed, otherFields: others } = splitRentFields(
        d.fields ?? []
      );
      setFixedFields(fixed);
      setOtherFields(others);
      setMessage("Saved successfully!");
    } else {
      setMessage("Failed to save");
    }
    setSaving(false);
  }

  const fixedTotal = rentFieldTotal(fixedFields);
  const otherTotal = rentFieldTotal(otherFields);
  const grandTotal = fixedTotal + otherTotal;

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
        title="Rent & Bills"
        subtitle={`Fixed rent items + others — ${selectedMonth?.label}`}
      />

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:max-w-2xl sm:p-6">
        <h2 className="font-semibold text-slate-900">Bill Items</h2>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-slate-800">Rent</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Fixed items — cannot be removed
          </p>

          <div className="mt-3 space-y-2">
            {fixedFields.map((field, i) => (
              <div
                key={field.name}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200"
              >
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                  {field.name}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={field.amount === 0 ? "" : String(field.amount)}
                  onChange={(e) => updateFixedField(i, e.target.value)}
                  placeholder="0"
                  className="min-h-[44px] w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-sm"
                />
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between rounded-xl bg-emerald-50 px-3 py-2.5 text-sm ring-1 ring-emerald-200">
            <span className="font-semibold text-emerald-800">Subtotal</span>
            <span className="font-bold text-emerald-800">
              {formatCurrency(fixedTotal)}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Others</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Extra bills — add or remove as needed
              </p>
            </div>
            <button
              type="button"
              onClick={addOtherField}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              + Add Field
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {otherFields.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-400 ring-1 ring-slate-200">
                No other items yet. Use Add Field to add one.
              </p>
            ) : (
              otherFields.map((field, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 sm:flex-row sm:gap-3"
                >
                  <input
                    value={field.name}
                    onChange={(e) =>
                      updateOtherField(i, "name", e.target.value)
                    }
                    placeholder="Field name (e.g. Internet)"
                    className="min-h-[44px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={field.amount === 0 ? "" : String(field.amount)}
                      onChange={(e) =>
                        updateOtherField(i, "amount", e.target.value)
                      }
                      placeholder="0"
                      className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-32"
                    />
                    <button
                      type="button"
                      onClick={() => removeOtherField(i)}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove field"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {otherFields.length > 0 && (
            <div className="mt-3 flex justify-between rounded-xl bg-violet-50 px-3 py-2.5 text-sm ring-1 ring-violet-200">
              <span className="font-semibold text-violet-800">Subtotal</span>
              <span className="font-bold text-violet-800">
                {formatCurrency(otherTotal)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-base font-bold text-slate-900">
            Grand Total: {formatCurrency(grandTotal)}
          </span>
          <button
            type="button"
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
