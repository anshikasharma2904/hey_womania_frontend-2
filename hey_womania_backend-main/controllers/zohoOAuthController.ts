import { Request, Response } from "express";
import axios from "axios";
import { ZohoToken } from "../models/ZohoToken";
import {
  buildZohoAuthorizationUrl,
  fetchZohoItem,
  fetchZohoItems,
  fetchZohoItemGroups,
  fetchZohoContacts,
  fetchZohoSalesOrders,
  getInventoryApiDomain,
  getZohoInventoryStatus,
  getZohoRateLimitInfo,
  getStoredZohoToken,
  refreshZohoAccessToken,
  streamZohoItemImage,
  streamZohoDocumentImage,
  syncZohoItemsToProducts,
  syncZohoCategoriesToDb,
  syncZohoContactsToUsers,
  syncZohoSalesOrdersToOrders,
  syncSingleZohoItemToProduct
} from "../services/zohoInventoryService";

function getZohoAccountsDomain() {
  if (process.env.ZOHO_ACCOUNTS_DOMAIN) {
    return process.env.ZOHO_ACCOUNTS_DOMAIN;
  }

  return `https://accounts.zoho.${process.env.ZOHO_DC || "in"}`;
}

export const handleZohoCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== "string") {
      return res.status(400).send("Zoho code missing");
    }

    const accountsServer = typeof req.query["accounts-server"] === "string" ? req.query["accounts-server"] : getZohoAccountsDomain();
    const response = await axios.post(`${accountsServer}/oauth/v2/token`, null, {
      params: {
        grant_type: "authorization_code",
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        code
      }
    });

    const existingToken = await ZohoToken.findOne();
    const expiresIn = Number(response.data.expires_in || 3600);

    const savedToken = await ZohoToken.findOneAndUpdate(
      {},
      {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || existingToken?.refreshToken,
        apiDomain: response.data.api_domain,
        expiresAt: new Date(Date.now() + expiresIn * 1000)
      },
      { upsert: true, new: true }
    );

    const hasRefreshToken = Boolean(savedToken?.refreshToken);

    console.log("ZOHO TOKEN SAVED:", {
      hasAccessToken: Boolean(response.data.access_token),
      hasRefreshToken,
      apiDomain: response.data.api_domain,
      expiresIn
    });

    return res.send(
      hasRefreshToken
        ? "Zoho connected successfully. Refresh token saved."
        : "Zoho connected, but refresh token was not returned. Open /api/zoho/connect and allow access again."
    );
  } catch (error: any) {
    console.log("ZOHO ERROR:", error.response?.data || error.message);
    return res.status(500).send("Zoho connection failed");
  }
};

export const connectZoho = async (_req: Request, res: Response) => {
  try {
    return res.redirect(buildZohoAuthorizationUrl());
  } catch (error: any) {
    return res.status(500).send(error.message || "Zoho connect failed");
  }
};

export const getZohoStatus = async (_req: Request, res: Response) => {
  const tokenDoc = await getStoredZohoToken();
  const configStatus = getZohoInventoryStatus();
  const rateLimit = getZohoRateLimitInfo();

  return res.json({
    connected: Boolean(tokenDoc?.refreshToken),
    tokenDocumentExists: Boolean(tokenDoc),
    hasAccessToken: Boolean(tokenDoc?.accessToken),
    hasRefreshToken: Boolean(tokenDoc?.refreshToken),
    expiresAt: tokenDoc?.expiresAt || null,
    organizationId: configStatus.organizationId,
    apiDomain: getInventoryApiDomain(tokenDoc?.apiDomain || configStatus.apiDomain),
    tokenCollection: "zoho_tokens",
    rateLimitStatus: {
      isExceeded: rateLimit.isExceeded,
      cooldownRemainingSeconds: rateLimit.cooldownRemainingSeconds,
      statusMessage: rateLimit.isExceeded
        ? `Rate limit hit. Cooldown active for ${rateLimit.cooldownRemainingSeconds} seconds.`
        : "Zoho API rate limit normal. Sync ready."
    }
  });
};

export const refreshZohoToken = async (_req: Request, res: Response) => {
  try {
    await refreshZohoAccessToken();
    const tokenDoc = await ZohoToken.findOne();
    return res.json({
      success: true,
      expiresAt: tokenDoc?.expiresAt || null
    });
  } catch (error: any) {
    console.log("ZOHO REFRESH ERROR:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to refresh Zoho token" });
  }
};

