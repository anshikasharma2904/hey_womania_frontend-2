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
  // We won't connect to mongodb so it doesn't fail!
  // We'll mock the token fetch if we can, wait... 
  // getZohoAccessToken() uses the DB. We MUST connect to MongoDB.
  // The app is using mongodb://127.0.0.1:27017/heywomaniya or something.
  // Let's check what backend uses in server.ts
  const dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/heywomaniya";
  await mongoose.connect(dbUrl);
  
  console.log("Fetching /settings/categories...");
  const cat = await zohoRequestRaw("/settings/categories");
  console.log(JSON.stringify(cat, null, 2));

  console.log("Fetching /itemcategories...");
  const itemcat = await zohoRequestRaw("/itemcategories");
  console.log(JSON.stringify(itemcat, null, 2));

  process.exit(0);
}

main().catch(console.error);
