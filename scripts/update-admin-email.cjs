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

const NEW_EMAIL = (process.env.ADMIN_EMAIL || "ganabhaban@gmail.com").toLowerCase();

async function main() {
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

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("No admin user found in database.");
    process.exit(1);
  }

  const current = admin.email.toLowerCase();
  if (current === NEW_EMAIL) {
    console.log(`Admin email already set to ${NEW_EMAIL}`);
    process.exit(0);
  }

  const taken = await User.findOne({
    email: NEW_EMAIL,
    _id: { $ne: admin._id },
  });
  if (taken) {
    console.error(`Email ${NEW_EMAIL} is already used by another user.`);
    process.exit(1);
  }

  const oldEmail = admin.email;
  admin.email = NEW_EMAIL;
  await admin.save();

  console.log(`Admin email updated: ${oldEmail} → ${NEW_EMAIL}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
