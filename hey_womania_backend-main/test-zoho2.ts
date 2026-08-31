import { fetchZohoItems } from "./services/zohoInventoryService";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const data = await fetchZohoItems();
  const items = data.items || [];
  let found = 0;
  console.log("Total items returned by Zoho /items endpoint:", items.length);
  for (const item of items) {
    if (item.label_rate) {
      console.log(item.name, "Rate:", item.rate, "Label Rate:", item.label_rate);
      found++;
      if (found > 3) break;
    }
  }
  process.exit(0);
}
run().catch(console.error);
