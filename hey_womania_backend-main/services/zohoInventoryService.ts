import crypto from "crypto";
import axios from "axios";
import { Product } from "../models/Product";
import { InventoryLedger } from "../models/InventoryLedger";
import { ZohoToken } from "../models/ZohoToken";
import { Category } from "../models/Category";
import { User } from "../models/User";
import { Order } from "../models/Order";
import mongoose from "mongoose";
import { invalidateBackendCache } from "../middlewares/cacheMiddleware";
import {
  isCloudflareImageUploadConfigured,
  uploadImageToCloudflare,
  deleteImageFromCloudflare
} from "./cloudflareImageService";

type ZohoConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  redirectUri?: string;
  organizationId: string;
  accountsDomain: string;
  apiDomain: string;
};

type ZohoVariantResult = {
  sku: string;
  zohoItemId?: string;
  status: "synced" | "failed" | "skipped";
  error?: string;
  stock?: number;
};

let cachedAccessToken: string | null = null;
let cachedAccessTokenExpiresAt = 0;

export async function getStoredZohoToken() {
  const tokenDoc = await ZohoToken.findOne();
  if (tokenDoc) return tokenDoc;

  const legacyTokenDoc = await mongoose.connection.collection("zohoTokens").findOne();
  if (!legacyTokenDoc) return null;

  return ZohoToken.findOneAndUpdate(
    {},
    {
      accessToken: legacyTokenDoc.accessToken,
      refreshToken: legacyTokenDoc.refreshToken,
      apiDomain: legacyTokenDoc.apiDomain,
      expiresAt: legacyTokenDoc.expiresAt
    },
    { upsert: true, new: true }
  );
}

function getZohoConfig(): ZohoConfig | null {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const organizationId = process.env.ZOHO_ORGANIZATION_ID || process.env.ZOHO_ORG_ID;
  const dc = process.env.ZOHO_DC || "in";

  if (!clientId || !clientSecret || !organizationId) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
    redirectUri: process.env.ZOHO_REDIRECT_URI,
    organizationId,
    accountsDomain: process.env.ZOHO_ACCOUNTS_DOMAIN || `https://accounts.zoho.${dc}`,
    apiDomain: process.env.ZOHO_INVENTORY_API_DOMAIN || `https://www.zohoapis.${dc}/inventory/v1`
  };
}

export function getInventoryApiDomain(apiDomain?: string | null) {
  const fallback = getZohoConfig()?.apiDomain || "https://www.zohoapis.in/inventory/v1";
  const domain = (apiDomain || fallback).replace(/\/$/, "");

  if (domain.includes("/inventory/v1")) {
    return domain;
  }

  return `${domain}/inventory/v1`;
}

export function getZohoInventoryStatus() {
  const config = getZohoConfig();

  return {
    configured: Boolean(config),
    organizationId: config?.organizationId || "",
    accountsDomain: config?.accountsDomain || "",
    apiDomain: config?.apiDomain || "",
    requiredEnv: [
      "ZOHO_CLIENT_ID",
      "ZOHO_CLIENT_SECRET",
      "ZOHO_ORGANIZATION_ID or ZOHO_ORG_ID"
    ]
  };
}

export function buildZohoAuthorizationUrl() {
  const config = getZohoConfig();
  if (!config?.redirectUri) {
    throw new Error("Zoho OAuth is not configured");
  }

  const params = new URLSearchParams({
    scope: "ZohoInventory.FullAccess.all",
    client_id: config.clientId,
    response_type: "code",
    access_type: "offline",
    redirect_uri: config.redirectUri,
    prompt: "consent"
  });

  return `${config.accountsDomain}/oauth/v2/auth?${params.toString()}`;
}

export async function refreshZohoAccessToken() {
  const config = getZohoConfig();
  if (!config) {
    throw new Error("Zoho Inventory is not configured");
  }

  const tokenDoc = await getStoredZohoToken();
  const refreshToken = tokenDoc?.refreshToken || config.refreshToken;
  if (!refreshToken) {
    throw new Error("Zoho not connected");
  }

  const response = await axios.post(`${config.accountsDomain}/oauth/v2/token`, null, {
    params: {
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token"
    }
  });

  const data = response.data;
  const expiresIn = Number(data.expires_in || 3600);

  await ZohoToken.findOneAndUpdate(
    {},
    {
      accessToken: data.access_token,
      refreshToken,
      apiDomain: data.api_domain || tokenDoc?.apiDomain,
      expiresAt: new Date(Date.now() + expiresIn * 1000)
    },
    { upsert: true, new: true }
  );

  cachedAccessToken = data.access_token;
  cachedAccessTokenExpiresAt = Date.now() + Math.max(expiresIn - 120, 60) * 1000;
  return data.access_token;
}

