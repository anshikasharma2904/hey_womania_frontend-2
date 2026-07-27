type CloudflareImageConfig = {
  accountId: string;
  apiToken: string;
  deliveryBaseUrl?: string;
};

function getCloudflareImageConfig(): CloudflareImageConfig | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
  const deliveryHash = process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH;
  const deliveryBaseUrl = process.env.CLOUDFLARE_IMAGES_DELIVERY_BASE_URL
    || (deliveryHash ? `https://imagedelivery.net/${deliveryHash}` : undefined);

  if (!accountId || !apiToken) {
    return null;
  }

  return {
    accountId,
    apiToken,
    deliveryBaseUrl
  };
}

export function isCloudflareImageUploadConfigured() {
  return Boolean(getCloudflareImageConfig());
}

export async function uploadImageToCloudflare(
  input: Buffer,
  fileName: string,
  sourceLabel: string
) {
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
      headers: {
        Authorization: `Bearer ${config.apiToken}`
      },
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

  if (Array.isArray(data.result.variants) && data.result.variants.length > 0) {
    return String(data.result.variants[0]);
  }

  if (config.deliveryBaseUrl) {
    return `${config.deliveryBaseUrl}/${data.result.id}/public`;
  }

  return null;
}
