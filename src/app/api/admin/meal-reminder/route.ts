import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getAppSettings } from "@/lib/edit-permissions";
import { runMealReminders } from "@/lib/meal-reminder";
import SmsReminderLog from "@/models/SmsReminderLog";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const logs = await SmsReminderLog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const settings = await getAppSettings();

    return jsonSuccess({
      mealReminderEnabled: settings.mealReminderEnabled ?? true,
      smsLiveMode: settings.smsLiveMode ?? false,
      logs: logs.map((l) => ({
        id: l._id.toString(),
        userName: l.userName,
        phone: l.phone,
        targetDate: l.targetDate,
        missingMeals: l.missingMeals,
        message: l.message,
        status: l.status,
        providerResponse: l.providerResponse,
        createdAt: l.createdAt,
      })),
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
    if (typeof body.smsLiveMode === "boolean") {
      settings.smsLiveMode = body.smsLiveMode;
    }

    await settings.save();

    return jsonSuccess({
      mealReminderEnabled: settings.mealReminderEnabled,
      smsLiveMode: settings.smsLiveMode,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
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
