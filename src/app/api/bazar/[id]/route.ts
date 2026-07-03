import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import BazarEntry from "@/models/BazarEntry";
import { memberCanEditForMonth } from "@/lib/edit-permissions";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await connectDB();
    const { id } = await params;

    const bazar = await BazarEntry.findById(id);
    if (!bazar) return jsonError("Entry not found", 404);

    if (bazar.userId.toString() !== session.id && session.role !== "admin") {
      return jsonError("You can only edit your own entries", 403);
    }

    if (session.role !== "admin") {
      const allowed = await memberCanEditForMonth(
        session.id,
        bazar.monthId.toString()
      );
      if (!allowed) {
        return jsonError(
          "This month is locked for editing. Contact admin.",
          403
        );
      }
    }

    const { date, amount, description } = await request.json();

    if (date) bazar.date = date;
    if (description !== undefined) bazar.description = description;
    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        return jsonError("Invalid amount");
      }
      bazar.amount = Math.round(numAmount * 100) / 100;
    }

    await bazar.save();

    return jsonSuccess({
      bazar: {
        id: bazar._id.toString(),
        date: bazar.date,
        amount: bazar.amount,
        description: bazar.description,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    await connectDB();
    const { id } = await params;

    const bazar = await BazarEntry.findById(id);
    if (!bazar) return jsonError("Entry not found", 404);

    if (bazar.userId.toString() !== session.id && session.role !== "admin") {
      return jsonError("You can only delete your own entries", 403);
    }

    if (session.role !== "admin") {
      const allowed = await memberCanEditForMonth(
        session.id,
        bazar.monthId.toString()
      );
      if (!allowed) {
        return jsonError(
          "This month is locked for editing. Contact admin.",
          403
        );
      }
    }

    await BazarEntry.findByIdAndDelete(id);
    return jsonSuccess({ message: "Deleted" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}
