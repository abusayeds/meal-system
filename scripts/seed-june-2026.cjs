const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const USER_EMAILS = {
  Ashiq: "ashiq@gmail.com",
  Sabbir: "sabbir@gmail.com",
  Jamil: "jamil@gmail.com",
  Mahim: "mahim@gmail.com",
};

const JUNE_2026 = {
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
  bazar: [
    { day: 1, user: "Ashiq", amount: 240, description: "alu, piaz, dal, dim, kacha morich" },
    { day: 2, user: "Ashiq", amount: 1015, description: "mac, tel, dim, masalar jinis, sobji" },
    { day: 3, user: "Ashiq", amount: 280, description: "chal, piaz" },
    { day: 4, user: "Ashiq", amount: 110, description: "murgi, sobji" },
    { day: 5, user: "Ashiq", amount: 63, description: "sobji, dim" },
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
    { day: 24, user: "Mahim", amount: 220, description: "sobji, dim" },
    { day: 25, user: "Mahim", amount: 525, description: "murgi, chal, sobji" },
    { day: 28, user: "Mahim", amount: 400, description: "chal, mac, alu, piaz, sobji" },
    { day: 30, user: "Mahim", amount: 120, description: "chal" },
  ],
  meals: {
    Ashiq: buildMeals(43.5, [0.5, 0, 1], { 30: 0 }),
    Sabbir: buildMeals(62, [0.5, 1, 1], { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }),
    Jamil: buildMeals(55, [0.5, 1, 1], { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 26: 0, 27: 0, 28: 0, 29: 0, 30: 0 }),
    Mahim: (() => {
      const days = {};
      for (let day = 1; day <= 30; day++) days[day] = [0, 0, 0];
      for (let day = 8; day <= 18; day++) days[day] = [0, 1, 1]; // 11 days × 2 = 22
      return days;
    })(),
  },
};

function buildMeals(targetTotal, dailyPattern, zeroDays) {
  const days = {};
  const [b, l, d] = dailyPattern;
  const dayTotal = b + l + d;

  for (let day = 1; day <= 30; day++) {
    if (zeroDays[day] === 0) {
      days[day] = [0, 0, 0];
    } else {
      days[day] = [...dailyPattern];
    }
  }

  let total = 0;
  for (let day = 1; day <= 30; day++) {
    total += days[day][0] + days[day][1] + days[day][2];
  }

  const diff = Math.round((targetTotal - total) * 2) / 2;
  if (diff !== 0) {
    for (let day = 30; day >= 1; day--) {
      const sum = days[day][0] + days[day][1] + days[day][2];
      if (sum > 0) {
        days[day] = adjustDay(days[day], diff);
        break;
      }
    }
  }
  return days;
}

function buildMealsMahim() {
  const days = {};
  for (let day = 1; day <= 30; day++) days[day] = [0, 0, 0];
  for (let day = 8; day <= 18; day++) days[day] = [0, 1, 1];
  return days;
}

function adjustDay(day, diff) {
  const [b, l, d] = day;
  if (diff > 0) return [b, l, d + diff];
  const nd = Math.max(0, d + diff);
  const rem = diff - (nd - d);
  return [b, Math.max(0, l + rem), nd];
}

function toDateKey(day) {
  return `2026-06-${String(day).padStart(2, "0")}`;
}

