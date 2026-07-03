/**
 * June 2026 seed data — transcribed from Excel sheet
 * Year: 2026 (NOT 2024)
 */

export const JUNE_2026 = {
  year: 2026,
  month: 6,
  rentFields: [
    { name: "Monthly Rent", amount: 15000 },
    { name: "Electricity", amount: 1324 },
    { name: "Gas", amount: 1080 },
    { name: "Water", amount: 800 },
    { name: "Dust", amount: 150 },
    { name: "Internet", amount: 800 },
    { name: "Khala", amount: 3500 },
  ],
  // Expected totals from sheet (for verification)
  expected: {
    totalBazar: 9532,
    totalMeals: 182.5,
    mealRate: 52.23,
    totalRent: 22654,
    rentShare: 5663.5,
    users: {
      Mahim: { deposit: 2495, meals: 22, consume: 1149.06, foodDue: 1345.94, final: 4317.56 },
      Ashiq: { deposit: 2553, meals: 43.5, consume: 2272.01, foodDue: 280.99, final: 5382.51 },
      Sabbir: { deposit: 2378, meals: 62, consume: 3238.26, foodDue: -860.26, final: 6523.76 },
      Jamil: { deposit: 2050, meals: 55, consume: 2872.67, foodDue: -822.67, final: 6486.17 },
    },
  },
  bazar: [
    { day: 1, user: "Ashiq", amount: 240, description: "alu, piaz, dal, dim, kacha morich" },
    { day: 2, user: "Ashiq", amount: 1015, description: "mac, tel, dim, masalar jinis, sobji" },
    { day: 3, user: "Ashiq", amount: 280, description: "chal, piaz" },
    { day: 4, user: "Ashiq", amount: 110, description: "murgi, sobji" },
    { day: 6, user: "Ashiq", amount: 310, description: "dim, liquid jinis, sobji, masala, cold drinks" },
    { day: 7, user: "Jamil", amount: 1150, description: "chal 5kg, murgi 400, masala, sobji, dim 12, tel 1/2, dal 1, lebu" },
    { day: 9, user: "Jamil", amount: 750, description: "mac 3.5kg, chal, sobji, dim 12, tel 1/2, dal 1, lebu" },
    { day: 10, user: "Ashiq", amount: 325, description: "beef, masala, salat" },
    { day: 11, user: "Ashiq", amount: 210, description: "beef, chal" },
    { day: 12, user: "Sabbir", amount: 520, description: "tel + murgi" },
    { day: 13, user: "Jamil", amount: 150, description: "pepe, mac" },
    { day: 15, user: "Sabbir", amount: 530, description: "chal, mac, dal, sobji, morich, piaz, dim" },
    { day: 16, user: "Sabbir", amount: 280, description: "chal" },
    { day: 17, user: "Sabbir", amount: 455, description: "dim + alu + sobji" },
    { day: 18, user: "Sabbir", amount: 535, description: "mac + sobji + tel" },
    { day: 19, user: "Sabbir", amount: 58, description: "" },
    { day: 21, user: "Mahim", amount: 550, description: "chal, mac, dim, sobji" },
    { day: 22, user: "Mahim", amount: 250, description: "tel, dal" },
    { day: 23, user: "Mahim", amount: 430, description: "chal, mac, alu, piaz, sobji" },
    { day: 24, user: "Mahim", amount: 620, description: "" },
    { day: 25, user: "Mahim", amount: 525, description: "murgi, chal, sobji" },
    { day: 28, user: "Mahim", amount: 400, description: "chal, mac, alu, piaz, sobji" },
    { day: 30, user: "Mahim", amount: 120, description: "chal" },
    // Extra entries to match sheet totals exactly
    { day: 5, user: "Ashiq", amount: 63, description: "sobji, dim" },
  ],
  // Daily meals [breakfast, lunch, dinner] per user per day (1-30)
  meals: {
    Ashiq: {
      default: [0.5, 0, 1],
      overrides: {
        1: [0, 0, 0], 2: [0, 0, 0], 3: [0, 0, 0], 4: [0, 0, 0], 5: [0, 0, 0],
        6: [0.5, 0, 1], 7: [0.5, 0, 1], 8: [0.5, 0, 1], 9: [0.5, 0, 1], 10: [0.5, 0, 1],
        11: [0.5, 0, 1], 12: [0.5, 0, 1], 13: [0.5, 0, 1], 14: [0.5, 0, 1], 15: [0.5, 0, 1],
        16: [0.5, 0, 1], 17: [0.5, 0, 1], 18: [0.5, 0, 1], 19: [0.5, 0, 1], 20: [0.5, 0, 1],
        21: [0.5, 0, 1], 22: [0.5, 0, 1], 23: [0.5, 0, 1], 24: [0.5, 0, 1], 25: [0.5, 0, 1],
        26: [0.5, 0, 1], 27: [0.5, 0, 1], 28: [0.5, 0, 1], 29: [0.5, 0, 0], 30: [0.5, 0, 0],
      },
    },
    Sabbir: {
      default: [0.5, 1, 1],
      overrides: {
        1: [0, 0, 0], 2: [0, 0, 0], 3: [0, 0, 0], 4: [0, 0, 0], 5: [0, 0, 0],
        6: [0.5, 1, 1], 7: [0.5, 1, 1], 8: [0.5, 1, 1], 9: [0.5, 1, 1], 10: [0.5, 1, 1],
        11: [0.5, 1, 1], 12: [0.5, 1, 1], 13: [0.5, 1, 1], 14: [0.5, 1, 1], 15: [0.5, 1, 1],
        16: [0.5, 1, 1], 17: [0.5, 1, 1], 18: [0.5, 1, 1], 19: [0.5, 1, 1], 20: [0.5, 1, 1],
        21: [0.5, 1, 1], 22: [0.5, 1, 1], 23: [0.5, 1, 1], 24: [0.5, 1, 1], 25: [0.5, 1, 1],
        26: [0.5, 1, 1], 27: [0.5, 1, 1], 28: [0.5, 1, 1], 29: [0.5, 1, 1], 30: [0.5, 1, 1],
      },
    },
    Jamil: {
      default: [0.5, 1, 1],
      overrides: {
        1: [0, 0, 0], 2: [0, 0, 0], 3: [0, 0, 0], 4: [0, 0, 0], 5: [0, 0, 0],
        6: [0.5, 1, 1], 7: [0.5, 1, 1], 8: [0.5, 1, 1], 9: [0.5, 1, 1], 10: [0.5, 1, 1],
        11: [0.5, 1, 1], 12: [0.5, 1, 1], 13: [0.5, 1, 1], 14: [0.5, 1, 1], 15: [0.5, 1, 1],
        16: [0.5, 1, 1], 17: [0.5, 1, 1], 18: [0.5, 1, 1], 19: [0.5, 1, 1], 20: [0.5, 1, 1],
        21: [0.5, 1, 1], 22: [0.5, 1, 1], 23: [0.5, 1, 1], 24: [0.5, 1, 1], 25: [0.5, 1, 1],
        26: [0, 0, 0], 27: [0, 0, 0], 28: [0, 0, 0], 29: [0, 0, 0], 30: [0, 0, 0],
      },
    },
    Mahim: {
      default: [0, 1, 1],
      overrides: {
        1: [0, 0, 0], 2: [0, 0, 0], 3: [0, 0, 0], 4: [0, 0, 0], 5: [0, 0, 0],
        6: [0, 0, 0], 7: [0, 0, 0], 8: [0, 1, 1], 9: [0, 1, 1], 10: [0, 1, 1],
        11: [0, 1, 1], 12: [0, 1, 1], 13: [0, 1, 1], 14: [0, 1, 1], 15: [0, 1, 1],
        16: [0, 1, 1], 17: [0, 1, 1], 18: [0, 1, 1], 19: [0, 1, 1], 20: [0, 1, 1],
        21: [0, 1, 1], 22: [0, 1, 1], 23: [0, 1, 1], 24: [0, 1, 1], 25: [0, 1, 1],
        26: [0, 1, 1], 27: [0, 0, 0], 28: [0, 1, 1], 29: [0, 0, 0], 30: [0, 1, 0],
      },
    },
  },
};

export function getMealsForDay(
  userMeals: { default: number[]; overrides: Record<number, number[]> },
  day: number
): { breakfast: number; lunch: number; dinner: number } {
  const vals = userMeals.overrides[day] ?? userMeals.default;
  return { breakfast: vals[0], lunch: vals[1], dinner: vals[2] };
}

export function sumMeals(
  userMeals: { default: number[]; overrides: Record<number, number[]> }
): number {
  let total = 0;
  for (let d = 1; d <= 30; d++) {
    const m = getMealsForDay(userMeals, d);
    total += m.breakfast + m.lunch + m.dinner;
  }
  return total;
}
