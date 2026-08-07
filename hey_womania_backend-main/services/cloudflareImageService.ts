type CloudflareImageConfig = {
  accountId: string;
  apiToken: string;
  email?: string;
  deliveryBaseUrl?: string;
};

export type UploadedCloudflareImage = {
  id: string;
  url: string;
};

function getCloudflareImageConfig(): CloudflareImageConfig | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
  const email = process.env.CLOUDFLARE_EMAIL || process.env.SHIPROCKET_EMAIL || process.env.EMAIL_USER;
  const deliveryHash = process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH || "xcfP08AjIq0qrHgFMvkROA";
  const deliveryBaseUrl = process.env.CLOUDFLARE_IMAGES_DELIVERY_BASE_URL
    || (deliveryHash ? `https://imagedelivery.net/${deliveryHash}` : undefined);

  if (!accountId || !apiToken) {
    console.error("[Cloudflare Config Warning] CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_IMAGES_API_TOKEN missing from server environment!");
    return null;
  }

  return {
    accountId,
    apiToken,
    email,
    deliveryBaseUrl
  };
}

function getCloudflareAuthHeaders(config: CloudflareImageConfig): Record<string, string> {
  if (config.apiToken.startsWith("cfk_") || config.email) {
    return {
      "X-Auth-Key": config.apiToken,
      "X-Auth-Email": config.email || "hwomaniyaa@gmail.com"
    };
  }
  return {
    Authorization: `Bearer ${config.apiToken}`
  };
}

export function isCloudflareImageUploadConfigured() {
  return Boolean(getCloudflareImageConfig());
}

export async function uploadImageToCloudflare(
  input: Buffer,
  fileName: string,
  sourceLabel: string
): Promise<UploadedCloudflareImage | null> {
  const config = getCloudflareImageConfig();
  if (!config) {
    return null;
  }

  const formData = new FormData();
  const bytes = new Uint8Array(input);
  formData.append("file", new Blob([bytes]), fileName);
  formData.append("metadata", JSON.stringify({ source: sourceLabel }));
  formData.append("requireSignedURLs", "false");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/images/v1`,
    {
      method: "POST",
      headers: getCloudflareAuthHeaders(config),
      body: formData
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.success || !data?.result?.id) {
    const message =
      data?.errors?.[0]?.message ||
      data?.messages?.[0]?.message ||
      data?.result?.message ||
      "Cloudflare image upload failed";
    throw new Error(message);
  }

  const imageId = String(data.result.id);
  let deliveryUrl = "";

  if (Array.isArray(data.result.variants) && data.result.variants.length > 0) {
    deliveryUrl = String(data.result.variants[0]);
  } else if (config.deliveryBaseUrl) {
    deliveryUrl = `${config.deliveryBaseUrl}/${imageId}/public`;
  }

  return {
    id: imageId,
    url: deliveryUrl
  };
}

export async function uploadImageUrlToCloudflare(
  imageUrl: string,
  sourceLabel: string
): Promise<UploadedCloudflareImage | null> {
  const config = getCloudflareImageConfig();
  if (!config) {
    return null;
  }

  const formData = new FormData();
  formData.append("url", imageUrl);
  formData.append("metadata", JSON.stringify({ source: sourceLabel }));
  formData.append("requireSignedURLs", "false");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/images/v1`,
    {
      method: "POST",
      headers: getCloudflareAuthHeaders(config),
      body: formData
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.success || !data?.result?.id) {
    const message =
      data?.errors?.[0]?.message ||
      data?.messages?.[0]?.message ||
      data?.result?.message ||
      "Cloudflare image URL upload failed";
    throw new Error(message);
  }

  const imageId = String(data.result.id);
  let deliveryUrl = "";

  if (Array.isArray(data.result.variants) && data.result.variants.length > 0) {
    deliveryUrl = String(data.result.variants[0]);
  } else if (config.deliveryBaseUrl) {
    deliveryUrl = `${config.deliveryBaseUrl}/${imageId}/public`;
  }

  return {
    id: imageId,
    url: deliveryUrl
  };
}

export async function processProductImagesForCloudflare(images: string[], productTitle: string) {
  if (!isCloudflareImageUploadConfigured() || !Array.isArray(images) || images.length === 0) {
    return { images: images || [], cloudflareImageIds: [] };
  }

  const updatedImages: string[] = [];
  const cloudflareImageIds: string[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const img = images[index];
    if (!img) continue;

    if (img.includes("imagedelivery.net") || img.includes("cloudflare")) {
      updatedImages.push(img);
      const match = img.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
      if (match && match[1]) {
        cloudflareImageIds.push(match[1]);
      }
      continue;
    }

    try {
      if (img.startsWith("http")) {
        const uploaded = await uploadImageUrlToCloudflare(img, `product-${productTitle}-${index + 1}`);
        if (uploaded?.url) {
          updatedImages.push(uploaded.url);
          if (uploaded.id) cloudflareImageIds.push(uploaded.id);
        } else {
          updatedImages.push(img);
        }
      } else {
        updatedImages.push(img);
      }
    } catch (err) {
      console.error(`Failed to upload product image to Cloudflare:`, err);
      updatedImages.push(img);
    }
  }

  return { images: updatedImages, cloudflareImageIds };
}

export async function deleteImageFromCloudflare(imageId: string): Promise<boolean> {
  const config = getCloudflareImageConfig();
  if (!config || !imageId) {
    return false;
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/images/v1/${imageId}`,
      {
        method: "DELETE",
        headers: getCloudflareAuthHeaders(config)
      }
    );
    const data = await response.json().catch(() => ({}));
    return response.ok && Boolean(data?.success);
  } catch (err) {
    console.error(`Failed to delete image ${imageId} from Cloudflare:`, err);
    return false;
  }
}
