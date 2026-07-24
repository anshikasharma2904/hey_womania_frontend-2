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
  
  // return content type and length to see if it's an image
  return {
    status: response.status,
    contentType: response.headers.get("content-type"),
    length: response.headers.get("content-length")
  };
}

async function main() {
  require("dotenv").config();
  const dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/heywomaniya";
  await mongoose.connect(dbUrl);
  
  const itemId = "3919602000000044029"; // user's item id
  console.log("Fetching image for item", itemId);
  const result = await zohoRequestRaw(`/items/${itemId}/image`);
  console.log(result);

  process.exit(0);
}

main().catch(console.error);
