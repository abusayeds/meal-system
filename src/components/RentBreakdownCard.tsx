import { formatCurrency } from "@/lib/format";
import {
  rentFieldTotal,
  splitRentFields,
  type RentField,
} from "@/lib/rent-fields";

export default function RentBreakdownCard({
  rentFields,
  totalRent,
  rentShare,
  memberCount,
}: {
  rentFields: RentField[];
  totalRent: number;
  rentShare: number;
  memberCount: number;
}) {
  const { fixedFields, otherFields } = splitRentFields(rentFields);
  const fixedTotal = rentFieldTotal(fixedFields);
  const otherTotal = rentFieldTotal(otherFields);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 className="font-semibold text-slate-900">Rent &amp; Bills</h2>

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Rent
        </h3>
        <div className="mt-2 space-y-2 text-sm">
          {fixedFields.map((f) => (
            <div key={f.name} className="flex justify-between gap-3">
              <span className="text-slate-600">{f.name}</span>
              <span className="shrink-0 font-medium text-slate-900">
                {formatCurrency(f.amount)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm ring-1 ring-emerald-100">
          <span className="font-semibold text-emerald-800">Rent Subtotal</span>
          <span className="font-bold text-emerald-800">
            {formatCurrency(fixedTotal)}
          </span>
        </div>
      </div>

      {otherFields.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Others
          </h3>
          <div className="mt-2 space-y-2 text-sm">
            {otherFields.map((f) => (
              <div key={f.name} className="flex justify-between gap-3">
                <span className="text-slate-600">{f.name}</span>
                <span className="shrink-0 font-medium text-slate-900">
                  {formatCurrency(f.amount)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between rounded-xl bg-violet-50 px-3 py-2 text-sm ring-1 ring-violet-100">
            <span className="font-semibold text-violet-800">Others Subtotal</span>
            <span className="font-bold text-violet-800">
              {formatCurrency(otherTotal)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="font-semibold text-violet-700">Grand Total</span>
          <span className="font-bold text-violet-700">
            {formatCurrency(totalRent)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">
            Per Person ({memberCount} members)
          </span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(rentShare)}
          </span>
        </div>
      </div>
    </div>
  );
}
