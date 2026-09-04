"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we've shown it already in this session to avoid annoyance
    const hasSeenPromo = sessionStorage.getItem("hasSeenPromo");
    if (!hasSeenPromo) {
      // Small delay to let the page load before showing the popup
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("hasSeenPromo", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative max-w-[700px] w-full animate-in fade-in zoom-in duration-300 shadow-2xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -top-12 right-0 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 hover:bg-black/80 rounded-full p-2"
          aria-label="Close"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="bg-white rounded-xl overflow-hidden relative aspect-[4/3]">
          <Image
            src="/popup.png"
            alt="Launch Month Special"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
