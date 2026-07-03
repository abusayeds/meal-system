const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

const EMAIL = (process.argv[2] || "").toLowerCase();
const NEW_PASSWORD = process.argv[3] || "";

async function main() {
  if (!EMAIL || !NEW_PASSWORD) {
    console.error("Usage: node scripts/reset-user-password.cjs <email> <new-password>");
    process.exit(1);
  }

  if (NEW_PASSWORD.length < 6) {
    console.error("Password must be at least 6 characters");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const User =
    mongoose.models.User ||
    mongoose.model(
      "User",
      new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        role: String,
        isActive: Boolean,
      })
    );

  const user = await User.findOne({ email: EMAIL });
  if (!user) {
    console.error(`User not found: ${EMAIL}`);
    process.exit(1);
  }

  user.password = await bcrypt.hash(NEW_PASSWORD, 12);
  await user.save();

  console.log(`Password updated for ${user.name} (${user.email})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
