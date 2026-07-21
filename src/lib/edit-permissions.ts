import { connectDB } from "@/lib/db";
import { applyAutoLockIfNeeded } from "@/lib/month-lock";
import AppSettings from "@/models/AppSettings";
import Month from "@/models/Month";
import User from "@/models/User";

export async function getAppSettings() {
  await connectDB();
  let settings = await AppSettings.findOne();
  if (!settings) {
    settings = await AppSettings.create({ lockAllMemberEdits: false });
  }
  return settings;
}

export async function memberCanEdit(userId: string): Promise<boolean> {
  await connectDB();

  const user = await User.findById(userId)
    .select("role canEditMealsBazar isActive")
    .lean();

  if (!user || user.role === "admin") return true;
  if (!user.isActive) return false;

  const settings = await getAppSettings();
  if (settings.lockAllMemberEdits) return false;

  return user.canEditMealsBazar ?? true;
}

export async function memberCanEditForMonth(
  userId: string,
  monthId: string
): Promise<boolean> {
  if (!(await memberCanEdit(userId))) return false;

  await connectDB();

  let month = await Month.findById(monthId).lean();
  if (!month) return false;

  const locked = await applyAutoLockIfNeeded({
    _id: month._id,
    year: month.year,
    month: month.month,
    editLocked: month.editLocked,
    editLockSource: month.editLockSource,
  });

  return !locked.editLocked;
}
