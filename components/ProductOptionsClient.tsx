"use client";

import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus, FaShoppingBag, FaHeart, FaRegHeart, FaShareAlt } from "react-icons/fa";
import { useWishbag } from "@/contexts/WishbagContext";

interface Variant {
  sku?: string;
  size?: string;
  color?: string;
  availableStock?: number;
  images?: string[];
}

interface ProductOptionsClientProps {
  product: {
    id?: string;
    name: string;
    price: string;
    image?: string;
    gallery?: string[];
    variants?: Variant[];
  };
  onColorChange?: (colorName: string, images?: string[]) => void;
  customerReferralCode?: string;
}

export function ProductOptionsClient({ product, onColorChange, customerReferralCode }: ProductOptionsClientProps) {
  const { isWishbagged, addToWishbag, removeFromWishbag } = useWishbag();
  const variants = product.variants || [];

  // Canonical size order for clothing
  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

  // Extract dynamic unique sizes from product variants, sorted in clothing order
  const sizes = Array.from(
    new Set(
      variants
        .map((v) => (v.size || "").trim())
        .filter((s) => s && !["DEFAULT", "QTY", "BOX", "PCS", "PIECES"].includes(s.toUpperCase()))
    )
  ).sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const uniqueColorsMap = new Map<string, string>();
  variants.forEach((v) => {
    const c = (v.color || "").trim();
    if (
      c &&
      !["DEFAULT", "QTY", "BOX", "PCS"].includes(c.toUpperCase()) &&
      !SIZE_ORDER.includes(c.toUpperCase())
    ) {
      const lowerKey = c.toLowerCase();
      if (!uniqueColorsMap.has(lowerKey)) {
        uniqueColorsMap.set(lowerKey, c.charAt(0).toUpperCase() + c.slice(1).toLowerCase());
      }
    }
  });
  const dynamicColors = Array.from(uniqueColorsMap.values());

  const colorMap: Record<string, string> = {
    Blue: "#2563eb",
    Red: "#dc2626",
    Yellow: "#eab308",
    Green: "#16a34a",
    Black: "#111111",
    White: "#ffffff",
    Pink: "#ec4899",
    "Blush Pink": "#f472b6",
    "Mocha Brown": "#78350f",
    "Chocolate Brown": "#451a03",
    "Rust Brown": "#9a3412",
    "Brown": "#78350f",
    "Sky Blue": "#38bdf8",
    "Mint Green": "#34d399",
    "Emerald Green": "#059669",
    Ivory: "#fef3c7",
    Navy: "#1e3a8a",
    Beige: "#f59e0b",
    Maroon: "#881337",
    Grey: "#6b7280",
    Gray: "#6b7280",
    Cream: "#fffbeb",
    Orange: "#f97316",
    Purple: "#9333ea"
  };

  const colors = dynamicColors.map((name) => ({ name, value: colorMap[name] || "#5a573d" }));

  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "");

  const getInitialSize = () => {
    const initialColor = colors[0]?.name;
    if (initialColor) {
      const variantForColor = variants.find(
        (v) =>
          v.color?.toLowerCase().trim() === initialColor.toLowerCase().trim() &&
          (v.availableStock ?? 0) > 0 &&
          v.size &&
          !["DEFAULT", "QTY", "BOX", "PCS"].includes(v.size.toUpperCase())
      );
      if (variantForColor?.size) return variantForColor.size.trim();
    }
    return sizes[0] || "";
  };

  const [selectedSize, setSelectedSize] = useState(getInitialSize);
  const [quantity, setQuantity] = useState(1);

  // Trigger color change callback for the first color on mount
  useEffect(() => {
    if (colors.length > 0 && colors[0]?.name) {
      onColorChange?.(colors[0].name);
    }
  }, []);

  // Find currently matched variant & stock for the selected color & size
  let matchedVariant: Variant | null | undefined = null;

  if (colors.length > 0 && sizes.length > 0) {
    matchedVariant = variants.find(
      (v) =>
        v.size?.toUpperCase().trim() === selectedSize.toUpperCase().trim() &&
        v.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim()
    );
  } else if (colors.length > 0) {
    matchedVariant = variants.find(
      (v) => v.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim()
    );
  } else if (sizes.length > 0) {
    matchedVariant = variants.find(
      (v) => v.size?.toUpperCase().trim() === selectedSize.toUpperCase().trim()
    );
  }

  // Fallback: for single/default variant products (e.g. jewellery, bags, one-size accessories)
  if (!matchedVariant && variants.length > 0) {
    matchedVariant = variants[0];
  }

  // Calculate available stock for selected variant
  let availableStock = 0;
  if (variants.length === 0) {
    availableStock = 999;
  } else if (matchedVariant && matchedVariant.availableStock !== undefined) {
    availableStock = Math.max(0, matchedVariant.availableStock);
  } else {
    availableStock = variants.reduce(
      (sum, v) => sum + Math.max(0, v.availableStock || 0),
      0
    );
  }

  const isOutOfStock = availableStock === 0;
  const currentQuantity = isOutOfStock ? 0 : Math.min(quantity, availableStock);

  const handleIncrement = () => {
    if (isOutOfStock) return;
    setQuantity((prev) => (prev < availableStock ? prev + 1 : prev));
  };

  const handleDecrement = () => {
    if (isOutOfStock) return;
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const getCartDetails = () => {
    const sku =
      matchedVariant?.sku ||
      `${product.name.replace(/\s+/g, "-").toUpperCase()}-${selectedColor.replace("#", "")}-${selectedSize}`;
    const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, ""));
    const colorName = selectedColor || colors[0]?.name || "";
    const productId = product.id || product.name;
    const variantImage =
      matchedVariant?.images?.[0] || product.image || "/products/product-placeholder.png";

    return {
      productId,
      title: product.name,
      image: variantImage,
      images:
        matchedVariant?.images && matchedVariant.images.length > 0
          ? matchedVariant.images
          : product.gallery || [],
      sku,
      size: selectedSize || matchedVariant?.size || "One Size",
      color: colorName || matchedVariant?.color || "Standard",
      salePrice: numericPrice,
      quantity: Math.max(1, currentQuantity)
    };
  };

  const handleAddToCart = () => {
    if (typeof window === "undefined" || isOutOfStock) return;

    const currentCartRaw = localStorage.getItem("hey_womania_cart");
    const currentCart = currentCartRaw ? JSON.parse(currentCartRaw) : [];
    const itemDetails = getCartDetails();

    const existingIndex = currentCart.findIndex(
      (item: any) => item.sku === itemDetails.sku
    );

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity = Math.min(
        currentCart[existingIndex].quantity + itemDetails.quantity,
        availableStock
      );
      // Also update maxStock for fallback on cart page
      currentCart[existingIndex].maxStock = availableStock;
    } else {
      currentCart.push({ ...itemDetails, maxStock: availableStock });
    }

    localStorage.setItem("hey_womania_cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart_updated"));
    window.location.href = "/cart";
  };

  const handleBuyNow = () => {
    if (typeof window === "undefined" || isOutOfStock) return;

    const itemDetails = getCartDetails();
    localStorage.setItem("hey_womania_cart", JSON.stringify([itemDetails]));

    window.dispatchEvent(new Event("cart_updated"));
    window.location.href = "/checkout";
  };

  const handleShareProduct = () => {
    let url = window.location.href;
    if (customerReferralCode) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}ref=${customerReferralCode}&type=customer`;
    }
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Hey Womaniyaa!`,
        url: url
      }).catch(err => {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          alert("Link copied to clipboard!");
        }
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  // Check if a specific color has stock overall
  const isColorStockAvailable = (colorName: string) => {
    if (variants.length === 0) return true;
    const colorVariants = variants.filter(
      (v) => v.color?.toLowerCase().trim() === colorName.toLowerCase().trim()
    );
    if (colorVariants.length === 0) return false;
    return colorVariants.some((v) => (v.availableStock ?? 0) > 0);
  };

  // Check if a specific size has stock for the selected color (or overall if no color options)
  const isSizeStockAvailable = (sizeName: string) => {
    if (variants.length === 0) return true;
    if (colors.length > 0 && selectedColor) {
      const exactVariant = variants.find(
        (v) =>
          v.size?.toUpperCase().trim() === sizeName.toUpperCase().trim() &&
          v.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim()
      );
      return Boolean(exactVariant && (exactVariant.availableStock ?? 0) > 0);
    }
    const sizeVariants = variants.filter(
      (v) => v.size?.toUpperCase().trim() === sizeName.toUpperCase().trim()
    );
    if (sizeVariants.length === 0) return false;
    return sizeVariants.some((v) => (v.availableStock ?? 0) > 0);
  };

  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);

    const colorVariants = variants.filter(
      (v) => v.color?.toLowerCase().trim() === colorName.toLowerCase().trim()
    );
    const colorImgs = Array.from(
      new Set(colorVariants.flatMap((v) => v.images || []).filter(Boolean))
    );
    onColorChange?.(colorName, colorImgs);

    // Check if currently selected size exists with stock for this new color
    const exactVariant = variants.find(
      (v) =>
        v.size?.toUpperCase().trim() === selectedSize.toUpperCase().trim() &&
        v.color?.toLowerCase().trim() === colorName.toLowerCase().trim() &&
        (v.availableStock ?? 0) > 0
    );

    // If current size does NOT exist in the new color, auto-switch to the first available size of this new color!
    if (!exactVariant) {
      const firstAvailable = variants.find(
        (v) =>
          v.color?.toLowerCase().trim() === colorName.toLowerCase().trim() &&
          (v.availableStock ?? 0) > 0 &&
          v.size &&
          !["DEFAULT", "QTY", "BOX", "PCS"].includes(v.size.toUpperCase())
      );
      if (firstAvailable?.size) {
        setSelectedSize(firstAvailable.size.trim());
      }
    }
  };

  const handleSizeClick = (sizeName: string) => {
    const isAvailableInCurrentColor = isSizeStockAvailable(sizeName);

    if (isAvailableInCurrentColor) {
      setSelectedSize(sizeName);
      // Check if this variant has specific images
      const exactVariant = variants.find(
        (v) =>
          v.size?.toUpperCase().trim() === sizeName.toUpperCase().trim() &&
          v.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim() &&
          v.images &&
          v.images.length > 0
      );
      if (exactVariant?.images && exactVariant.images.length > 0) {
        onColorChange?.(selectedColor, exactVariant.images);
      }
      return;
    }

    // If not available in current color, check if another color has this size in stock
    const alternateColorVariant = variants.find(
      (v) =>
        v.size?.toUpperCase().trim() === sizeName.toUpperCase().trim() &&
        (v.availableStock ?? 0) > 0 &&
        v.color &&
        !["DEFAULT", "QTY", "BOX", "PCS"].includes(v.color.toUpperCase()) &&
        !SIZE_ORDER.includes(v.color.toUpperCase())
    );

    if (alternateColorVariant?.color) {
      const newColorName =
        colors.find((c) => c.name.toLowerCase() === alternateColorVariant.color?.toLowerCase().trim())
          ?.name || alternateColorVariant.color.trim();
      setSelectedColor(newColorName);
      setSelectedSize(sizeName);

      const newColorVariants = variants.filter(
        (v) => v.color?.toLowerCase().trim() === newColorName.toLowerCase().trim()
      );
      const newColorImgs = Array.from(
        new Set(newColorVariants.flatMap((v) => v.images || []).filter(Boolean))
      );
      onColorChange?.(newColorName, newColorImgs);
    } else {
      setSelectedSize(sizeName);
    }
  };

  return (
    <div>
      {/* Stock Status Badge */}
      <div className="mt-4">
        {isOutOfStock ? (
          <span className="inline-block rounded-full bg-[#fde8e8] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#e02424]">
            Out of Stock
          </span>
        ) : (
          <span className="inline-block rounded-full bg-[#def7ec] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#03543f]">
            In Stock
          </span>
        )}
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
              Colour: <span className="font-bold text-[#9c4049]">{selectedColor}</span>
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {colors.map((color) => {
              const isAvailable = isColorStockAvailable(color.name);
              const isSelected = selectedColor.toLowerCase() === color.name.toLowerCase();

              // Find first variant image for this color
              const colorVariantImg = variants.find(
                (v: any) =>
                  v.color?.toLowerCase().trim() === color.name.toLowerCase().trim() &&
                  v.images &&
                  v.images.length > 0 &&
                  v.images[0]
              )?.images?.[0];

              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleColorChange(color.name)}
                  className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-200 ${
                    isSelected
                      ? "border-[#111111] bg-[#111111] text-white shadow-md ring-2 ring-[#ece6df]"
                      : "border-[#e0d8ce] bg-white text-[#4a4238] hover:border-[#b8aea2] hover:bg-[#faf7f2]"
                  } ${!isAvailable ? "opacity-60" : ""}`}
                  aria-label={`Select color ${color.name} ${!isAvailable ? "(Out of stock)" : ""}`}
                >
                  <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-black/10 shadow-inner">
                    {colorVariantImg ? (
                      <img
                        src={colorVariantImg}
                        alt={color.name}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{ backgroundColor: color.value }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-semibold tracking-wide">{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
              Size: <span className="font-bold text-[#111111]">{selectedSize}</span>
            </p>
            {colors.length > 0 && selectedColor && (
              <span className="text-[11px] font-medium text-[#8b837b]">
                For colour: <span className="font-semibold text-[#111111]">{selectedColor}</span>
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const isAvailable = isSizeStockAvailable(size);
              const isSelected = size === selectedSize;

              // Check if this size is available in another color
              const otherColorForSize = !isAvailable
                ? variants.find(
                    (v) =>
                      v.size?.toUpperCase().trim() === size.toUpperCase().trim() &&
                      (v.availableStock ?? 0) > 0 &&
                      v.color &&
                      v.color.toLowerCase().trim() !== selectedColor.toLowerCase().trim()
                  )?.color
                : null;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeClick(size)}
                  className={`group relative overflow-hidden rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-[#111111] text-white shadow-md"
                      : isAvailable
                      ? "border border-[#ddd5cc] bg-white text-[#6d655d] hover:border-[#111111] hover:bg-[#f4efe8]"
                      : "border border-[#e8e2da] bg-[#fbf9f6] text-[#b5ada5] hover:border-[#cfc7be]"
                  } ${!isAvailable ? "opacity-75" : ""}`}
                  title={
                    otherColorForSize
                      ? `Click to switch to ${otherColorForSize} (Size ${size})`
                      : !isAvailable
                      ? `Out of stock for ${selectedColor}`
                      : `Size ${size}`
                  }
                >
                  <span className={!isAvailable ? "opacity-60" : ""}>{size}</span>
                  {!isAvailable && (
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 100"
                      fill="none"
                    >
                      <line
                        x1="10"
                        y1="90"
                        x2="90"
                        y2="10"
                        stroke={isSelected ? "#ffffff" : "#dc2626"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.85"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {/* Helper hint */}
          {sizes.some((s) => !isSizeStockAvailable(s)) && (
            <p className="mt-2 text-[11px] text-[#8b837b]">
              * Struck-through sizes belong to another colour option. Click on them to view that colour and its images.
            </p>
          )}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="mt-7 flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={isOutOfStock || currentQuantity <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd5cc] bg-white text-[#111111] transition hover:bg-[#f4efe8] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          <FaMinus className="text-xs" />
        </button>
        <span className="min-w-8 select-none text-center text-sm font-semibold">
          {currentQuantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={isOutOfStock || currentQuantity >= availableStock}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd5cc] bg-white text-[#111111] transition hover:bg-[#f4efe8] active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <FaPlus className="text-xs" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#888888] disabled:opacity-60"
        >
          <FaShoppingBag className="text-sm" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="rounded-full border border-[#ddd5cc] bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:bg-[#f4efe8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-4 border-t border-[#f0e7de] pt-5">
        <button
          type="button"
          onClick={() => {
            const slugStr = (product as any).slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            if (isWishbagged(slugStr)) {
              removeFromWishbag(slugStr);
            } else {
              addToWishbag({
                slug: slugStr,
                title: product.name,
                category: (product as any).categoryLabel || "Live Collection",
                price: String(product.price),
                image: product.image || "",
                images: product.gallery || [],
                href: `/product/${slugStr}`
              });
            }
          }}
          className="group flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#9c4049] transition-all hover:bg-[#fff4f6] active:scale-95"
        >
          {isWishbagged((product as any).slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) ? (
            <><FaHeart className="text-base transition-transform duration-300 group-hover:scale-110" /> Remove from Wishbag</>
          ) : (
            <><FaRegHeart className="text-base transition-transform duration-300 group-hover:scale-110" /> Add to Wishbag</>
          )}
        </button>

        <div className="h-4 w-px bg-[#e8e2da] hidden sm:block"></div>

        <button
          type="button"
          onClick={handleShareProduct}
          className="group flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#5c5346] transition-all hover:bg-[#f4efe8] hover:text-[#111111] active:scale-95"
        >
          <FaShareAlt className="text-base transition-transform duration-300 group-hover:scale-110" /> Share Product
        </button>
      </div>
    </div>
  );
}
