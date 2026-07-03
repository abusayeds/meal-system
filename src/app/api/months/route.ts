import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireSession } from "@/lib/auth";
import Month from "@/models/Month";
import {
  createMonthRecord,
  ensureCurrentMonthExists,
  getCurrentYearMonth,
} from "@/lib/month-setup";
import { runAutoLockForAllMonths } from "@/lib/month-lock";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET() {
  try {
    await requireSession();
    await connectDB();

    await ensureCurrentMonthExists();
    await runAutoLockForAllMonths();

    await Month.updateMany(
      { editLocked: { $exists: false } },
      { $set: { editLocked: false, editLockSource: "none" } }
    );

    const months = await Month.find().sort({ year: -1, month: -1 }).lean();
    const { year, month } = getCurrentYearMonth();
    const current = months.find((m) => m.year === year && m.month === month);

    return jsonSuccess({
      months: months.map((m) => ({
        id: m._id.toString(),
        year: m.year,
        month: m.month,
        label: m.label,
        isActive: m.isActive,
        editLocked: m.editLocked ?? false,
        editLockSource: m.editLockSource ?? "none",
        isCurrent: m.year === year && m.month === month,
      })),
      currentMonthId: current?._id.toString() ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { year, month } = await request.json();
    if (!year || !month) {
      return jsonError("Year and month are required");
    }

    const existing = await Month.findOne({ year, month });
    if (existing) {
      return jsonError("Month already exists");
    }

    const newMonth = await createMonthRecord(year, month);

    return jsonSuccess(
      {
        month: {
          id: newMonth._id.toString(),
          year: newMonth.year,
          month: newMonth.month,
          label: newMonth.label,
          isActive: newMonth.isActive,
        },
      },
      201
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}
