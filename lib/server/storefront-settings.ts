import "server-only";

export type StorefrontSettings = {
  heroVideoMobile?: string;
  categoryImages: Record<string, string>;
};

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${apiUrl}/api/settings`, {
      next: { revalidate: 60, tags: ["storefront-settings"] },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { categoryImages: {} };
    const data = await response.json();
    const categoryImages = Object.fromEntries(
      Object.entries(data.categoryImages || {}).filter((entry): entry is [string, string] => typeof entry[1] === "string")
    );
    return {
      heroVideoMobile: typeof data.heroVideoMobile === "string" ? data.heroVideoMobile : undefined,
      categoryImages,
    };
  } catch {
    return { categoryImages: {} };
  }
}