export async function getZohoAccessToken() {
  const config = getZohoConfig();
  if (!config) {
    throw new Error("Zoho Inventory is not configured");
  }

  const tokenDoc = await getStoredZohoToken();

  if (
    tokenDoc?.accessToken &&
    tokenDoc.expiresAt &&
    tokenDoc.expiresAt > new Date(Date.now() + 5 * 60 * 1000)
  ) {
    return tokenDoc.accessToken;
  }

  if (cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt) {
    return cachedAccessToken;
  }

  return refreshZohoAccessToken();
}

let lastRateLimitExceededAt: number | null = null;

export function getZohoRateLimitInfo() {
  if (!lastRateLimitExceededAt) {
    return { isExceeded: false, cooldownRemainingSeconds: 0 };
  }
  const elapsedMs = Date.now() - lastRateLimitExceededAt;
  const cooldownMs = 60000; // 60-second window
  if (elapsedMs >= cooldownMs) {
    lastRateLimitExceededAt = null;
    return { isExceeded: false, cooldownRemainingSeconds: 0 };
  }
  const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
  return { isExceeded: true, cooldownRemainingSeconds: remainingSeconds };
}

async function zohoRequest(path: string, init: RequestInit = {}, isRetry = false): Promise<any> {
  const config = getZohoConfig();
  if (!config) {
    throw new Error("Zoho Inventory is not configured");
  }

  const tokenDoc = await ZohoToken.findOne();
  const token = await getZohoAccessToken();
  const apiDomain = getInventoryApiDomain(tokenDoc?.apiDomain || config.apiDomain);
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${apiDomain}${path}${separator}organization_id=${config.organizationId}`, {
    ...init,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (
    (response.status === 401 ||
      response.status === 429 ||
      data.code === 57 ||
      data.code === 1000 ||
      String(data.message || "").toLowerCase().includes("rate limit")) &&
    !isRetry
  ) {
    if (response.status === 401) {
      cachedAccessToken = null;
      await refreshZohoAccessToken();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return zohoRequest(path, init, true);
  }

  if (!response.ok || (data.code !== undefined && Number(data.code) !== 0)) {
    const message = data?.message || data?.error || "Zoho Inventory request failed";
    if (response.status === 429 || Number(data.code) === 1000 || message.toLowerCase().includes("rate limit")) {
      lastRateLimitExceededAt = Date.now();
    }
    throw new Error(`${message}`);
  }

  return data;
}

export async function fetchZohoItems() {
  return zohoRequest("/items");
}

export async function fetchZohoItem(itemId: string) {
  return zohoRequest(`/items/${encodeURIComponent(itemId)}`);
}

export async function streamZohoItemImage(itemId: string, res: any) {
  const config = getZohoConfig();
  if (!config) {
    throw new Error("Zoho Inventory is not configured");
  }

  const tokenDoc = await ZohoToken.findOne();
  const token = await getZohoAccessToken();
  const apiDomain = getInventoryApiDomain(tokenDoc?.apiDomain || config.apiDomain);
  const response = await fetch(`${apiDomain}/items/${encodeURIComponent(itemId)}/image?organization_id=${config.organizationId}`, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }

  const arrayBuffer = await response.arrayBuffer();
  res.send(Buffer.from(arrayBuffer));
}

export async function streamZohoDocumentImage(documentId: string, res: any) {
  const config = getZohoConfig();
  if (!config) {
    throw new Error("Zoho Inventory is not configured");
  }

  const tokenDoc = await ZohoToken.findOne();
  const token = await getZohoAccessToken();
  const apiDomain = getInventoryApiDomain(tokenDoc?.apiDomain || config.apiDomain);
  // Guessing the endpoint for downloading a document attachment
  const response = await fetch(`${apiDomain}/documents/${encodeURIComponent(documentId)}?organization_id=${config.organizationId}`, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }

  const arrayBuffer = await response.arrayBuffer();
  res.send(Buffer.from(arrayBuffer));
}

async function fetchZohoItemImageBuffer(itemId: string, retries = 2): Promise<Buffer | null> {
  try {
    const config = getZohoConfig();
    if (!config) return null;

    const tokenDoc = await ZohoToken.findOne();
    const token = await getZohoAccessToken();
    const apiDomain = getInventoryApiDomain(tokenDoc?.apiDomain || config.apiDomain);

    await new Promise((r) => setTimeout(r, 150));

    const response = await fetch(
      `${apiDomain}/items/${encodeURIComponent(itemId)}/image?organization_id=${config.organizationId}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`
        }
      }
    );

    if (response.status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return fetchZohoItemImageBuffer(itemId, retries - 1);
    }

    if (!response.ok) {
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return fetchZohoItemImageBuffer(itemId, retries - 1);
    }
    return null;
  }
}

async function fetchZohoDocumentImageBuffer(documentId: string, retries = 2): Promise<Buffer | null> {
  try {
    const config = getZohoConfig();
    if (!config) return null;

    const tokenDoc = await ZohoToken.findOne();
    const token = await getZohoAccessToken();
    const apiDomain = getInventoryApiDomain(tokenDoc?.apiDomain || config.apiDomain);

    await new Promise((r) => setTimeout(r, 150));

    const response = await fetch(
      `${apiDomain}/documents/${encodeURIComponent(documentId)}?organization_id=${config.organizationId}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`
        }
      }
    );

    if (response.status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return fetchZohoDocumentImageBuffer(documentId, retries - 1);
    }

    if (!response.ok) {
      return null;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return fetchZohoDocumentImageBuffer(documentId, retries - 1);
    }
    return null;
  }
}

async function getSyncedImageDataForItem(finalItem: any, itemId: string, baseSlug: string) {
  let itemData = finalItem;
  if ((!itemData?.documents || !Array.isArray(itemData.documents)) && itemId) {
    try {
      const detailed = await fetchZohoItem(itemId);
      if (detailed?.item) {
        itemData = detailed.item;
      }
    } catch (e) {
      // Fallback if rate limited
    }
  }

  const existingProduct = await Product.findOne({
    $or: [{ zohoItemId: itemId }, { "variants.zohoItemId": itemId }]
  });

  const existingUrls: string[] = existingProduct?.images || [];
  const existingCfIds: string[] = existingProduct?.cloudflareImageIds || [];

  const documents = Array.isArray(itemData.documents) ? itemData.documents : [];
  const hasAttachment = Boolean(itemData.has_attachment || itemData.image_id || itemData.image_name);

  const zohoDocIds = documents.map((d: any) => String(d.document_id || "").trim()).filter(Boolean);
  const zohoImageCount = zohoDocIds.length > 0 ? zohoDocIds.length : (hasAttachment ? 1 : 0);

  console.log(`----------------------------------`);
  console.log(`Syncing item: ${itemId}`);
  console.log(`Existing DB image: ${existingUrls.length > 0 ? existingUrls.join(", ") : "None"}`);

  // 1. IF REMOVED IN ZOHO (zohoImageCount === 0)
  if (zohoImageCount === 0) {
    console.log(`Zoho image: None`);
    if (existingCfIds.length > 0) {
      console.log(`Removing image from storage...`);
      for (const cfId of existingCfIds) {
        if (cfId) {
          try {
            await deleteImageFromCloudflare(cfId);
          } catch (e) {
            console.error(`Failed deleting storage image ${cfId}:`, e);
          }
        }
      }
    }
    console.log(`Clearing MongoDB image fields...`);
    console.log(`Done.`);
    console.log(`----------------------------------`);

    return {
      imageUrls: [],
      cloudflareImageIds: []
    };
  }

  console.log(`Zoho image: ${zohoDocIds.length > 0 ? `Documents [${zohoDocIds.join(", ")}]` : "Item Attachment"}`);

  // 2. CHECK IDEMPOTENCY / NO CHANGE
  const allDocIdsSynced =
    zohoDocIds.length > 0 &&
    zohoDocIds.every((docId: string) => existingCfIds.some((cfId) => cfId.includes(docId)));

  const singleAttachmentSynced =
    zohoDocIds.length === 0 &&
    hasAttachment &&
    existingCfIds.some((cfId) => cfId.includes(itemId));

  if ((allDocIdsSynced || singleAttachmentSynced) && existingUrls.length === zohoImageCount) {
    console.log(`Image changed: No`);
    console.log(`----------------------------------`);
    return {
      imageUrls: existingUrls,
      cloudflareImageIds: existingCfIds
    };
  }

  // 3. IMAGE CHANGED / NEW / REPLACED
  console.log(`Image changed: Yes`);

  // Identify old CF IDs that no longer exist in Zoho and delete them
  const cfIdsToDelete = existingCfIds.filter((cfId) => {
    if (zohoDocIds.length > 0) {
      return !zohoDocIds.some((docId: string) => cfId.includes(docId));
    }
    return !cfId.includes(itemId);
  });

  if (cfIdsToDelete.length > 0) {
    console.log(`Deleting old image...`);
    for (const oldId of cfIdsToDelete) {
      try {
        await deleteImageFromCloudflare(oldId);
      } catch (e) {
        console.error(`Error deleting old storage image ${oldId}:`, e);
      }
    }
  }

  const fallbackUrls: string[] = (documents || []).map(
    (doc: any) => `/api/zoho/documents/${doc.document_id}`
  );
  if (fallbackUrls.length === 0 && hasAttachment) {
    fallbackUrls.push(`/api/zoho/items/${itemId}/image`);
  }

  const newUrls: string[] = [];
  const newCfIds: string[] = [];

  if (isCloudflareImageUploadConfigured()) {
    console.log(`Downloading image...`);
    console.log(`Uploading image...`);

    for (let index = 0; index < documents.length; index += 1) {
      const document = documents[index];
      const documentId = String(document?.document_id || "").trim();
      if (!documentId) continue;

      try {
        const buffer = await fetchZohoDocumentImageBuffer(documentId);
        if (buffer) {
          const uploaded = await uploadImageToCloudflare(
            buffer,
            `${baseSlug}-${documentId}-${index + 1}.jpg`,
            "zoho-document"
          );
          if (uploaded?.url) {
            if (!newUrls.includes(uploaded.url)) newUrls.push(uploaded.url);
            if (uploaded.id && !newCfIds.includes(uploaded.id)) newCfIds.push(uploaded.id);
          }
        }
      } catch (err) {
        console.error(`Graceful Error: Failed downloading/uploading Zoho document ${documentId}:`, err);
      }
    }

    if (newUrls.length === 0 && hasAttachment) {
      try {
        const buffer = await fetchZohoItemImageBuffer(itemId);
        if (buffer) {
          const uploaded = await uploadImageToCloudflare(
            buffer,
            `${baseSlug}-${itemId}.jpg`,
            "zoho-item-image"
          );
          if (uploaded?.url) {
            if (!newUrls.includes(uploaded.url)) newUrls.push(uploaded.url);
            if (uploaded.id && !newCfIds.includes(uploaded.id)) newCfIds.push(uploaded.id);
          }
        }
      } catch (err) {
        console.error(`Graceful Error: Failed downloading/uploading Zoho item image ${itemId}:`, err);
      }
    }
  }

  const finalUrls = newUrls.length > 0 ? newUrls : fallbackUrls;
  const finalCfIds = newCfIds.length > 0 ? newCfIds : existingCfIds.filter((id) => !cfIdsToDelete.includes(id));

  console.log(`MongoDB updated successfully.`);
  console.log(`----------------------------------`);

  return {
    imageUrls: finalUrls,
    cloudflareImageIds: finalCfIds
  };
}

export async function fetchZohoItemGroups() {
  return zohoRequest("/itemgroups");
}

export async function fetchZohoContacts() {
  return zohoRequest("/contacts");
}

export async function fetchZohoSalesOrders() {
  return zohoRequest("/salesorders");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function getZohoItemName(item: any) {
  return item.name || item.item_name || item.sku || `Zoho Item ${item.item_id}`;
}

function getZohoItemRate(item: any) {
  const value = Number(item.rate ?? item.sales_rate ?? item.purchase_rate ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getZohoItemCategoryInfo(item: any) {
  const categoryName =
    item?.category_name ||
    item?.category ||
    item?.group_name ||
    item?.item_group_name ||
    "Zoho Inventory";

  const subcategoryName =
    item?.subcategory_name ||
    item?.sub_category_name ||
    item?.subcategory ||
    item?.sub_category ||
    item?.item_group_name ||
    item?.group_name ||
    "";

  return {
    categoryName,
    subcategoryName:
      subcategoryName && subcategoryName !== categoryName ? String(subcategoryName) : ""
  };
}

function parseVariantSizeAndColor(itemName: string, groupName: string) {
  let suffix = itemName;
  if (groupName && itemName.toLowerCase().startsWith(groupName.toLowerCase())) {
    suffix = itemName.slice(groupName.length).replace(/^[-\s/]+/, "");
  }

  const sizes = ["3XL", "4XL", "5XL", "XXL", "XL", "XS", "S", "M", "L", "Free Size", "Free", "One Size"];
  const colors = [
    "Yellow", "Red", "Blue", "Green", "Black", "White", "Pink", "Blush Pink",
    "Mocha Brown", "Chocolate Brown", "Rust Brown", "Brown", "Sky Blue", "Mint Green",
    "Emerald Green", "Ivory", "Navy", "Beige", "Maroon", "Grey", "Gray", "Cream",
    "Orange", "Purple", "Gold", "Silver", "Multicolor", "Default"
  ];

  let foundSize = "";
  let foundColor = "";

  const parts = suffix.split(/[-/\s]+/).map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const upper = part.toUpperCase();
    if (!foundSize && sizes.includes(upper)) {
      foundSize = upper;
    }
  }

  for (const part of parts) {
    const titleCase = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    if (!foundColor && colors.some((c) => c.toLowerCase() === part.toLowerCase())) {
      foundColor = titleCase;
    }
  }

  if (!foundSize) {
    foundSize = parts.find((p) => /^(S|M|L|XL|XXL|3XL|4XL)$/i.test(p))?.toUpperCase() || "Default";
  }

  if (!foundColor) {
    foundColor = parts[parts.length - 1] || "Default";
  }

  return {
    size: foundSize,
    color: foundColor
  };
}

export async function syncSingleZohoItemToProduct(
  item: any,
  detailedItem: any = null,
  sessionColorImageCache?: Map<string, { imageUrls: string[]; cloudflareImageIds: string[] }>
) {
  const itemId = String(item.item_id || "");
  if (!itemId) return null;
  const now = new Date().toISOString();
  const finalItem = detailedItem || item;

  const rawGroupId = finalItem?.group_id || finalItem?.item_group_id || item?.group_id || item?.item_group_id;
  const groupId = rawGroupId && String(rawGroupId).trim() !== "undefined" ? String(rawGroupId).trim() : "";

  const rawGroupName = finalItem?.group_name || finalItem?.item_group_name || item?.group_name || item?.item_group_name;
  const groupName = rawGroupName && String(rawGroupName).trim() !== "undefined" ? String(rawGroupName).trim() : "";

  const isExplicitGroup = Boolean(groupId && groupName);

  // Extract base product title (e.g. "Rosé Bloom Co-Ord Set" or "Midnight Bloom Embroidered Co-Ord Set")
  const rawItemName = getZohoItemName(item);
  let parsedTitle = isExplicitGroup ? groupName : "";

  if (!parsedTitle && rawItemName) {
    const knownSizes = ["3XL", "4XL", "5XL", "XXL", "XL", "XS", "S", "M", "L", "Free Size", "Free", "One Size"];
    const knownColors = [
      "Yellow", "Red", "Blue", "Green", "Black", "White", "Pink", "Blush Pink",
      "Mocha Brown", "Chocolate Brown", "Rust Brown", "Brown", "Sky Blue", "Mint Green",
      "Emerald Green", "Ivory", "Navy", "Beige", "Maroon", "Grey", "Gray", "Cream",
      "Orange", "Purple", "Gold", "Silver", "Multicolor"
    ];

    const tokens = rawItemName.split(/[-/\s]+/).map((t: string) => t.trim()).filter(Boolean);
    const titleTokens = tokens.filter((t: string) => {
      const upper = t.toUpperCase();
      const isSizeToken = knownSizes.includes(upper);
      const isColorToken = knownColors.some((c) => c.toLowerCase() === t.toLowerCase());
      return !isSizeToken && !isColorToken && t.toLowerCase() !== "pcs" && t.toLowerCase() !== "default";
    });

    parsedTitle = titleTokens.join(" ").trim();
  }

  const title = parsedTitle || rawItemName;
  const price = getZohoItemRate(item);
  const sku = item.sku || itemId;
  const stock = getZohoItemStock(item);
  const baseSlug = slugify(title || itemId) || itemId;
  const { categoryName, subcategoryName } = getZohoItemCategoryInfo(finalItem);
  const categorySlug = slugify(categoryName);

  await Category.findOneAndUpdate(
    {
      $or: [
        { slug: categorySlug },
        { name: categoryName }
      ]
    },
    {
      $set: {
        name: categoryName,
        slug: categorySlug,
        description: categoryName,
        isActive: true,
        updatedAt: now
      },
      $setOnInsert: {
        id: crypto.randomUUID(),
        sortOrder: 0,
        createdAt: now
      }
    },
    { upsert: true }
  );

  // Find existing product by zohoGroupId, baseSlug, or variant's zohoItemId
  let existingProduct = await Product.findOne({
    $or: [
      ...(groupId ? [{ zohoGroupId: groupId }] : []),
      { slug: baseSlug },
      { "variants.zohoItemId": itemId }
    ]
  });

  const variantInfo = parseVariantSizeAndColor(getZohoItemName(item), title);

  let finalVariantImages: string[] = [];
  let finalVariantCfIds: string[] = [];

  // 1. Check session-level cache first (same color already fetched this sync run)
  const sessionCacheKey = `${groupId || baseSlug}::${variantInfo.color.toLowerCase().trim()}`;
  if (sessionColorImageCache && sessionColorImageCache.has(sessionCacheKey)) {
    const cached = sessionColorImageCache.get(sessionCacheKey)!;
    finalVariantImages = cached.imageUrls;
    finalVariantCfIds = cached.cloudflareImageIds;
  }

  // 2. Check DB for same-color variant already saved
  if (finalVariantImages.length === 0 && existingProduct) {
    const sameColorVariant = (existingProduct.variants || []).find(
      (v: any) =>
        v.color?.toLowerCase().trim() === variantInfo.color.toLowerCase().trim() &&
        v.images &&
        v.images.length > 0
    );
    if (sameColorVariant) {
      finalVariantImages = sameColorVariant.images || [];
      finalVariantCfIds = sameColorVariant.cloudflareImageIds || [];
    }
  }

  // 3. Fetch from Zoho only if not cached anywhere
  if (finalVariantImages.length === 0) {
    let detailedItem = finalItem;
    if (!detailedItem.documents && itemId) {
      try {
        const detailedData = await fetchZohoItem(itemId);
        if (detailedData?.item) detailedItem = detailedData.item;
      } catch (e) {
        // Fallback to basic item if detailed item fetch is rate-limited
      }
    }
    const { imageUrls, cloudflareImageIds } = await getSyncedImageDataForItem(detailedItem, itemId, baseSlug);
    finalVariantImages = imageUrls;
    finalVariantCfIds = cloudflareImageIds;
    // Store in session cache so other sizes of same color skip the fetch
    if (sessionColorImageCache && finalVariantImages.length > 0) {
      sessionColorImageCache.set(sessionCacheKey, { imageUrls: finalVariantImages, cloudflareImageIds: finalVariantCfIds });
    }
  }

  const newVariant = {
    sku,
    size: variantInfo.size,
    color: variantInfo.color,
    availableStock: stock,
    reservedStock: 0,
    returnStock: 0,
    damagedStock: 0,
    images: finalVariantImages,
    cloudflareImageIds: finalVariantCfIds,
    zohoItemId: itemId,
    zohoLastSyncedAt: now,
    zohoSyncStatus: "synced",
    zohoSyncError: ""
  };

  if (!existingProduct) {
    const slug = baseSlug;
    existingProduct = new Product({
      id: crypto.randomUUID(),
      title,
      slug,
      description: finalItem.description || item.description || title,
      price,
      salePrice: price,
      images: finalVariantImages,
      cloudflareImageIds: finalVariantCfIds,
      category: categoryName,
      subcategory: subcategoryName || undefined,
      isReturnable: true,
      isCodAllowed: true,
      isSellPointEligible: true,
      sellPoints: Number((price / 5).toFixed(2)),
      isActive: item.status ? item.status === "active" : true,
      zohoItemId: itemId,
      zohoGroupId: groupId || undefined,
      zohoSku: sku,
      variants: [newVariant],
      zohoLastSyncedAt: now,
      zohoSyncStatus: "synced",
      zohoSyncError: "",
      createdAt: now,
      updatedAt: now
    });
    await existingProduct.save();
  } else {
    const currentVariants = (existingProduct.variants || []).map((v: any) =>
      typeof v.toObject === "function" ? v.toObject() : v
    );
    const variantIndex = currentVariants.findIndex(
      (v: any) => v.zohoItemId === itemId || v.sku === sku
    );

    if (variantIndex >= 0) {
      currentVariants[variantIndex] = { ...currentVariants[variantIndex], ...newVariant };
    } else {
      currentVariants.push(newVariant);
    }

    const mergedImages = Array.from(new Set([...(existingProduct.images || []), ...finalVariantImages])).filter(Boolean);
    const mergedCfIds = Array.from(
      new Set([...(existingProduct.cloudflareImageIds || []), ...finalVariantCfIds])
    ).filter(Boolean);

    // Update product-level details from Zoho
    if (title) existingProduct.title = title;
    const newDescription = finalItem.description || item.description;
    if (newDescription) existingProduct.description = newDescription;
    if (price && price > 0) {
      existingProduct.price = price;
      existingProduct.salePrice = price;
      existingProduct.sellPoints = Number((price / 5).toFixed(2));
    }
    if (categoryName) existingProduct.category = categoryName;
    if (subcategoryName) existingProduct.subcategory = subcategoryName;
    if (item.status) existingProduct.isActive = item.status === "active";

    existingProduct.set("variants", currentVariants);
    existingProduct.images = mergedImages;
    existingProduct.cloudflareImageIds = mergedCfIds;
    existingProduct.updatedAt = now;
    existingProduct.zohoLastSyncedAt = now;

    // Always ensure zohoGroupId is stamped — in case product was found via variant lookup
    if (groupId && !existingProduct.zohoGroupId) {
      existingProduct.zohoGroupId = groupId;
    }
    await existingProduct.save();
  }

  return { zohoItemId: itemId, productId: existingProduct.id, sku, title };
}

export async function syncZohoItemsToProducts() {
  let data: any = {};
  try {
    data = await fetchZohoItems();
  } catch (err) {
    console.error("Zoho fetchItems rate limited or failed:", err);
    return {
      success: true,
      synced: 0,
      results: [],
      warning: "Zoho API rate limit reached. Please wait a moment before syncing again."
    };
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const results = [];

  // In-memory cache: key = "groupId::color" → { imageUrls, cloudflareImageIds }
  // Prevents re-fetching Zoho document images for same-color variants (e.g. Blue/S, Blue/M, Blue/L)
  const sessionColorImageCache = new Map<string, { imageUrls: string[]; cloudflareImageIds: string[] }>();

  for (const item of items) {
    const itemId = String(item.item_id || "");
    if (!itemId) continue;

    try {
      const result = await syncSingleZohoItemToProduct(item, item, sessionColorImageCache);
      if (result) results.push(result);
    } catch (err) {
      console.error(`Failed to sync item ${itemId}`, err);
    }
  }

  invalidateBackendCache("/api/products");
  invalidateBackendCache("/api/categories");

  return { success: true, synced: results.length, results };
}

function getZohoItemStock(item: any) {
  const rawStock =
    item?.available_stock ??
    item?.stock_on_hand ??
    item?.actual_available_stock ??
    item?.current_stock ??
    item?.quantity_available ??
    0;
  const stock = Number(rawStock);
  return Number.isFinite(stock) ? stock : 0;
}

function buildZohoItemPayload(product: any, variant: any) {
  const variantLabel = [variant.size, variant.color].filter(Boolean).join(" / ");
  const name = variantLabel ? `${product.title} - ${variantLabel}` : product.title;
  const stock = Number(variant.availableStock || 0);

  return {
    name,
    sku: variant.sku,
    unit: "qty",
    product_type: "goods",
    item_type: "inventory",
    rate: Number(product.salePrice || product.price || 0),
    purchase_rate: Number(product.price || product.salePrice || 0),
    description: product.description || product.title,
    initial_stock: stock,
    initial_stock_rate: Number(product.price || product.salePrice || 0)
  };
}

async function findZohoItemBySku(sku: string) {
  const data = await zohoRequest(`/items?search_text=${encodeURIComponent(sku)}`);
  const items = data.items || [];
  return items.find((item: any) => item.sku === sku) || null;
}

async function updateVariantZohoState(productId: string, sku: string, update: Record<string, unknown>) {
  await Product.findOneAndUpdate(
    { id: productId, "variants.sku": sku },
    {
      $set: Object.fromEntries(
        Object.entries(update).map(([key, value]) => [`variants.$.${key}`, value])
      )
    }
  );
}

export async function syncProductToZoho(productId: string) {
  const product = await Product.findOne({ id: productId });
  if (!product) {
    throw new Error("Product not found");
  }

  const results: ZohoVariantResult[] = [];
  const now = new Date().toISOString();

  for (const variant of product.variants || []) {
    if (!variant.sku) {
      results.push({ sku: "", status: "skipped", error: "Variant SKU is missing" });
      continue;
    }

    try {
      const payload = buildZohoItemPayload(product, variant);
      let zohoItemId = variant.zohoItemId;

      if (!zohoItemId) {
        const existing = await findZohoItemBySku(variant.sku);
        zohoItemId = existing?.item_id;
      }

      const data = zohoItemId
        ? await zohoRequest(`/items/${zohoItemId}`, { method: "PUT", body: JSON.stringify(payload) })
        : await zohoRequest("/items", { method: "POST", body: JSON.stringify(payload) });

      const item = data.item || data;
      const itemId = item.item_id || zohoItemId;

      await updateVariantZohoState(product.id, variant.sku, {
        zohoItemId: itemId,
        zohoLastSyncedAt: now,
        zohoSyncStatus: "synced",
        zohoSyncError: ""
      });

      results.push({ sku: variant.sku, zohoItemId: itemId, status: "synced" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Zoho sync failed";
      await updateVariantZohoState(product.id, variant.sku, {
        zohoLastSyncedAt: now,
        zohoSyncStatus: "failed",
        zohoSyncError: message
      });
      results.push({ sku: variant.sku, status: "failed", error: message });
    }
  }

  const failed = results.some((result) => result.status === "failed");
  await Product.findOneAndUpdate(
    { id: product.id },
    {
      zohoLastSyncedAt: now,
      zohoSyncStatus: failed ? "partial_failed" : "synced",
      zohoSyncError: failed ? "One or more variants failed to sync" : ""
    }
  );

  return { productId: product.id, results };
}

export async function syncAllProductsToZoho() {
  const products = await Product.find();
  const results = [];

  for (const product of products) {
    results.push(await syncProductToZoho(product.id));
  }

  return results;
}

export async function pullZohoStockForProduct(productId: string) {
  const product = await Product.findOne({ id: productId });
  if (!product) {
    throw new Error("Product not found");
  }

  const results: ZohoVariantResult[] = [];
  const now = new Date().toISOString();

  for (const variant of product.variants || []) {
    try {
      const item = variant.zohoItemId
        ? (await zohoRequest(`/items/${variant.zohoItemId}`)).item
        : await findZohoItemBySku(variant.sku);

      if (!item?.item_id) {
        throw new Error("Matching Zoho item not found");
      }

      const stock = getZohoItemStock(item);
      const { categoryName, subcategoryName } = getZohoItemCategoryInfo(item);
      const previousStock = Number(variant.availableStock || 0);

      if (categoryName) {
        const categorySlug = slugify(categoryName);
        await Category.findOneAndUpdate(
          {
            $or: [
              { slug: categorySlug },
              { name: categoryName }
            ]
          },
          {
            $set: {
              name: categoryName,
              slug: categorySlug,
              description: categoryName,
              isActive: true,
              updatedAt: now
            },
            $setOnInsert: {
              id: crypto.randomUUID(),
              sortOrder: 0,
              createdAt: now
            }
          },
          { upsert: true }
        );
      }

      await Product.findOneAndUpdate(
        { id: product.id, "variants.sku": variant.sku },
        {
          $set: {
            category: categoryName,
            subcategory: subcategoryName || undefined,
            "variants.$.availableStock": stock,
            "variants.$.zohoItemId": item.item_id,
            "variants.$.zohoLastSyncedAt": now,
            "variants.$.zohoSyncStatus": "synced",
            "variants.$.zohoSyncError": ""
          }
        }
      );

      if (previousStock !== stock) {
        await new InventoryLedger({
          id: crypto.randomUUID(),
          productId: product.id,
          sku: variant.sku,
          type: "Admin_Adjustment",
          qtyChanged: stock - previousStock,
          remarks: "Zoho Inventory stock sync",
          createdAt: now
        }).save();
      }

      results.push({ sku: variant.sku, zohoItemId: item.item_id, status: "synced", stock });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Zoho stock sync failed";
      await updateVariantZohoState(product.id, variant.sku, {
        zohoLastSyncedAt: now,
        zohoSyncStatus: "failed",
        zohoSyncError: message
      });
      results.push({ sku: variant.sku, status: "failed", error: message });
    }
  }

  const failed = results.some((result) => result.status === "failed");
  await Product.findOneAndUpdate(
    { id: product.id },
    {
      zohoLastSyncedAt: now,
      zohoSyncStatus: failed ? "partial_failed" : "synced",
      zohoSyncError: failed ? "One or more variants failed to pull stock" : ""
    }
  );

  return { productId: product.id, results };
}

export async function pullAllZohoStock() {
  const products = await Product.find();
  const results = [];

  for (const product of products) {
    results.push(await pullZohoStockForProduct(product.id));
  }

  return results;
}

export async function syncZohoCategoriesToDb() {
  const data = await fetchZohoItemGroups();
  const groups = Array.isArray(data.itemgroups) ? data.itemgroups : [];
  const results = [];
  
  for (const group of groups) {
    const name = group.group_name || group.name || `Category ${group.group_id}`;
    if (!name) continue;
    
    const slug = slugify(name);
    
    const cat = await Category.findOneAndUpdate(
      { slug },
      {
        $set: {
          name,
          slug,
          description: group.description || name,
          isActive: group.status === "active",
          updatedAt: new Date().toISOString()
        },
        $setOnInsert: {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true, new: true }
    );
    results.push({ id: cat.id, name });
  }
  return { synced: results.length, results };
}

export async function syncZohoContactsToUsers() {
  const data = await fetchZohoContacts();
  const contacts = Array.isArray(data.contacts) ? data.contacts : [];
  const results = [];

  for (const contact of contacts) {
    if (!contact.email) continue;
    
    const user = await User.findOneAndUpdate(
      { email: contact.email },
      {
        $set: {
          firstName: contact.first_name || contact.contact_name,
          lastName: contact.last_name || "",
          name: contact.contact_name,
          phone: contact.phone || contact.mobile,
          updatedAt: new Date().toISOString()
        },
        $setOnInsert: {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true, new: true }
    );
    results.push({ id: user.id, email: user.email });
  }
  return { synced: results.length, results };
}

export async function syncZohoSalesOrdersToOrders() {
  const data = await fetchZohoSalesOrders();
  const salesorders = Array.isArray(data.salesorders) ? data.salesorders : [];
  const results = [];

  for (const so of salesorders) {
    const orderNumber = so.salesorder_number;
    if (!orderNumber) continue;
    
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      {
        $set: {
          date: so.date,
          total: so.total,
          statusText: so.status,
          updatedAt: new Date().toISOString()
        },
        $setOnInsert: {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true, new: true }
    );
    results.push({ id: order.id, orderNumber });
  }
  return { synced: results.length, results };
}
