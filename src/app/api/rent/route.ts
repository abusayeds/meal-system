import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireSession } from "@/lib/auth";
import RentConfig from "@/models/RentConfig";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await requireSession();
    await connectDB();

    const monthId = request.nextUrl.searchParams.get("monthId");
    if (!monthId) return jsonError("monthId is required");

    const config = await RentConfig.findOne({ monthId }).lean();
    return jsonSuccess({ fields: config?.fields ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { monthId, fields } = await request.json();
    if (!monthId || !Array.isArray(fields)) {
      return jsonError("monthId and fields array are required");
    }

    const sanitized = fields.map(
      (f: { name: string; amount: number; _id?: string }) => ({
        name: String(f.name).trim(),
        amount: Math.max(0, Number(f.amount) || 0),
      })
    );

    const config = await RentConfig.findOneAndUpdate(
      { monthId },
      { monthId, fields: sanitized },
      { upsert: true, new: true }
    );

    return jsonSuccess({ fields: config.fields });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}
