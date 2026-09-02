import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import { User } from "./models/User";
import { IncomeLedger } from "./models/IncomeLedger";

const run = async () => {
  await connectDB();
  
  // Find the user who got 104722.13 in networkWalletBalance
  const users = await User.find({ role: "partner", "partnerProfile.networkWalletBalance": 104722.13 });
  if (users.length === 0) {
    console.log("User not found");
    process.exit(0);
  }
  const user = users[0];
  console.log("User:", user.name || user.firstName);
  
  const ledgers = await IncomeLedger.find({ userId: user.id, month: "2026-09" });
  let total = 0;
  for (const l of ledgers) {
    console.log(`- ${l.incomeType}: ₹${l.amount} (Basis: ₹${l.sellPointsBasis || 0})`);
    total += l.amount;
  }
  console.log(`Total: ₹${total}`);
  
  process.exit(0);
};
run();
