"use client";

import React from "react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { slugifyProductName } from "@/app/category/category-data";

interface RelatedProductCardProps {
  item: {
    name: string;
    slug: string;
    price: string;
    originalPrice?: string | null;
    image: string;
    gallery?: string[];
  };
}

export function RelatedProductCard({ item }: RelatedProductCardProps) {
  const productHref = `/product/${item.slug || slugifyProductName(item.name)}`;

  return (
    <Link
      href={productHref}
      prefetch={true}
      className="group rounded-[1.35rem] border border-[#f0e7de] bg-[#fffdfa] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-[#e1d1c6] hover:shadow-[0_18px_34px_rgba(95,93,62,0.08)] block"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.1rem] bg-[#f4efe8] flex items-center justify-center">
        <ImageWithFallback
          src={item.image}
          fallbackSrcs={item.gallery?.slice(1) || []}
          fallbackSrc="/products/product-placeholder.png"
          alt={item.name}
          width={260}
          height={340}
          loading="lazy"
          className="h-full w-full object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3">
        <p className="line-clamp-2 min-h-[2.8rem] text-xs sm:text-[0.92rem] font-semibold leading-[1.35rem] text-[#111111]">
          {item.name}
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-[1rem] font-bold text-[#111111]">
            {item.price}
          </span>
          {item.originalPrice && (
            <span className="text-[0.7rem] sm:text-[0.75rem] text-[#a7a09a] line-through">
              {item.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
