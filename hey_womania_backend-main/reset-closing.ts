import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import { IncomeLedger } from "./models/IncomeLedger";
import { WalletTransaction } from "./models/WalletTransaction";
import { Payout } from "./models/Payout";
import { User } from "./models/User";

const run = async () => {
  await connectDB();
  const month = "2026-09";
  await IncomeLedger.deleteMany({ month });
  await WalletTransaction.deleteMany({ description: { $regex: month } });
  await Payout.deleteMany({ month });
  
  // reset wallet balances
  await User.updateMany(
    { role: "partner" },
    { $set: { "partnerProfile.walletBalance": 0, "partnerProfile.networkWalletBalance": 0 } }
  );
  
  console.log("Reset successful");
  process.exit(0);
};
run();
