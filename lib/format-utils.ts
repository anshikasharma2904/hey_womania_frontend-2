export function formatCoOrd(text: string): string {
  if (!text) return text;
  return text.replace(/\bco[\s-]?ords?\b/gi, (match) => {
    return match.toLowerCase().endsWith('s') ? 'Co-Ords' : 'Co-Ord';
  });
}

export function isNoSizeCategory(categoryOrTitle?: string | null): boolean {
  if (!categoryOrTitle) return false;
  const lower = categoryOrTitle.toLowerCase();
  return (
    lower.includes("bag") ||
    lower.includes("handbag") ||
    lower.includes("tote") ||
    lower.includes("sling") ||
    lower.includes("clutch") ||
    lower.includes("jewel") ||
    lower.includes("jewellery") ||
    lower.includes("jewelry") ||
    lower.includes("necklace") ||
    lower.includes("earring") ||
    lower.includes("bangle") ||
    lower.includes("bracelet") ||
    lower.includes("ring") ||
    lower.includes("pendant") ||
    lower.includes("anklet")
  );
}

export function formatItemSize(size?: string | null, categoryOrTitle?: string | null): string {
  if (isNoSizeCategory(categoryOrTitle)) {
    if (!size) return "";
    const s = size.trim();
    const upper = s.toUpperCase();
    if (
      !s ||
      upper === "DEFAULT" ||
      upper === "ONE SIZE" ||
      upper === "ONESIZE" ||
      upper === "FREE SIZE" ||
      upper === "FREESIZE" ||
      upper === "FREE" ||
      upper === "STANDARD" ||
      upper === "REGULAR" ||
      upper === "NA" ||
      upper === "N/A"
    ) {
      return "";
    }
    return s;
  }

  if (!size) return "Free Size";
  const s = size.trim();
  if (!s) return "Free Size";
  const upper = s.toUpperCase();
  if (
    upper === "DEFAULT" ||
    upper === "ONE SIZE" ||
    upper === "ONESIZE" ||
    upper === "FREE SIZE" ||
    upper === "FREESIZE" ||
    upper === "FREE" ||
    upper === "STANDARD" ||
    upper === "REGULAR" ||
    upper === "NA" ||
    upper === "N/A"
  ) {
    return "Free Size";
  }
  return s;
}

const KNOWN_SIZE_REGEX = /^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL|5XL|6XL|FREE\s*SIZE|ONE\s*SIZE)$/i;

export function isSizeValue(val?: string | null): boolean {
  if (!val) return false;
  const cleaned = val.trim();
  if (!cleaned) return false;
  return KNOWN_SIZE_REGEX.test(cleaned);
}
