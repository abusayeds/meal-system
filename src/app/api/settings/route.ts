import { NextRequest } from "next/server";
import { requireAdmin, requireSession } from "@/lib/auth";
import { getAppSettings } from "@/lib/edit-permissions";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET() {
  try {
    await requireSession();
    const settings = await getAppSettings();
    return jsonSuccess({ lockAllMemberEdits: settings.lockAllMemberEdits });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const { lockAllMemberEdits } = await request.json();

    if (typeof lockAllMemberEdits !== "boolean") {
      return jsonError("lockAllMemberEdits must be a boolean");
    }

    const settings = await getAppSettings();
    settings.lockAllMemberEdits = lockAllMemberEdits;
    await settings.save();

    return jsonSuccess({ lockAllMemberEdits: settings.lockAllMemberEdits });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}
