import dotenv from "dotenv";
dotenv.config();
import { fetchZohoItems } from "./services/zohoInventoryService";

async function run() {
  const data = await fetchZohoItems();
  const items = data.items || [];
  if (items.length > 0) {
    console.log("Item 0 keys:", Object.keys(items[0]));
    console.log("Item 0 description:", items[0].description);
  }
}
run();
