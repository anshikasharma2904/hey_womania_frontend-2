"use client";

import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus, FaShoppingBag, FaHeart, FaRegHeart } from "react-icons/fa";
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
  onColorChange?: (colorName: string) => void;
}

export function ProductOptionsClient({ product, onColorChange }: ProductOptionsClientProps) {
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
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);

  // Trigger color change callback for the first color on mount
  useEffect(() => {
    if (colors.length > 0 && colors[0]?.name) {
      onColorChange?.(colors[0].name);
    }
  }, []);

  // Find currently matched variant & stock
  let matchedVariant = variants.find(
    (v) =>
      v.size?.toUpperCase() === selectedSize.toUpperCase() &&
      v.color?.toLowerCase() === selectedColor.toLowerCase()
  );
  if (!matchedVariant) {
    matchedVariant = variants.find(
      (v) => v.size?.toUpperCase() === selectedSize.toUpperCase()
    );
  }
  if (!matchedVariant && variants.length > 0) {
    matchedVariant = variants[0];
  }

  // Calculate available stock for selected variant
  let availableStock = 999;
  if (variants.length > 0) {
    if (matchedVariant && matchedVariant.availableStock !== undefined) {
      availableStock = Math.max(0, matchedVariant.availableStock);
    } else {
      availableStock = variants.reduce(
        (sum, v) => sum + Math.max(0, v.availableStock || 0),
        0
      );
    }
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
    const colorName =
      colors.find((c) => c.value === selectedColor)?.name || "Olive";
    const productId = product.id || product.name;

    return {
      productId,
      title: product.name,
      image: product.image || "/products/product-placeholder.png",
      images: product.gallery || [],
      sku,
      size: selectedSize,
      color: colorName,
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

  // Check if a specific color has stock for the selected size (or overall if no size)
  const isColorStockAvailable = (colorName: string) => {
    if (variants.length === 0) return true;
    const exactVariant = variants.find(
      (v) =>
        v.color?.toLowerCase().trim() === colorName.toLowerCase().trim() &&
        v.size?.toUpperCase().trim() === selectedSize.toUpperCase().trim()
    );
    if (exactVariant) {
      return (exactVariant.availableStock ?? 1) > 0;
    }
    const colorVariants = variants.filter(
      (v) => v.color?.toLowerCase().trim() === colorName.toLowerCase().trim()
    );
    if (colorVariants.length === 0) return false;
    return colorVariants.some((v) => (v.availableStock ?? 1) > 0);
  };

  // Check if a specific size has stock for the selected color (or overall if no color)
  const isSizeStockAvailable = (sizeName: string) => {
    if (variants.length === 0) return true;
    const exactVariant = variants.find(
      (v) =>
        v.size?.toUpperCase().trim() === sizeName.toUpperCase().trim() &&
        v.color?.toLowerCase().trim() === selectedColor.toLowerCase().trim()
    );
    if (exactVariant) {
      return (exactVariant.availableStock ?? 1) > 0;
    }
    const sizeVariants = variants.filter(
      (v) => v.size?.toUpperCase().trim() === sizeName.toUpperCase().trim()
    );
    if (sizeVariants.length === 0) return false;
    return sizeVariants.some((v) => (v.availableStock ?? 1) > 0);
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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
            Colour
          </p>
          <div className="mt-3 flex gap-3">
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
                  onClick={() => {
                    setSelectedColor(color.name);
                    onColorChange?.(color.name);
                  }}
                  className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border shadow-sm transition-all duration-200 ${
                    isSelected
                      ? "scale-110 border-[#111111] ring-2 ring-[#ece6df]"
                      : "border-[#ddd5cc] hover:scale-105"
                  } ${!isAvailable ? "opacity-80" : ""}`}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Select color ${color.name} ${!isAvailable ? "(Out of stock)" : ""}`}
                >
                  {colorVariantImg ? (
                    <img
                      src={colorVariantImg}
                      alt={color.name}
                      className="h-full w-full rounded-full"
                    />
                  ) : null}

                  {!isAvailable && (
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full z-10"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      {/* Contrast shadow line */}
                      <line
                        x1="4"
                        y1="28"
                        x2="28"
                        y2="4"
                        stroke="#ffffff"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                      {/* Primary crisp diagonal slash */}
                      <line
                        x1="4"
                        y1="28"
                        x2="28"
                        y2="4"
                        stroke="#111111"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
            Size
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isAvailable = isSizeStockAvailable(size);
              const isSelected = size === selectedSize;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`relative overflow-hidden rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-[#111111] text-white shadow-md"
                      : "border border-[#ddd5cc] bg-white text-[#6d655d] hover:bg-[#f4efe8]"
                  } ${!isAvailable ? "opacity-75" : ""}`}
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
                        stroke={isSelected ? "#ffffff" : "#111111"}
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

      {/* Wishlist Button */}
      <div className="mt-4 flex">
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
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-[#9c4049] transition-all hover:opacity-80 active:scale-95"
        >
          {isWishbagged((product as any).slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) ? (
            <><FaHeart className="text-base" /> Remove from Wishbag</>
          ) : (
            <><FaRegHeart className="text-base" /> Add to Wishbag</>
          )}
        </button>
      </div>
    </div>
  );
}
