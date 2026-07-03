import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import BazarEntry from "@/models/BazarEntry";
import { memberCanEditForMonth } from "@/lib/edit-permissions";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    await connectDB();

    const monthId = request.nextUrl.searchParams.get("monthId");
    const requestedUserId = request.nextUrl.searchParams.get("userId");

    if (!monthId) return jsonError("monthId is required");

    if (
      requestedUserId &&
      requestedUserId !== session.id &&
      session.role !== "admin"
    ) {
      return jsonError("You can only view your own bazar entries", 403);
    }

    const userId = requestedUserId || session.id;

    const bazars = await BazarEntry.find({ monthId, userId })
      .sort({ date: -1 })
      .lean();

    return jsonSuccess({
      bazars: bazars.map((b) => ({
        id: b._id.toString(),
        date: b.date,
        amount: b.amount,
        description: b.description,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await connectDB();

    const { monthId, date, amount, description, userId: bodyUserId } =
      await request.json();

    if (!monthId || !date || amount === undefined) {
      return jsonError("monthId, date and amount are required");
    }

    let targetUserId = session.id;
    if (bodyUserId && bodyUserId !== session.id) {
      if (session.role !== "admin") {
        return jsonError("You can only add your own bazar entries", 403);
      }
      targetUserId = bodyUserId;
    } else if (session.role !== "admin") {
      const allowed = await memberCanEditForMonth(session.id, monthId);
      if (!allowed) {
        return jsonError(
          "This month is locked for editing. Contact admin.",
          403
        );
      }
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return jsonError("Invalid amount");
    }

    const bazar = await BazarEntry.create({
      userId: targetUserId,
      monthId,
      date,
      amount: Math.round(numAmount * 100) / 100,
      description: description || "",
    });

    return jsonSuccess(
      {
        bazar: {
          id: bazar._id.toString(),
          date: bazar.date,
          amount: bazar.amount,
          description: bazar.description,
        },
      },
      201
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}
