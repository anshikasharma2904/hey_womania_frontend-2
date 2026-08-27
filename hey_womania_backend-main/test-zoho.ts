import { fetchZohoItems } from "./services/zohoInventoryService";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const data = await fetchZohoItems();
  const items = data.items || [];
  if (items.length > 0) {
    console.log("First item custom fields:", JSON.stringify(items[0].custom_fields, null, 2));
    console.log("First item full:", JSON.stringify(items[0], null, 2));
  } else {
    console.log("No items found");
  }
  process.exit(0);
}
run().catch(console.error);
