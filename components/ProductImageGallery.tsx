"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import { useState, useEffect, useRef } from "react";

type ProductImageGalleryProps = {
  name: string;
  images: string[];
};

export function ProductImageGallery({
  name,
  images
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const activeImage = images[activeIndex] || images[0] || "/products/product-placeholder.png";

  // Touch Swipe Handlers for Mobile (Exactly 1 Image per Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Minimum swipe threshold (40px)
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped Left -> Next Image
        setActiveIndex((prev) => Math.min(prev + 1, images.length - 1));
      } else {
        // Swiped Right -> Previous Image
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    }
    touchStartX.current = null;
  };

  return (
    <section className="w-full max-w-full min-w-0">
      {/* ----------------- MOBILE VIEW (Single Image per Swipe + Full Frame + Dots) ----------------- */}
      <div className="flex flex-col gap-3 w-full md:hidden">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-[3/4] h-[65vh] max-h-[580px] overflow-hidden rounded-[1.8rem] border border-[#ece6df] bg-[#f4efe8] shadow-[0_14px_36px_rgba(95,93,62,0.06)] flex items-center justify-center"
        >
          <ImageWithFallback
            key={`mobile-active-${activeIndex}`}
            src={activeImage}
            fallbackSrcs={images.slice(activeIndex + 1)}
            fallbackSrc="/products/product-placeholder.png"
            alt={`${name} view ${activeIndex + 1}`}
            fill
            loading="eager"
            priority
            className="w-full h-full object-cover object-center transition-all duration-300"
          />
        </div>

        {/* Mobile Dot Indicators */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1 pb-1">
            {images.map((_, index) => (
              <button
                key={`mobile-dot-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "w-7 bg-[#9c4049]"
                    : "w-2.5 bg-[#ddd5cc] hover:bg-[#b0a79d]"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ----------------- DESKTOP VIEW (Classic Side Thumbnails + Main Image) ----------------- */}
      <div className="hidden md:flex md:flex-col md:gap-4 lg:grid lg:grid-cols-[108px_minmax(0,1fr)] lg:items-start">
        {/* Large Main Image: Right on desktop */}
        <div className="order-1 flex w-full max-w-full min-w-0 items-center justify-center overflow-hidden rounded-[1.8rem] border border-[#ece6df] bg-white p-4 lg:order-2">
          <div className="relative flex w-full min-w-0 items-center justify-center overflow-hidden rounded-[1.4rem] bg-[#f4efe8] py-3">
            <ImageWithFallback
              src={activeImage}
              fallbackSrcs={images.slice(activeIndex + 1)}
              fallbackSrc="/products/product-placeholder.png"
              alt={name}
              width={760}
              height={900}
              loading="eager"
              priority
              className="h-auto max-h-[75vh] lg:max-h-[720px] w-full object-contain mx-auto transition-all duration-300"
            />
          </div>
        </div>

        {/* Left Thumbnails Sidebar on desktop */}
        {images.length > 1 && (
          <div className="order-2 flex flex-row gap-2.5 overflow-x-auto w-full max-w-full min-w-0 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x lg:order-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:max-h-[720px] lg:pb-0 lg:pt-0">
            {images.map((image, index) => {
              const thumbSrc = image || "/products/product-placeholder.png";
              return (
                <button
                  key={`desktop-thumb-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group relative shrink-0 snap-start overflow-hidden rounded-[1rem] border bg-[#f4efe8] transition-all duration-300 hover:scale-[1.02] h-[88px] w-[88px] lg:h-[132px] lg:w-full ${
                    activeIndex === index
                      ? "border-[#111111] ring-2 ring-[#111111]/10 shadow-[0_8px_18px_rgba(17,17,17,0.08)]"
                      : "border-[#ece6df]"
                  }`}
                  aria-label={`View ${name} image ${index + 1}`}
                >
                  <ImageWithFallback
                    src={thumbSrc}
                    fallbackSrcs={images.slice(index + 1)}
                    fallbackSrc="/products/product-placeholder.png"
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
      </div>
    </section>
  );
}
