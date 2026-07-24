import { getStoredZohoToken, getZohoAccessToken, getInventoryApiDomain } from "./services/zohoInventoryService";
import mongoose from "mongoose";

async function zohoRequestRaw(path: string) {
  const token = await getZohoAccessToken();
  const tokenDoc = await getStoredZohoToken();
  const apiDomain = getInventoryApiDomain(tokenDoc?.apiDomain);
  const organizationId = process.env.ZOHO_ORGANIZATION_ID || process.env.ZOHO_ORG_ID;
  const separator = path.includes("?") ? "&" : "?";
  const url = `${apiDomain}${path}${separator}organization_id=${organizationId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json"
    }
  });
  return response.json();
}

async function main() {
  require("dotenv").config();
  await mongoose.connect("mongodb://localhost:27017/hey_womania");
  
  // Try getting categories (itemcategories)
  console.log("Fetching /settings/categories...");
  const categories = await zohoRequestRaw("/settings/categories");
  console.log("Categories response:", JSON.stringify(categories, null, 2));
  
  console.log("Fetching /itemcategories...");
  const itemcategories = await zohoRequestRaw("/itemcategories");
  console.log("ItemCategories response:", JSON.stringify(itemcategories, null, 2));

  process.exit(0);
}

main().catch(console.error);
