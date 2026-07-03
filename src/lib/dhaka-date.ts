import { toDateKey } from "@/lib/utils";

/** YYYY-MM-DD in Asia/Dhaka, with optional day offset (e.g. -1 = yesterday). */
export function getDhakaDateKey(dayOffset = 0): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  const local = new Date(year, month - 1, day + dayOffset);
  return toDateKey(local.getFullYear(), local.getMonth() + 1, local.getDate());
}

const MONTHS_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export function formatDateBn(dateKey: string): string {
  const [, m, d] = dateKey.split("-").map(Number);
  return `${d} ${MONTHS_BN[m - 1]}`;
}
