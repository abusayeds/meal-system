import { connectDB } from "@/lib/db";
import { getAppSettings } from "@/lib/edit-permissions";
import { APP_NAME } from "@/lib/brand";
import { formatDateBn, getDhakaDateKey } from "@/lib/dhaka-date";
import { sendBulkSmsBd } from "@/lib/sms";
import MealEntry, { IMealEntry } from "@/models/MealEntry";
import Month from "@/models/Month";
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

export interface ReminderDetail {
  userName: string;
  phone: string;
  missingMeals: string[];
  message: string;
  status: "sent" | "failed" | "skipped";
  providerResponse?: string;
}

export interface ReminderRunResult {
  targetDate: string;
  checked: number;
  reminders: number;
  sent: number;
  failed: number;
  skipped: number;
  details: ReminderDetail[];
}

const emptyResult = (targetDate: string): ReminderRunResult => ({
  targetDate,
  checked: 0,
  reminders: 0,
  sent: 0,
  failed: 0,
  skipped: 0,
  details: [],
});

export async function runMealReminders(
  options?: { targetDate?: string; force?: boolean }
): Promise<ReminderRunResult> {
  await connectDB();

  const targetDate = options?.targetDate ?? getDhakaDateKey(-1);
  const settings = await getAppSettings();

  if (!settings.mealReminderEnabled && !options?.force) {
    return emptyResult(targetDate);
  }

  const [year, month] = targetDate.split("-").map(Number);

  const monthDoc = await Month.findOne({ year, month, isActive: true });
  if (!monthDoc) {
    return emptyResult(targetDate);
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

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let reminders = 0;
  const details: ReminderDetail[] = [];

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
      details.push({
        userName: member.name,
        phone: "",
        missingMeals: missing,
        message,
        status: "skipped",
        providerResponse: "No phone number",
      });
      continue;
    }

    const result = await sendBulkSmsBd(phone, message);
    if (result.ok) {
      sent++;
      details.push({
        userName: member.name,
        phone,
        missingMeals: missing,
        message,
        status: "sent",
        providerResponse: result.response,
      });
    } else {
      failed++;
      details.push({
        userName: member.name,
        phone,
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
    failed,
    skipped,
    details,
  };
}
