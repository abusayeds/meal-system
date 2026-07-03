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

// June 2026 bazar — exact from Excel sheet
const BAZAR = [
  { day: 1, user: "Ashiq", amount: 264, description: "Potato, Onion, Lentils, Eggs, Green chilli" },
  { day: 2, user: "Ashiq", amount: 1018, description: "Fish, Oil, Eggs, Masala items, Vegetables" },
  { day: 3, user: "Ashiq", amount: 350, description: "Rice, Onion" },
  { day: 4, user: "Ashiq", amount: 140, description: "Vimbar, Vegetables" },
  { day: 6, user: "Ashiq", amount: 310, description: "Eggs, Salad items, Vagetables, Masala, Cool drinks" },
  { day: 7, user: "Jamil", amount: 1160, description: "chal-5kg, mass 420. mosla , sobji , dim -12, oil 1/2, dal -1, lobon" },
  { day: 9, user: "Jamil", amount: 750, description: "mass 0.8kg, shak , sobji , dim -12, alo ,payaj , morich." },
  { day: 10, user: "Ashiq", amount: 375, description: "Rumali Parata, Salad items" },
  { day: 11, user: "Ashiq", amount: 210, description: "Red Rice" },
  { day: 12, user: "Sabbir", amount: 120, description: "tel + muri" },
  { day: 13, user: "Jamil", amount: 150, description: "pepe mass" },
  { day: 15, user: "Sabbir", amount: 910, description: "chal , mach , alu , sobji , moriv , pajaj , dim , etc" },
  { day: 16, user: "Sabbir", amount: 280, description: "chal ," },
  { day: 17, user: "Sabbir", amount: 495, description: "dim + alu +sobji" },
  { day: 18, user: "Sabbir", amount: 515, description: "mach + sobji + tel" },
  { day: 19, user: "Sabbir", amount: 50, description: "" },
  { day: 21, user: "Mahim", amount: 550, description: "Chal, mac,dim,sobji" },
  { day: 22, user: "Mahim", amount: 260, description: "Tel, Dal" },
  { day: 23, user: "Mahim", amount: 535, description: "chal,mas,alu,peyaj,sobji" },
  { day: 25, user: "Mahim", amount: 580, description: "murgi,chal,sobji" },
  { day: 28, user: "Mahim", amount: 450, description: "chal,sobji,alu,peyaj" },
  { day: 30, user: "Mahim", amount: 120, description: "chal" },
];

const EXPECTED = {
  Mahim: 2495,
  Ashiq: 2667,
  Sabbir: 2370,
  Jamil: 2060,
  total: 9592,
};

function toDateKey(day) {
  return `2026-06-${String(day).padStart(2, "0")}`;
}

async function main() {
  const totals = { Mahim: 0, Ashiq: 0, Sabbir: 0, Jamil: 0 };
  for (const entry of BAZAR) {
    totals[entry.user] += entry.amount;
  }

  for (const [name, expected] of Object.entries(EXPECTED)) {
    if (name === "total") continue;
    if (totals[name] !== expected) {
      throw new Error(`${name}: ${totals[name]} !== expected ${expected}`);
    }
  }
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  if (grandTotal !== EXPECTED.total) {
    throw new Error(`Grand total ${grandTotal} !== ${EXPECTED.total}`);
  }

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

  const User = mongoose.model("User", new mongoose.Schema({ email: String }));
  const Month = mongoose.model(
    "Month",
    new mongoose.Schema({ year: Number, month: Number, label: String })
  );
  const BazarEntry = mongoose.model(
    "BazarEntry",
    new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      monthId: mongoose.Schema.Types.ObjectId,
      date: String,
      amount: Number,
      description: String,
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

  await BazarEntry.deleteMany({ monthId: month._id });
  console.log("Cleared existing June 2026 bazar entries");

  for (const entry of BAZAR) {
    await BazarEntry.create({
      userId: userMap[entry.user]._id,
      monthId: month._id,
      date: toDateKey(entry.day),
      amount: entry.amount,
      description: entry.description,
    });
  }

  console.log("\n=== BAZAR TOTALS ===");
  for (const name of Object.keys(totals)) {
    console.log(`${name}: ${totals[name]} ✓`);
  }
  console.log(`Grand Total: ${grandTotal} ✓`);
  console.log(`\nInserted ${BAZAR.length} bazar entries for June 2026`);

  await mongoose.disconnect();
  console.log("Done! Check All Bazar page.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
