import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { ZohoToken } from "./models/ZohoToken";

async function test() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas!");

  const tokenDoc = await ZohoToken.findOne();
  console.log("Token doc exists:", Boolean(tokenDoc));
  
  if (tokenDoc) {
    const token = tokenDoc.accessToken;
    const rawApiDomain = tokenDoc.apiDomain;
    console.log("Raw apiDomain in DB:", rawApiDomain);
    
    let apiDomain = rawApiDomain || "https://www.zohoapis.in/inventory/v1";
    if (!apiDomain.includes("/inventory/v1")) {
      apiDomain = `${apiDomain.replace(/\/$/, "")}/inventory/v1`;
    }
    console.log("Constructed apiDomain:", apiDomain);
    const orgId = process.env.ZOHO_ORG_ID || "60077160313";
    const docId = "3919602000000048231";

    const itemsRes = await fetch(`${apiDomain}/items?organization_id=${orgId}`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` }
    });
    const itemsData = await itemsRes.json();
    const items = itemsData.items || [];
    console.log("Found items count:", items.length);

    for (const item of items) {
      const itemDetailRes = await fetch(`${apiDomain}/items/${item.item_id}?organization_id=${orgId}`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      });
      const itemDetail = await itemDetailRes.json();
      const detailedItem = itemDetail.item;
      if (detailedItem.documents && detailedItem.documents.length > 0) {
        console.log("\nFound item with documents! Item ID:", item.item_id, "Name:", item.name);
        console.log("Documents:", JSON.stringify(detailedItem.documents, null, 2));
        console.log("Image name/info:", detailedItem.image_name, detailedItem.image_type, detailedItem.has_attachment);
        
        // Test fetching image for this item
        const imgRes = await fetch(`${apiDomain}/items/${item.item_id}/image?organization_id=${orgId}`, {
          headers: { Authorization: `Zoho-oauthtoken ${token}` }
        });
        console.log("Item image fetch status:", imgRes.status, imgRes.headers.get("content-type"));
        break;
      }
    }
  }

  process.exit(0);
}

test().catch(console.error);
