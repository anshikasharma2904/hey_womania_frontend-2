import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["member", "partner", "admin"], default: "member" },
  partnerProfile: mongoose.Schema.Types.Mixed,
}, { collection: "users" });

const User = mongoose.model("User2", userSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/heywomania");
  
  const newUser = new User({
    id: crypto.randomUUID(),
    firstName: "Test",
    email: "test" + Date.now() + "@test.com",
    role: "member",
    partnerProfile: {
      walletBalance: 100,
      networkWalletBalance: 0
    }
  });

  await newUser.save();
  
  const fetched = await mongoose.connection.collection("users").findOne({ id: newUser.id });
  console.log(JSON.stringify(fetched, null, 2));
  process.exit(0);
}
run();
