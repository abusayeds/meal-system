import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import MealEntry from "@/models/MealEntry";
import { memberCanEditForMonth } from "@/lib/edit-permissions";
import { sanitizeMealValue } from "@/lib/format";
import { jsonError, jsonSuccess } from "@/lib/utils";

const MEAL_FIELDS = ["breakfast", "lunch", "dinner"] as const;
type MealField = (typeof MEAL_FIELDS)[number];

function isMealField(v: unknown): v is MealField {
  return typeof v === "string" && MEAL_FIELDS.includes(v as MealField);
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    await connectDB();

    const monthId = request.nextUrl.searchParams.get("monthId");
    const requestedUserId = request.nextUrl.searchParams.get("userId");

    if (!monthId) return jsonError("monthId is required");

    if (
      requestedUserId &&
      requestedUserId !== session.id &&
      session.role !== "admin"
    ) {
      return jsonError("You can only view your own meals", 403);
    }

    const userId = requestedUserId || session.id;

    const meals = await MealEntry.find({ monthId, userId })
      .sort({ date: 1 })
      .lean();

    return jsonSuccess({
      meals: meals.map((m) => ({
        id: m._id.toString(),
        date: m.date,
        breakfast: m.breakfast,
        lunch: m.lunch,
        dinner: m.dinner,
        breakfastSet: m.breakfastSet ?? false,
        lunchSet: m.lunchSet ?? false,
        dinnerSet: m.dinnerSet ?? false,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await connectDB();

    const {
      monthId,
      date,
      breakfast,
      lunch,
      dinner,
      userId: bodyUserId,
      field,
      value,
    } = await request.json();

    if (!monthId || !date) {
      return jsonError("monthId and date are required");
    }

    let targetUserId = session.id;
    if (bodyUserId && bodyUserId !== session.id) {
      if (session.role !== "admin") {
        return jsonError("You can only update your own meals", 403);
      }
      targetUserId = bodyUserId;
    } else if (session.role !== "admin") {
      const allowed = await memberCanEditForMonth(session.id, monthId);
      if (!allowed) {
        return jsonError(
          "This month is locked for editing. Contact admin.",
          403
        );
      }
    }

    const existing = await MealEntry.findOne({
      userId: targetUserId,
      monthId,
      date,
    });

    const update: Record<string, unknown> = {
      userId: targetUserId,
      monthId,
      date,
      breakfast: existing?.breakfast ?? 0,
      lunch: existing?.lunch ?? 0,
      dinner: existing?.dinner ?? 0,
      breakfastSet: existing?.breakfastSet ?? false,
      lunchSet: existing?.lunchSet ?? false,
      dinnerSet: existing?.dinnerSet ?? false,
    };

    if (isMealField(field)) {
      const mealValue =
        value !== undefined
          ? sanitizeMealValue(value)
          : sanitizeMealValue(
              field === "breakfast"
                ? breakfast
                : field === "lunch"
                  ? lunch
                  : dinner
            );
      update[field] = mealValue;
      update[`${field}Set`] = true;
    } else {
      if (breakfast !== undefined) {
        update.breakfast = sanitizeMealValue(breakfast);
        update.breakfastSet = true;
      }
      if (lunch !== undefined) {
        update.lunch = sanitizeMealValue(lunch);
        update.lunchSet = true;
      }
      if (dinner !== undefined) {
        update.dinner = sanitizeMealValue(dinner);
        update.dinnerSet = true;
      }
    }

    const meal = await MealEntry.findOneAndUpdate(
      { userId: targetUserId, monthId, date },
      update,
      { upsert: true, new: true }
    );

    return jsonSuccess({
      meal: {
        id: meal._id.toString(),
        date: meal.date,
        breakfast: meal.breakfast,
        lunch: meal.lunch,
        dinner: meal.dinner,
        breakfastSet: meal.breakfastSet,
        lunchSet: meal.lunchSet,
        dinnerSet: meal.dinnerSet,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 401);
  }
}
