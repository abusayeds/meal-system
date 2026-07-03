import { NextRequest } from "next/server";
import { runMealReminders } from "@/lib/meal-reminder";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const result = await runMealReminders();
    return jsonSuccess(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cron failed";
    return jsonError(msg, 500);
  }
}
