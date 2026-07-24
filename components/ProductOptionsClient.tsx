"use client";

import React, { useState } from "react";
import { FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";

interface ProductOptionsClientProps {
  product: {
    name: string;
    price: string;
    image?: string;
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

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const getCartDetails = () => {
    // Search for variants
    const variants = (product as any).variants || [];
    let matchedVariant = variants.find(
      (v: any) => v.size === selectedSize && v.color?.toLowerCase() === selectedColor?.toLowerCase()
    );
    if (!matchedVariant) {
      // Fallback matching size only
      matchedVariant = variants.find((v: any) => v.size === selectedSize);
    }
    if (!matchedVariant && variants.length > 0) {
      // Fallback to first variant
      matchedVariant = variants[0];
    }

    const sku = matchedVariant?.sku || `${product.name.replace(/\s+/g, "-").toUpperCase()}-${selectedColor.replace("#", "")}-${selectedSize}`;
    const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, ""));
    const colorName = colors.find((c) => c.value === selectedColor)?.name || "Olive";
    const productId = (product as any).id || product.name;

    return {
      productId,
      title: product.name,
      image: product.image || "/products/product-placeholder.png",
      sku,
      size: selectedSize,
      color: colorName,
      salePrice: numericPrice,
      quantity
    };
  };

  const handleAddToCart = () => {
    if (typeof window === "undefined") return;

    const currentCartRaw = localStorage.getItem("hey_womania_cart");
    const currentCart = currentCartRaw ? JSON.parse(currentCartRaw) : [];
    const itemDetails = getCartDetails();

    const existingIndex = currentCart.findIndex((item: any) => item.sku === itemDetails.sku);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push(itemDetails);
    }

    localStorage.setItem("hey_womania_cart", JSON.stringify(currentCart));
    
    // Custom trigger event so main navbar or other components can update if needed
    window.dispatchEvent(new Event("cart_updated"));
    
    window.location.href = "/cart"; // Redirect to cart
  };

  const handleBuyNow = () => {
    if (typeof window === "undefined") return;

    const itemDetails = getCartDetails();
    // For Buy Now, we clear the cart and just put this single item, or add it and checkout directly
    localStorage.setItem("hey_womania_cart", JSON.stringify([itemDetails]));
    
    window.dispatchEvent(new Event("cart_updated"));
    window.location.href = "/checkout"; // Redirect to checkout
  };

  return (
    <div>
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
                  ? "border-[#111111] scale-110 ring-2 ring-[#ece6df]"
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
                  : "border border-[#ddd5cc] text-[#6d655d] bg-white hover:bg-[#f4efe8]"
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd5cc] text-[#111111] bg-white transition hover:bg-[#f4efe8] active:scale-90"
        >
          <FaMinus className="text-xs" />
        </button>
        <span className="min-w-8 text-center text-sm font-semibold select-none">{quantity}</span>
        <button
          type="button"
          onClick={handleIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd5cc] text-[#111111] bg-white transition hover:bg-[#f4efe8] active:scale-90"
        >
          <FaPlus className="text-xs" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#111111] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          <FaShoppingBag className="text-sm" />
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="rounded-full border border-[#ddd5cc] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#111111] bg-white transition hover:bg-[#f4efe8] active:scale-[0.98]"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
