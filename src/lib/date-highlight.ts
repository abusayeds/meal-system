export function isDateActive(date: string, activeDate: string | null) {
  return activeDate === date;
}

export function dateRowRingClass(active: boolean) {
  return active
    ? "ring-2 ring-inset ring-emerald-500 bg-emerald-50"
    : "ring-1 ring-inset ring-transparent hover:ring-emerald-400 hover:bg-emerald-50/40";
}

export function dateCardRingClass(active: boolean) {
  return active
    ? "ring-2 ring-emerald-500 border-2 border-emerald-500 shadow-md shadow-emerald-100"
    : "ring-1 ring-slate-200 border-2 border-transparent hover:ring-2 hover:ring-emerald-400 hover:border-emerald-400";
}
