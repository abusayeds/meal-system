export interface MealCounts {
  breakfast: number;
  lunch: number;
  dinner: number;
}

export interface UserSettlement {
  userId: string;
  name: string;
  totalMeals: number;
  deposit: number;
  consume: number;
  foodDue: number;
  rentShare: number;
  finalPayable: number;
}

export interface MonthSummary {
  totalBazar: number;
  totalMeals: number;
  mealRate: number;
  totalRent: number;
  memberCount: number;
  rentShare: number;
  users: UserSettlement[];
}

export function getDayMealTotal(meal: MealCounts): number {
  return meal.breakfast + meal.lunch + meal.dinner;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateMonthSummary(params: {
  members: { id: string; name: string }[];
  mealsByUser: Record<string, number>;
  depositsByUser: Record<string, number>;
  totalBazar: number;
  totalRent: number;
}): MonthSummary {
  const { members, mealsByUser, depositsByUser, totalBazar, totalRent } =
    params;

  const totalMeals = members.reduce(
    (sum, m) => sum + (mealsByUser[m.id] ?? 0),
    0
  );

  const mealRate = totalMeals > 0 ? totalBazar / totalMeals : 0;

  const memberCount = members.length || 1;
  const rentShare = roundMoney(totalRent / memberCount);

  const users: UserSettlement[] = members.map((member) => {
    const totalMealsForUser = mealsByUser[member.id] ?? 0;
    const deposit = roundMoney(depositsByUser[member.id] ?? 0);
    const consume = roundMoney(totalMealsForUser * mealRate);
    const foodDue = roundMoney(deposit - consume);
    const finalPayable = roundMoney(rentShare - foodDue);

    return {
      userId: member.id,
      name: member.name,
      totalMeals: roundMoney(totalMealsForUser),
      deposit,
      consume,
      foodDue,
      rentShare,
      finalPayable,
    };
  });

  return {
    totalBazar: roundMoney(totalBazar),
    totalMeals: roundMoney(totalMeals),
    mealRate,
    totalRent: roundMoney(totalRent),
    memberCount,
    rentShare,
    users,
  };
}
