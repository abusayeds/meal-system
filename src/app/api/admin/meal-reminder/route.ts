import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAppSettings } from "@/lib/edit-permissions";
import { isBulkSmsConfigured } from "@/lib/sms";
import { runMealReminders } from "@/lib/meal-reminder";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getAppSettings();

    return jsonSuccess({
      mealReminderEnabled: settings.mealReminderEnabled ?? true,
      bulksmsConfigured: isBulkSmsConfigured(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const settings = await getAppSettings();

    if (typeof body.mealReminderEnabled === "boolean") {
      settings.mealReminderEnabled = body.mealReminderEnabled;
    }

    await settings.save();

    return jsonSuccess({
      mealReminderEnabled: settings.mealReminderEnabled,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    if (!isBulkSmsConfigured()) {
      return jsonError(
        "BULKSMS_API_KEY এবং BULKSMS_SENDER_ID env-এ set করুন",
        400
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = await runMealReminders({
      targetDate: body.targetDate,
      force: true,
    });
    return jsonSuccess(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 500);
  }
}
