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
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const result = await mongoose.connection.db.dropCollection("smsreminderlogs");
  console.log(result ? "smsreminderlogs collection deleted" : "Collection did not exist");
  await mongoose.disconnect();
}

main().catch((err) => {
  if (err.codeName === "NamespaceNotFound") {
    console.log("smsreminderlogs collection did not exist");
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
