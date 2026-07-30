"use client";

import React, { useState } from "react";
import { FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";

interface Variant {
  sku?: string;
  size?: string;
  color?: string;
  availableStock?: number;
}

interface ProductOptionsClientProps {
  product: {
    id?: string;
    name: string;
    price: string;
    image?: string;
    variants?: Variant[];
  };
}

export function ProductOptionsClient({ product }: ProductOptionsClientProps) {
  const [selectedColor, setSelectedColor] = useState("#5a573d");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const colors = [
    { value: "#5a573d", name: "Olive" },
    { value: "#d8c0ae", name: "Beige" },
    { value: "#3f3428", name: "Brown" },
    { value: "#8f6b63", name: "Rosewood" }
  ];

  const sizes = ["XS", "S", "M", "L", "XL"];

  // Find currently matched variant & stock
  const variants = product.variants || [];
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

  // Calculate available stock
  let availableStock = 999; // Default if no variants defined
  if (variants.length > 0) {
    if (matchedVariant && matchedVariant.availableStock !== undefined) {
      availableStock = Math.max(0, matchedVariant.availableStock);
    } else {
      // Sum all stock across variants as fallback
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
      currentCart[existingIndex].quantity += itemDetails.quantity;
    } else {
      currentCart.push(itemDetails);
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
      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
          Colour
        </p>
        <div className="mt-3 flex gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className={`h-8 w-8 rounded-full border transition-all duration-200 ${
                selectedColor === color.value
                  ? "scale-110 border-[#111111] ring-2 ring-[#ece6df]"
                  : "border-[#ddd5cc] hover:scale-105"
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={`Select color ${color.name}`}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
          Size
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                size === selectedSize
                  ? "bg-[#111111] text-white shadow-md"
                  : "border border-[#ddd5cc] bg-white text-[#6d655d] hover:bg-[#f4efe8]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

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
    </div>
  );
}
