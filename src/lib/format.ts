export function formatCurrency(amount: number) {
  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Meal rate — full precision like Excel (no rounding to 2 decimals) */
export function formatMealRate(rate: number) {
  if (!rate) return "৳0";
  const str = rate.toFixed(11).replace(/\.?0+$/, "");
  return `৳${str}`;
}

export function formatMeal(value: number) {
  return value % 1 === 0 ? value.toString() : value.toFixed(1);
}

/** 0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9 */
export const MEAL_OPTIONS = [0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const MEAL_OPTION_SET = new Set(MEAL_OPTIONS);

export function getMealSelectOptions(current?: number) {
  if (current !== undefined && !MEAL_OPTION_SET.has(current)) {
    return [...MEAL_OPTIONS, current].sort((a, b) => a - b);
  }
  return MEAL_OPTIONS;
}

export function sanitizeMealValue(v: unknown) {
  const num = Number(v);
  if (isNaN(num) || num <= 0) return 0;
  if (num <= 0.5) return 0.5;
  const rounded = Math.round(num);
  if (rounded >= 1 && rounded <= 9) return rounded;
  return 9;
}

export function isValidMealOption(value: number) {
  return MEAL_OPTION_SET.has(value);
}
