"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type ProductImageGalleryProps = {
  name: string;
  images: string[];
};

export function ProductImageGallery({
  name,
  images
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const activeImage = images[activeIndex] || images[0] || "/products/product-placeholder.png";

  return (
    <section className="grid gap-4 lg:grid-cols-[108px_minmax(0,1fr)] lg:items-start">
      <div className="grid grid-cols-4 gap-3 lg:grid-cols-1 lg:max-h-[720px] lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((image, index) => {
          const thumbSrc = image || "/products/product-placeholder.png";
          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group overflow-hidden rounded-[1.2rem] border bg-[#f4efe8] transition-all duration-300 hover:scale-[1.02] lg:h-[132px] ${
                activeIndex === index
                  ? "border-[#111111] shadow-[0_10px_22px_rgba(17,17,17,0.08)]"
                  : "border-[#ece6df]"
              }`}
              aria-label={`View ${name} image ${index + 1}`}
            >
              <Image
                src={thumbSrc}
                alt={`${name} thumbnail ${index + 1}`}
                width={120}
                height={120}
                className="h-[84px] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.04] lg:h-full"
              />
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[1.8rem] border border-[#ece6df] bg-white p-3 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-4">
        <div className="relative overflow-hidden rounded-[1.4rem] bg-[#f4efe8]">
          <Image
            src={activeImage}
            alt={name}
            width={760}
            height={900}
            loading="eager"
            priority
            className="h-[360px] w-full object-cover object-top transition-transform duration-500 md:h-[560px] lg:h-[720px]"
          />
        </div>
      </div>
    </section>
  );
}
