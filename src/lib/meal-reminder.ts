import { connectDB } from "@/lib/db";
import { getAppSettings } from "@/lib/edit-permissions";
import { APP_NAME } from "@/lib/brand";
import { formatDateBn, getDhakaDateKey } from "@/lib/dhaka-date";
import { sendBulkSmsBd } from "@/lib/sms";
import MealEntry, { IMealEntry } from "@/models/MealEntry";
import Month from "@/models/Month";
import SmsReminderLog from "@/models/SmsReminderLog";
import User from "@/models/User";

type MealField = "breakfast" | "lunch" | "dinner";

const MEAL_LABELS_BN: Record<MealField, string> = {
  breakfast: "ব্রেকফাস্ট",
  lunch: "লাঞ্চ",
  dinner: "ডিনার",
};

function isMealRecorded(
  entry: IMealEntry | null,
  field: MealField
): boolean {
  if (!entry) return false;
  const flag = entry[`${field}Set` as keyof IMealEntry];
  if (flag === true) return true;
  if (flag === false) return false;
  return (entry[field] as number) > 0;
}

export function getMissingMeals(
  entry: IMealEntry | null
): MealField[] {
  const fields: MealField[] = ["breakfast", "lunch", "dinner"];
  return fields.filter((f) => !isMealRecorded(entry, f));
}

export function buildReminderMessage(
  name: string,
  dateKey: string,
  missing: MealField[]
): string {
  const dateLabel = formatDateBn(dateKey);
  const meals = missing.map((m) => MEAL_LABELS_BN[m]).join(", ");
  return `প্রিয় ${name}, আপনি ${dateLabel} তারিখে ${meals} ${APP_NAME}-এ meal update করেননি। দয়া করে app-এ এন্ট্রি দিন। ধন্যবাদ।`;
}

export interface ReminderRunResult {
  targetDate: string;
  checked: number;
  reminders: number;
  sent: number;
  test: number;
  failed: number;
  skipped: number;
  mode: "live" | "test";
}

export async function runMealReminders(
  options?: { targetDate?: string; force?: boolean }
): Promise<ReminderRunResult> {
  await connectDB();

  const settings = await getAppSettings();
  if (!settings.mealReminderEnabled && !options?.force) {
    return {
      targetDate: options?.targetDate ?? getDhakaDateKey(-1),
      checked: 0,
      reminders: 0,
      sent: 0,
      test: 0,
      failed: 0,
      skipped: 0,
      mode: settings.smsLiveMode ? "live" : "test",
    };
  }

  const targetDate = options?.targetDate ?? getDhakaDateKey(-1);
  const [year, month] = targetDate.split("-").map(Number);

  const monthDoc = await Month.findOne({ year, month, isActive: true });
  if (!monthDoc) {
    return {
      targetDate,
      checked: 0,
      reminders: 0,
      sent: 0,
      test: 0,
      failed: 0,
      skipped: 0,
      mode: settings.smsLiveMode ? "live" : "test",
    };
  }

  const members = await User.find({
    role: "member",
    isActive: true,
  })
    .select("_id name phone")
    .lean();

  const meals = await MealEntry.find({
    monthId: monthDoc._id,
    date: targetDate,
  }).lean();

  const mealByUser = new Map(
    meals.map((m) => [m.userId.toString(), m])
  );

  const liveMode = settings.smsLiveMode === true;
  let sent = 0;
  let test = 0;
  let failed = 0;
  let skipped = 0;
  let reminders = 0;

  for (const member of members) {
    const uid = member._id.toString();
    const entry = mealByUser.get(uid) ?? null;
    const missing = getMissingMeals(entry as IMealEntry | null);

    if (missing.length === 0) continue;

    reminders++;
    const message = buildReminderMessage(member.name, targetDate, missing);
    const phone = member.phone?.trim() ?? "";

    if (!phone) {
      skipped++;
      await SmsReminderLog.create({
        userId: member._id,
        userName: member.name,
        phone: "",
        targetDate,
        missingMeals: missing,
        message,
        status: "skipped",
        providerResponse: "No phone number",
      });
      continue;
    }

    if (!liveMode) {
      test++;
      await SmsReminderLog.create({
        userId: member._id,
        userName: member.name,
        phone,
        targetDate,
        missingMeals: missing,
        message,
        status: "test",
        providerResponse: "Test mode — SMS not sent",
      });
      continue;
    }

    const result = await sendBulkSmsBd(phone, message);
    if (result.ok) {
      sent++;
      await SmsReminderLog.create({
        userId: member._id,
        userName: member.name,
        phone,
        targetDate,
        missingMeals: missing,
        message,
        status: "sent",
        providerResponse: result.response,
      });
    } else {
      failed++;
      await SmsReminderLog.create({
        userId: member._id,
        userName: member.name,
        phone,
        targetDate,
        missingMeals: missing,
        message,
        status: "failed",
        providerResponse: result.response,
      });
    }
  }

  return {
    targetDate,
    checked: members.length,
    reminders,
    sent,
    test,
    failed,
    skipped,
    mode: liveMode ? "live" : "test",
  };
}
