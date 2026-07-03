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

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

  const Month = mongoose.model(
    "Month",
    new mongoose.Schema({ year: Number, month: Number, label: String })
  );
  const MealEntry = mongoose.model(
    "MealEntry",
    new mongoose.Schema({ monthId: mongoose.Schema.Types.ObjectId })
  );
  const BazarEntry = mongoose.model(
    "BazarEntry",
    new mongoose.Schema({ monthId: mongoose.Schema.Types.ObjectId })
  );
  const RentConfig = mongoose.model(
    "RentConfig",
    new mongoose.Schema({ monthId: mongoose.Schema.Types.ObjectId })
  );

  const month = await Month.findOne({ year: 2026, month: 6 });
  if (!month) {
    console.log("June 2026 not found — nothing to delete.");
    await mongoose.disconnect();
    return;
  }

  const monthId = month._id;
  const meals = await MealEntry.deleteMany({ monthId });
  const bazars = await BazarEntry.deleteMany({ monthId });
  await RentConfig.deleteMany({ monthId });
  await Month.deleteOne({ _id: monthId });

  console.log(`Deleted June 2026:`);
  console.log(`  Meals: ${meals.deletedCount}`);
  console.log(`  Bazar: ${bazars.deletedCount}`);
  console.log(`  Rent config + month record removed`);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
