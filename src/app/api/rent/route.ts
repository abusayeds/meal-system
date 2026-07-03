import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireSession } from "@/lib/auth";
import { mergeRentFields, splitRentFields } from "@/lib/rent-fields";
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

    const { monthId, fields, fixedFields, otherFields } = await request.json();
    if (!monthId) return jsonError("monthId is required");

    let sanitized;
    if (Array.isArray(fixedFields) && Array.isArray(otherFields)) {
      sanitized = mergeRentFields(fixedFields, otherFields);
    } else if (Array.isArray(fields)) {
      const { fixedFields: fixed, otherFields: others } = splitRentFields(fields);
      sanitized = mergeRentFields(fixed, others);
    } else {
      return jsonError("fields array is required");
    }

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
