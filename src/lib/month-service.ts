import { connectDB } from "@/lib/db";
import User from "@/models/User";
import MealEntry from "@/models/MealEntry";
import BazarEntry from "@/models/BazarEntry";
import RentConfig from "@/models/RentConfig";
import Month from "@/models/Month";
import { applyAutoLockIfNeeded } from "@/lib/month-lock";
import { calculateMonthSummary, getDayMealTotal } from "@/lib/calculations";
import { getDaysInMonth, toDateKey } from "@/lib/utils";

function getPopulatedUser(ref: unknown): { id: string; name: string } {
  if (
    ref &&
    typeof ref === "object" &&
    "_id" in ref &&
    "name" in ref &&
    typeof (ref as { name: unknown }).name === "string"
  ) {
    const obj = ref as { _id: { toString(): string }; name: string };
    return { id: obj._id.toString(), name: obj.name };
  }

  return { id: String(ref), name: "Unknown" };
}

export async function getMonthData(monthId: string) {
  await connectDB();

  const monthDoc = await Month.findById(monthId);
  if (!monthDoc) return null;

  const monthLocked = await applyAutoLockIfNeeded({
    _id: monthDoc._id,
    year: monthDoc.year,
    month: monthDoc.month,
    editLocked: monthDoc.editLocked,
    editLockSource: monthDoc.editLockSource,
  });

  const meals = await MealEntry.find({ monthId }).lean();
  const bazars = await BazarEntry.find({ monthId })
    .populate("userId", "name")
    .sort({ date: 1 })
    .lean();

  const members = await getMembersForMonth(meals, bazars);

  const rentConfig = await RentConfig.findOne({ monthId }).lean();

  const mealsByUser: Record<string, number> = {};
  const mealsByDate: Record<
    string,
    Record<string, { breakfast: number; lunch: number; dinner: number }>
  > = {};

  for (const entry of meals) {
    const uid = entry.userId.toString();
    const dayTotal = getDayMealTotal({
      breakfast: entry.breakfast,
      lunch: entry.lunch,
      dinner: entry.dinner,
    });
    mealsByUser[uid] = (mealsByUser[uid] ?? 0) + dayTotal;

    if (!mealsByDate[entry.date]) mealsByDate[entry.date] = {};
    mealsByDate[entry.date][uid] = {
      breakfast: entry.breakfast,
      lunch: entry.lunch,
      dinner: entry.dinner,
    };
  }

  const depositsByUser: Record<string, number> = {};
  const bazarsByDate: Record<
    string,
    { userId: string; userName: string; amount: number; description: string; id: string }[]
  > = {};

  let totalBazar = 0;
  for (const entry of bazars) {
    const { id: uid, name: userName } = getPopulatedUser(entry.userId);

    depositsByUser[uid] = (depositsByUser[uid] ?? 0) + entry.amount;
    totalBazar += entry.amount;

    if (!bazarsByDate[entry.date]) bazarsByDate[entry.date] = [];
    bazarsByDate[entry.date].push({
      id: entry._id.toString(),
      userId: uid,
      userName,
      amount: entry.amount,
      description: entry.description,
    });
  }

  const totalRent =
    rentConfig?.fields?.reduce((sum, f) => sum + f.amount, 0) ?? 0;

  const summary = calculateMonthSummary({
    members: members.map((u) => ({ id: u.id, name: u.name })),
    mealsByUser,
    depositsByUser,
    totalBazar,
    totalRent,
  });

  const daysInMonth = getDaysInMonth(monthDoc.year, monthDoc.month);
  const calendar = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = toDateKey(monthDoc.year, monthDoc.month, day);
    return {
      day,
      date,
      weekday: new Date(monthDoc.year, monthDoc.month - 1, day).toLocaleDateString(
        "en-US",
        { weekday: "short" }
      ),
      meals: mealsByDate[date] ?? {},
      bazars: bazarsByDate[date] ?? [],
    };
  });

  return {
    month: {
      id: monthDoc._id.toString(),
      year: monthDoc.year,
      month: monthDoc.month,
      label: monthDoc.label,
      isActive: monthDoc.isActive,
      editLocked: monthLocked.editLocked ?? false,
      editLockSource: monthLocked.editLockSource ?? "none",
    },
    members: members.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
    })),
    rentFields: rentConfig?.fields ?? [],
    totalRent,
    calendar,
    meals,
    bazars: bazars.map((b) => {
      const user = getPopulatedUser(b.userId);
      return {
        id: b._id.toString(),
        userId: user.id,
        userName: user.name,
        date: b.date,
        amount: b.amount,
        description: b.description,
      };
    }),
    summary,
  };
}

interface MonthMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

/** Active members + former members who have meal/bazar data in this month. */
async function getMembersForMonth(
  meals: { userId: { toString(): string } }[],
  bazars: { userId: unknown }[]
): Promise<MonthMember[]> {
  const activeMembers = await User.find({ isActive: true, role: "member" })
    .select("_id name email role isActive")
    .lean();

  const participantIds = new Set<string>();
  for (const entry of meals) {
    participantIds.add(entry.userId.toString());
  }
  for (const entry of bazars) {
    participantIds.add(getPopulatedUser(entry.userId).id);
  }

  const activeIds = new Set(activeMembers.map((m) => m._id.toString()));
  const formerIds = [...participantIds].filter((id) => !activeIds.has(id));

  const formerMembers =
    formerIds.length > 0
      ? await User.find({ _id: { $in: formerIds }, role: "member" })
          .select("_id name email role isActive")
          .lean()
      : [];

  const byId = new Map<string, MonthMember>();
  for (const m of [...activeMembers, ...formerMembers]) {
    byId.set(m._id.toString(), {
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      role: m.role,
      isActive: m.isActive,
    });
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}
