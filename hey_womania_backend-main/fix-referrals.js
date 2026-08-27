require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
mongoose.connect(process.env.MONGODB_URI);
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema, "users");
async function fix() {
  const users = await User.find({ role: "partner", referralCode: { $exists: false } });
  for (const user of users) {
    user.referralCode = "HW-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    await user.save();
    console.log("Fixed user:", user.email, "->", user.referralCode);
  }
  console.log("Done");
  process.exit(0);
}
fix();