function roundMoney(v) {
  return Math.round(v * 100) / 100;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

  const User = mongoose.model("User", new mongoose.Schema({ name: String, email: String, role: String, isActive: Boolean }));
  const Month = mongoose.model("Month", new mongoose.Schema({ year: Number, month: Number, label: String, isActive: Boolean }));
  const MealEntry = mongoose.model("MealEntry", new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, monthId: mongoose.Schema.Types.ObjectId, date: String, breakfast: Number, lunch: Number, dinner: Number }));
  const BazarEntry = mongoose.model("BazarEntry", new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, monthId: mongoose.Schema.Types.ObjectId, date: String, amount: Number, description: String }));
  const RentConfig = mongoose.model("RentConfig", new mongoose.Schema({ monthId: mongoose.Schema.Types.ObjectId, fields: [{ name: String, amount: Number }] }));

  const userMap = {};
  for (const [name, email] of Object.entries(USER_EMAILS)) {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }
    userMap[name] = user;
    console.log(`Found ${name}: ${user._id}`);
  }

  let month = await Month.findOne({ year: 2026, month: 6 });
  if (!month) {
    month = await Month.create({ year: 2026, month: 6, label: "June 2026", isActive: true });
    console.log("Created June 2026 month");
  } else {
    console.log("June 2026 month exists, clearing old data...");
    await MealEntry.deleteMany({ monthId: month._id });
    await BazarEntry.deleteMany({ monthId: month._id });
  }

  await RentConfig.findOneAndUpdate(
    { monthId: month._id },
    { monthId: month._id, fields: JUNE_2026.rentFields },
    { upsert: true }
  );
  console.log("Rent config set");

  for (const entry of JUNE_2026.bazar) {
    await BazarEntry.create({
      userId: userMap[entry.user]._id,
      monthId: month._id,
      date: toDateKey(entry.day),
      amount: entry.amount,
      description: entry.description,
    });
  }
  console.log(`Inserted ${JUNE_2026.bazar.length} bazar entries`);

  for (const [name, days] of Object.entries(JUNE_2026.meals)) {
    for (const [dayStr, [b, l, d]] of Object.entries(days)) {
      if (b + l + d === 0) continue;
      await MealEntry.create({
        userId: userMap[name]._id,
        monthId: month._id,
        date: toDateKey(Number(dayStr)),
        breakfast: b,
        lunch: l,
        dinner: d,
      });
    }
  }
  console.log("Inserted meal entries");

  // Verify totals
  const members = Object.entries(userMap).map(([name, u]) => ({ id: u._id.toString(), name }));
  const mealsByUser = {};
  const depositsByUser = {};
  let totalBazar = 0;

  for (const [name, user] of Object.entries(userMap)) {
    const meals = await MealEntry.find({ monthId: month._id, userId: user._id });
    mealsByUser[user._id.toString()] = meals.reduce((s, m) => s + m.breakfast + m.lunch + m.dinner, 0);
    const bazars = await BazarEntry.find({ monthId: month._id, userId: user._id });
    depositsByUser[user._id.toString()] = bazars.reduce((s, b) => s + b.amount, 0);
    totalBazar += depositsByUser[user._id.toString()];
  }

  const totalMeals = Object.values(mealsByUser).reduce((a, b) => a + b, 0);
  const mealRate = roundMoney(totalBazar / totalMeals);
  const totalRent = JUNE_2026.rentFields.reduce((s, f) => s + f.amount, 0);
  const rentShare = roundMoney(totalRent / 4);

  console.log("\n=== VERIFICATION ===");
  console.log(`Total Bazar: ${totalBazar} (sheet: 9532)`);
  console.log(`Total Meals: ${totalMeals} (sheet: 182.5)`);
  console.log(`Meal Rate: ${mealRate} (sheet: 52.23)`);
  console.log(`Total Rent: ${totalRent} (sheet: 22654)`);
  console.log(`Rent Share: ${rentShare} (sheet: 5663.5)`);

  for (const m of members) {
    const meals = mealsByUser[m.id];
    const deposit = depositsByUser[m.id];
    const consume = roundMoney(meals * mealRate);
    const foodDue = roundMoney(deposit - consume);
    const finalPayable = roundMoney(rentShare - foodDue);
    console.log(`\n${m.name}:`);
    console.log(`  Meals: ${meals} | Deposit: ${deposit} | Consume: ${consume} | Due: ${foodDue} | Final: ${finalPayable}`);
  }

  await mongoose.disconnect();
  console.log("\nDone! Select June 2026 in the app to verify.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
