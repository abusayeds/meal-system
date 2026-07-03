import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireSession } from "@/lib/auth";
import { getMonthData } from "@/lib/month-service";
import Month from "@/models/Month";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
    const { id } = await params;
    const data = await getMonthData(id);

    if (!data) return jsonError("Month not found", 404);
    return jsonSuccess(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (typeof body.editLocked !== "boolean") {
      return jsonError("editLocked must be a boolean");
    }

    const month = await Month.findByIdAndUpdate(
      id,
      {
        $set: {
          editLocked: body.editLocked,
          editLockSource: "manual",
        },
      },
      { new: true }
    ).lean();

    if (!month) return jsonError("Month not found", 404);

    return jsonSuccess({
      month: {
        id: month._id.toString(),
        year: month.year,
        month: month.month,
        label: month.label,
        isActive: month.isActive,
        editLocked: month.editLocked,
        editLockSource: month.editLockSource ?? "none",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}
