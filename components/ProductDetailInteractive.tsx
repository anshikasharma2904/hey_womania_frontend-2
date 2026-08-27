"use client";

import React, { useState } from "react";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductOptionsClient } from "./ProductOptionsClient";
import { formatCoOrd } from "@/lib/format-utils";

interface Variant {
  sku?: string;
  size?: string;
  color?: string;
  availableStock?: number;
  images?: string[];
}

interface ProductDetailInteractiveProps {
  product: {
    id?: string;
    name: string;
    price: string;
    categoryTitle?: string;
    subtitle?: string;
    gallery: string[];
    originalPrice?: string;
    discountPercent?: string;
    variants?: Variant[];
  };
}

export function ProductDetailInteractive({ product }: ProductDetailInteractiveProps) {
  const getInitialGallery = () => {
    const variants = product.variants || [];
    const firstVariantWithImages = variants.find((v) => v.images && v.images.length > 0);
    if (firstVariantWithImages && firstVariantWithImages.images!.length > 0) {
      return firstVariantWithImages.images!;
    }
    return product.gallery && product.gallery.length > 0
      ? product.gallery
      : ["/products/product-placeholder.png"];
  };

  const [currentGallery, setCurrentGallery] = useState<string[]>(getInitialGallery);

  const handleColorSelect = (selectedColorName: string) => {
    const variants = product.variants || [];
    // Find first variant of this color that has images
    const colorVariantWithImages = variants.find(
      (v) =>
        v.color?.toLowerCase().trim() === selectedColorName.toLowerCase().trim() &&
        v.images &&
        v.images.length > 0
    );

    const colorImages = colorVariantWithImages?.images || [];

    if (colorImages.length > 0) {
      setCurrentGallery(colorImages);
    } else if (product.gallery && product.gallery.length > 0) {
      setCurrentGallery(product.gallery);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] w-full max-w-full min-w-0">
      {/* Product Image Gallery (updates when color changes) */}
      <ProductImageGallery name={product.name} images={currentGallery} />

      {/* Product Right Options Section */}
      <section className="rounded-[1.8rem] border border-[#ece6df] bg-white p-5 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-8">
        <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[#8f8279]">
          {formatCoOrd(product.categoryTitle)}
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase leading-[0.96] tracking-[-0.05em] text-[#111111] md:text-5xl">
          {formatCoOrd(product.name)}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-1 text-[#ffb000]">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <span key={starIndex} className="text-sm">
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-[#6d655d]">4.8 Rating</span>
          <span className="text-sm text-[#6d655d]">146 Reviews</span>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          {product.originalPrice ? (
            <>
              <span className="text-2xl text-[#a7a09a] line-through font-medium">
                {product.originalPrice}
              </span>
              <span className="text-3xl font-bold text-[#111111] md:text-4xl">
                {product.price}
              </span>
              <span className="text-sm font-bold uppercase tracking-[0.1em] text-[#ef6f63]">
                {product.discountPercent}
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold text-[#111111] md:text-4xl">
              {product.price}
            </span>
          )}
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6d655d] md:text-base">
          {product.subtitle || product.name} with clean finishing, premium fabric direction,
          and a women’s fashion fit built for elevated everyday wear and
          occasion styling.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {["Dress", "Slim", "Layer", "Curve"].map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                tag === "Layer"
                  ? "bg-[#111111] text-white"
                  : "bg-[#f4efe8] text-[#6d655d]"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Options Client Component */}
        <ProductOptionsClient
          product={product as any}
          onColorChange={handleColorSelect}
        />
      </section>
    </div>
  );
}
