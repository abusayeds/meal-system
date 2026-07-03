import Month from "@/models/Month";

export type EditLockSource = "none" | "manual" | "auto";

export function isMonthPastAutoLockThreshold(year: number, month: number) {
  const lastDay = new Date(year, month, 0);
  const lockAfter = new Date(lastDay);
  lockAfter.setDate(lockAfter.getDate() + 10);
  lockAfter.setHours(23, 59, 59, 999);
  return new Date() > lockAfter;
}

export async function applyAutoLockIfNeeded(month: {
  _id: { toString(): string };
  year: number;
  month: number;
  editLocked?: boolean;
  editLockSource?: EditLockSource;
}) {
  const source = month.editLockSource ?? "none";
  if (source !== "none" || month.editLocked) {
    return month;
  }

  if (!isMonthPastAutoLockThreshold(month.year, month.month)) {
    return month;
  }

  await Month.findByIdAndUpdate(month._id, {
    $set: { editLocked: true, editLockSource: "auto" },
  });

  return { ...month, editLocked: true, editLockSource: "auto" as const };
}

export async function runAutoLockForAllMonths() {
  const months = await Month.find().lean();
  for (const month of months) {
    await applyAutoLockIfNeeded(month);
  }
}