export const getZohoItems = async (_req: Request, res: Response) => {
  try {
    const tokenDoc = await getStoredZohoToken();
    if (!tokenDoc?.refreshToken) {
      return res.status(401).json({ error: "Zoho not connected" });
    }

    const data = await fetchZohoItems();
    return res.json(data);
  } catch (error: any) {
    if (error.message !== "Zoho not connected") {
      console.log("ZOHO ITEMS ERROR:", error.response?.data || error.message);
    }
    return res.status(500).json({ error: "Failed to fetch Zoho items" });
  }
};

export const getZohoItemById = async (req: Request, res: Response) => {
  try {
    const data = await fetchZohoItem(req.params.itemId);
    return res.json(data);
  } catch (error: any) {
    console.log("ZOHO ITEM ERROR:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to fetch Zoho item" });
  }
};

export const getZohoItemImage = async (_req: Request, res: Response) => {
  return res.status(404).json({ error: "Direct Zoho image loading is disabled. Images are served via Cloudflare CDN." });
};

export const getZohoDocumentImage = async (_req: Request, res: Response) => {
  return res.status(404).json({ error: "Direct Zoho document image loading is disabled. Images are served via Cloudflare CDN." });
};

export const syncZohoItems = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Zoho item sync started in background. Protecting API connection from Nginx timeouts.",
    status: "processing"
  });

  // Run sync process in background without blocking HTTP response
  syncZohoItemsToProducts()
    .then((data) => {
      console.log("[Zoho Background Sync Complete]", data);
    })
    .catch((error) => {
      console.error("[Zoho Background Sync Error]", error.response?.data || error.message);
    });
};

export const getZohoCategories = async (_req: Request, res: Response) => {
  try {
    const tokenDoc = await getStoredZohoToken();
    if (!tokenDoc?.refreshToken) {
      return res.status(401).json({ error: "Zoho not connected" });
    }
    const data = await fetchZohoItemGroups();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch Zoho categories" });
  }
};

export const syncZohoCategories = async (_req: Request, res: Response) => {
  try {
    const data = await syncZohoCategoriesToDb();
    return res.json({ success: true, ...data });
  } catch (error: any) {
    console.log("ZOHO SYNC ERROR:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to sync Zoho categories" });
  }
};

export const getZohoCustomers = async (_req: Request, res: Response) => {
  try {
    const tokenDoc = await getStoredZohoToken();
    if (!tokenDoc?.refreshToken) {
      return res.status(401).json({ error: "Zoho not connected" });
    }
    const data = await fetchZohoContacts();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch Zoho customers" });
  }
};

export const syncZohoCustomers = async (_req: Request, res: Response) => {
  try {
    const data = await syncZohoContactsToUsers();
    return res.json({ success: true, ...data });
  } catch (error: any) {
    console.log("ZOHO SYNC ERROR:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to sync Zoho customers" });
  }
};

export const getZohoOrders = async (_req: Request, res: Response) => {
  try {
    const tokenDoc = await getStoredZohoToken();
    if (!tokenDoc?.refreshToken) {
      return res.status(401).json({ error: "Zoho not connected" });
    }
    const data = await fetchZohoSalesOrders();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch Zoho orders" });
  }
};

export const syncZohoOrders = async (_req: Request, res: Response) => {
  try {
    const data = await syncZohoSalesOrdersToOrders();
    return res.json({ success: true, ...data });
  } catch (error: any) {
    console.log("ZOHO SYNC ERROR:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to sync Zoho orders" });
  }
};

export const handleZohoItemWebhook = async (req: Request, res: Response) => {
  try {
    const payloadStr = req.body?.JSONString;
    const payload = payloadStr ? JSON.parse(payloadStr) : req.body;

    const item = payload?.item || payload;
    const itemId = item?.item_id;

    if (!itemId) {
      return res.status(400).json({ error: "Invalid webhook payload. Missing item_id." });
    }

    const detailedData = await fetchZohoItem(itemId);
    if (!detailedData || !detailedData.item) {
       return res.status(404).json({ error: "Item not found in Zoho" });
    }

    const result = await syncSingleZohoItemToProduct(detailedData.item, detailedData.item);
    return res.json({ success: true, result });
  } catch (error: any) {
    console.error("ZOHO WEBHOOK ERROR:", error);
    return res.status(500).json({ error: "Failed to process webhook" });
  }
};
