"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";

interface SlideImage {
  desktop: string;
  mobile: string;
  alt: string;
}

const HEADER_SLIDES: SlideImage[] = [
  {
    desktop: "/headerImages/image1desktop.webp",
    mobile: "/headerImages/image1mobile.webp",
    alt: "Hey Womaniya Exclusive Collection 1"
  },
  {
    desktop: "/headerImages/image2desktop.webp",
    mobile: "/headerImages/image2mobile.webp",
    alt: "Hey Womaniya Exclusive Collection 2"
  },
  {
    desktop: "/headerImages/image3desktop.webp",
    mobile: "/headerImages/image3mobile.webp",
    alt: "Hey Womaniya Exclusive Collection 3"
  },
  {
    desktop: "/headerImages/image4desktop.webp",
    mobile: "/headerImages/image4mobile.webp",
    alt: "Hey Womaniya Exclusive Collection 4"
  },
  {
    desktop: "/headerImages/image5desktop.webp",
    mobile: "/headerImages/image5mobile.webp",
    alt: "Hey Womaniya Exclusive Collection 5"
  }
];

export function HeroImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HEADER_SLIDES.length);
    }, 4500);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    resetTimer();
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HEADER_SLIDES.length) % HEADER_SLIDES.length);
    resetTimer();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HEADER_SLIDES.length);
    resetTimer();
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-[#fcf9f4]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 
        Responsive height:
        - Mobile: vertical banner format
        - Desktop: cinematic widescreen
      */}
      <div className="relative h-[72vh] min-h-[460px] max-h-[920px] sm:h-[78vh] md:h-[82vh] lg:h-[88vh] w-full">
        {HEADER_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.desktop}
              className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <picture>
                <source
                  media="(max-width: 767px), (max-width: 1023px) and (orientation: portrait)"
                  srcSet={slide.mobile}
                />
                <img
                  src={slide.desktop}
                  alt={slide.alt}
                  fetchPriority={index === 0 ? "high" : "low"}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover object-top lg:object-center"
                />
              </picture>
            </div>
          );
        })}

        {/* Ambient subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#1c1c19]/30 via-transparent to-[#1c1c19]/10 mix-blend-multiply" />

        {/* Prev & Next Navigation Buttons (visible on md+) */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Previous slide"
          className="group absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/70 backdrop-blur-md text-[#1c1c19] shadow-md transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Next slide"
          className="group absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white/70 backdrop-blur-md text-[#1c1c19] shadow-md transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicator dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {HEADER_SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "w-8 bg-white shadow-sm"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
