import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import { IncomeLedger } from "./models/IncomeLedger";
import { User } from "./models/User";
import { Payout } from "./models/Payout";

const run = async () => {
  await connectDB();
  const ledgers = await IncomeLedger.find({ month: "2026-09" });
  console.log("Ledgers:", ledgers.length);
  const payouts = await Payout.find({ month: "2026-09" });
  console.log("Payouts:", payouts.map(p => p.amount));
  
  const users = await User.find({ role: "partner", "partnerProfile.networkWalletBalance": { $gt: 0 } }).limit(2);
  console.log("Users with balance:", users.map(u => ({ id: u.id, bal: u.partnerProfile?.networkWalletBalance })));
  
  process.exit(0);
};
run();
