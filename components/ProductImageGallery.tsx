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
    <section className="flex flex-col gap-4 w-full max-w-full min-w-0 lg:grid lg:grid-cols-[108px_minmax(0,1fr)] lg:items-start">
      {/* Large Main Image: Top on mobile (order-1), Right on desktop (lg:order-2) */}
      <div className="order-1 flex w-full max-w-full min-w-0 items-center justify-center overflow-hidden rounded-[1.8rem] border border-[#ece6df] bg-white p-2 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-4 lg:order-2">
        <div className="relative flex w-full min-w-0 items-center justify-center overflow-hidden rounded-[1.4rem] bg-[#f4efe8] py-2 md:py-3">
          <Image
            src={activeImage}
            alt={name}
            width={760}
            height={900}
            loading="eager"
            priority
            className="h-auto max-h-[60vh] md:max-h-[75vh] lg:max-h-[720px] w-full object-contain mx-auto transition-all duration-300"
          />
        </div>
      </div>

      {/* Thumbnails: Below main image on mobile (order-2), Left sidebar on desktop (lg:order-1) */}
      {images.length > 1 && (
        <div className="order-2 flex flex-row gap-2.5 overflow-x-auto w-full max-w-full min-w-0 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x lg:order-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:max-h-[720px] lg:pb-0 lg:pt-0">
          {images.map((image, index) => {
            const thumbSrc = image || "/products/product-placeholder.png";
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative shrink-0 snap-start overflow-hidden rounded-[1rem] border bg-[#f4efe8] transition-all duration-300 hover:scale-[1.02] h-[72px] w-[72px] md:h-[88px] md:w-[88px] lg:h-[132px] lg:w-full ${
                  activeIndex === index
                    ? "border-[#111111] ring-2 ring-[#111111]/10 shadow-[0_8px_18px_rgba(17,17,17,0.08)]"
                    : "border-[#ece6df]"
                }`}
                aria-label={`View ${name} image ${index + 1}`}
              >
                <Image
                  src={thumbSrc}
                  alt={`${name} thumbnail ${index + 1}`}
                  width={120}
                  height={120}
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
