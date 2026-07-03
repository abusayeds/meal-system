const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

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
  Mahim: "mahim@gmail.com",
  Ashiq: "ashiq@gmail.com",
  Sabbir: "sabbir@gmail.com",
  Jamil: "jamil@gmail.com",
};

// June 2026 — exact meal data from Excel sheet [Breakfast, Lunch, Dinner] per day
const MEALS = {
  Mahim: [
    [0, 0, 0], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 0], [0, 0, 1], [0, 0, 1],
    [0.5, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 0], [0, 0, 1], [0, 0, 1],
    [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0],
    [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0.5, 1, 0], [0, 0, 0], [0, 0, 1],
    [0, 0, 0], [0, 0, 1],
  ],
  Ashiq: [
    [0, 0, 1], [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1], [0.5, 1, 1], [0.5, 1, 1],
    [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1], [0, 1, 1],
    [0.5, 1, 1], [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1],
    [0.5, 1, 1], [0, 0, 0], [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1], [0.5, 0, 1],
    [0, 0, 2], [0, 0, 0], [0, 0, 0], [0, 0, 1], [0, 0, 1], [0, 0, 1],
  ],
  Sabbir: [
    [0, 0, 0], [0, 0, 0.5], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0, 1, 1],
    [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0, 1, 1], [0.5, 1, 1], [0, 1, 1],
    [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1],
    [0.5, 1, 1], [0, 0.5, 0.5], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1],
    [0, 1, 1], [0.5, 1, 0], [0, 0, 0], [0.5, 1, 1], [0.5, 1, 1], [0, 0, 1],
  ],
  Jamil: [
    [0, 0, 0], [0, 0, 0.5], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0, 1, 1],
    [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0, 1, 1], [0.5, 1, 0], [0, 0, 0],
    [0, 1, 1], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 0], [0, 1, 1], [0.5, 1, 1],
    [0.5, 1, 1], [0, 0, 0], [0.5, 1, 0], [0.5, 1, 1], [0.5, 1, 1], [0.5, 1, 1],
    [0, 1, 1], [0.5, 1, 0], [0, 0, 0], [0.5, 1, 1], [0.5, 1, 1], [0, 0, 1],
  ],
};

const EXPECTED_TOTALS = { Mahim: 22, Ashiq: 43.5, Sabbir: 62, Jamil: 55 };

function toDateKey(day) {
  return `2026-06-${String(day).padStart(2, "0")}`;
}

function sumMeals(rows) {
  return rows.reduce((s, [b, l, d]) => s + b + l + d, 0);
}

async function main() {
  for (const [name, rows] of Object.entries(MEALS)) {
    if (rows.length !== 30) throw new Error(`${name} must have 30 days`);
    const total = sumMeals(rows);
    const expected = EXPECTED_TOTALS[name];
    if (total !== expected) {
      throw new Error(`${name} total ${total} !== expected ${expected}`);
    }
  }

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

  const User = mongoose.model("User", new mongoose.Schema({ email: String }));
  const Month = mongoose.model(
    "Month",
    new mongoose.Schema({ year: Number, month: Number, label: String, isActive: Boolean })
  );
  const MealEntry = mongoose.model(
    "MealEntry",
    new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      monthId: mongoose.Schema.Types.ObjectId,
      date: String,
      breakfast: Number,
      lunch: Number,
      dinner: Number,
    })
  );

  const userMap = {};
  for (const [name, email] of Object.entries(USER_EMAILS)) {
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }
    userMap[name] = user;
  }

  let month = await Month.findOne({ year: 2026, month: 6 });
  if (!month) {
    month = await Month.create({
      year: 2026,
      month: 6,
      label: "June 2026",
      isActive: true,
    });
    console.log("Created June 2026 month");
  }

  await MealEntry.deleteMany({ monthId: month._id });
  console.log("Cleared existing June 2026 meals");

  let inserted = 0;
  for (const [name, rows] of Object.entries(MEALS)) {
    for (let day = 1; day <= 30; day++) {
      const [breakfast, lunch, dinner] = rows[day - 1];
      if (breakfast + lunch + dinner === 0) continue;

      await MealEntry.findOneAndUpdate(
        {
          userId: userMap[name]._id,
          monthId: month._id,
          date: toDateKey(day),
        },
        {
          userId: userMap[name]._id,
          monthId: month._id,
          date: toDateKey(day),
          breakfast,
          lunch,
          dinner,
        },
        { upsert: true, new: true }
      );
      inserted++;
    }
    console.log(`${name}: ${sumMeals(rows)} meals (sheet total ✓)`);
  }

  const grandTotal = Object.values(MEALS).reduce((s, rows) => s + sumMeals(rows), 0);
  console.log(`\nInserted ${inserted} meal records`);
  console.log(`Grand total meals: ${grandTotal} (sheet: 182.5)`);

  await mongoose.disconnect();
  console.log("\nDone! Select June 2026 in sidebar → All Meals to verify.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
