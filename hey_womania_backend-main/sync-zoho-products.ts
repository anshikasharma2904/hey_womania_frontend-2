import mongoose from "mongoose";
import dotenv from "dotenv";
import {
  syncZohoCategoriesToDb,
  syncZohoItemsToProducts,
  fetchZohoItems,
  getZohoInventoryStatus
} from "./services/zohoInventoryService";

dotenv.config();

async function main() {
  console.log("==========================================");
  console.log("  Zoho Inventory: Fetch & Sync All Products ");
  console.log("==========================================");

  const status = getZohoInventoryStatus();
  console.log("Zoho configured:", status.configured);

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/hey-womania";
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB successfully.\n");

  console.log("1. Fetching all items from Zoho API...");
  const rawData = await fetchZohoItems();
  const rawItems = Array.isArray(rawData.items) ? rawData.items : [];
  console.log(`✓ Successfully fetched ${rawItems.length} items across all pages from Zoho.\n`);

  console.log("2. Syncing Categories to Database...");
  const catResult = await syncZohoCategoriesToDb();
  console.log(`✓ Categories sync completed: ${catResult.synced} synced.\n`);

  console.log("3. Syncing Products to Database (this may take a few moments)...");
  const prodResult = await syncZohoItemsToProducts();
  console.log(`✓ Products sync completed: ${prodResult.synced} synced.\n`);

  console.log("==========================================");
  console.log("  Sync Finished Successfully!");
  console.log(`  Total Zoho Items: ${rawItems.length}`);
  console.log(`  Products Synced: ${prodResult.synced}`);
  console.log("==========================================");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error during Zoho product fetch/sync:", err);
  process.exit(1);
});
