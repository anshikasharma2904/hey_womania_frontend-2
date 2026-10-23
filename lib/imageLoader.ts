export default function cfLoader({
  src,
  width,
  quality
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (typeof src === "string" && src.includes("imagedelivery.net")) {
    const parts = src.split("/").filter(Boolean);
    // Find the image ID which precedes the variant name (e.g., .../<accountHash>/<id>/public)
    const id = parts[parts.length - 2];
    if (id && id !== "imagedelivery.net") {
      const q = quality || 75;
      return `https://imagedelivery.net/xcfP08AjIq0qrHgFMvkROA/${id}/w=${width},q=${q}`;
    }
  }
  // For local or external non-Cloudflare images, return src with width query for Next.js loader contract
  if (typeof src === "string" && (src.startsWith("/") || src.startsWith("http"))) {
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }
  return src;
}
