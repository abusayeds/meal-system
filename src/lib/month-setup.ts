import Month from "@/models/Month";
import RentConfig, { IRentField } from "@/models/RentConfig";
import { formatMonthLabel } from "@/lib/utils";

export const DEFAULT_RENT_FIELDS: IRentField[] = [
  { name: "Monthly Rent", amount: 0 },
  { name: "Electricity", amount: 0 },
  { name: "Gas", amount: 0 },
  { name: "Water", amount: 0 },
  { name: "Internet", amount: 0 },
  { name: "Khala", amount: 0 },
  { name: "Dust", amount: 0 },
];

function isElectricityField(name: string) {
  return name.trim().toLowerCase() === "electricity";
}

export function getCurrentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function getPreviousYearMonth(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

async function getRentFieldsFromPreviousMonth(
  year: number,
  month: number
): Promise<IRentField[]> {
  const { year: prevYear, month: prevMonth } = getPreviousYearMonth(year, month);
  const prevMonthDoc = await Month.findOne({ year: prevYear, month: prevMonth }).lean();

  if (!prevMonthDoc) {
    return DEFAULT_RENT_FIELDS.map((f) => ({ ...f }));
  }

  const prevRent = await RentConfig.findOne({ monthId: prevMonthDoc._id }).lean();
  if (!prevRent?.fields?.length) {
    return DEFAULT_RENT_FIELDS.map((f) => ({ ...f }));
  }

  return prevRent.fields.map((f) => ({
    name: f.name,
    amount: isElectricityField(f.name) ? 0 : f.amount,
  }));
}

export async function createMonthRecord(year: number, month: number) {
  const existing = await Month.findOne({ year, month });
  if (existing) return existing;

  const newMonth = await Month.create({
    year,
    month,
    label: formatMonthLabel(year, month),
    isActive: true,
  });

  const rentFields = await getRentFieldsFromPreviousMonth(year, month);

  await RentConfig.create({
    monthId: newMonth._id,
    fields: rentFields,
  });

  return newMonth;
}

export async function ensureCurrentMonthExists() {
  const { year, month } = getCurrentYearMonth();
  return createMonthRecord(year, month);
}
