"use client";

import ImageWithFallback from "@/components/ImageWithFallback";
import { useState, useEffect, useRef } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

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

  const displayImages = images && images.length > 0
    ? images
    : ["/products/product-placeholder.png"];

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Minimum swipe threshold (35px)
    if (Math.abs(diffX) > 35) {
      if (diffX > 0) {
        // Swiped Left -> Next Image
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(0, displayImages.length - 1)));
      } else {
        // Swiped Right -> Previous Image
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    }
    touchStartX.current = null;
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="w-full max-w-full min-w-0">
      <div className={`flex w-full min-w-0 flex-col gap-3 md:gap-4 ${displayImages.length > 1 ? "lg:grid lg:grid-cols-[108px_minmax(0,1fr)] lg:items-start" : ""}`}>
        
        {/* Main Image Container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="group relative order-1 w-full min-w-0 aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-[1.8rem] border border-[#ece6df] bg-[#f4efe8] shadow-[0_14px_36px_rgba(95,93,62,0.06)] lg:order-2 select-none"
        >
          {/* Render active and adjacent images for smooth swiping without network flooding */}
          {displayImages.map((imageSrc, index) => {
            const isActive = activeIndex === index;
            // Only render active image and immediate next/prev image into DOM to save bandwidth & memory
            const isNear = Math.abs(activeIndex - index) <= 1 || (index === 0 && activeIndex === displayImages.length - 1);
            if (!isNear) return null;

            return (
              <div
                key={`gallery-main-${imageSrc}-${index}`}
                className={`absolute inset-0 transition-opacity duration-200 ease-out ${
                  isActive
                    ? "opacity-100 z-10 pointer-events-auto"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
                aria-hidden={!isActive}
              >
                <ImageWithFallback
                  src={imageSrc}
                  fallbackSrcs={displayImages.filter((_, i) => i !== index)}
                  fallbackSrc="/products/product-placeholder.png"
                  alt={`${name} view ${index + 1}`}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 80px), 560px"
                  loading={index === 0 || isActive ? "eager" : "lazy"}
                  priority={index === 0}
                  className="object-contain object-center"
                />
              </div>
            );
          })}

          {/* Quick Arrow Controls */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all hover:bg-white active:scale-90"
              >
                <HiChevronLeft className="text-xl" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#111111] shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all hover:bg-white active:scale-90"
              >
                <HiChevronRight className="text-xl" />
              </button>
            </>
          )}

          {/* Counter pill for mobile */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/60 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wider text-white backdrop-blur-xs md:hidden">
              {activeIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>

        {/* Mobile Dots Indicator */}
        {displayImages.length > 1 && (
          <div className="order-2 flex items-center justify-center gap-1.5 py-1 md:hidden">
            {displayImages.map((_, index) => (
              <button
                key={`mobile-dot-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={`h-2 rounded-full transition-all duration-200 ${
                  activeIndex === index
                    ? "w-6 bg-[#9c4049]"
                    : "w-2 bg-[#ddd5cc] hover:bg-[#b0a79d]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Left Thumbnails Sidebar on desktop */}
        {displayImages.length > 1 && (
          <div className="order-2 hidden md:flex flex-row gap-2.5 overflow-x-auto w-full max-w-full min-w-0 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x lg:order-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:max-h-[720px] lg:pb-0 lg:pt-0">
            {displayImages.map((image, index) => {
              const thumbSrc = image || "/products/product-placeholder.png";
              return (
                <button
                  key={`desktop-thumb-${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`group relative shrink-0 snap-start overflow-hidden rounded-[1rem] border bg-[#f4efe8] transition-all duration-200 hover:scale-[1.02] h-[88px] w-[88px] lg:h-[132px] lg:w-full ${
                    activeIndex === index
                      ? "border-[#111111] ring-2 ring-[#111111]/10 shadow-[0_8px_18px_rgba(17,17,17,0.08)]"
                      : "border-[#ece6df]"
                  }`}
                  aria-label={`View ${name} image ${index + 1}`}
                >
                  <ImageWithFallback
                    key={`thumb-img-${thumbSrc}`}
                    src={thumbSrc}
                    fallbackSrcs={displayImages.slice(index + 1)}
                    fallbackSrc="/products/product-placeholder.png"
                    alt={`${name} thumbnail ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 108px, 88px"
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.04]"
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
