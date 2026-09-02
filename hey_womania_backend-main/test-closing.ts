import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "env" });
dotenv.config({ path: "../.env" });

import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { runAutomatedMonthlyClosing } from "./controllers/closingController";

const run = async () => {
  try {
    await connectDB();
    console.log("Connected to database. Triggering manual closing script...");
    
    await runAutomatedMonthlyClosing(true);
    
    console.log("Closing script execution finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error executing closing script:", error);
    process.exit(1);
  }
};

run();
