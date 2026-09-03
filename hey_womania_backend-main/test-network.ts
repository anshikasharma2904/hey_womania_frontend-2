import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import { User } from "./models/User";

const run = async () => {
  await connectDB();
  const root = await User.findOne({ role: "partner" });
  console.log("Root user:", root?.firstName);
  process.exit(0);
};
run();
