"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { FaTimes } from "react-icons/fa";

export function DiwaliPatakaPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show gently once on page load
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Gentle, subtle sparkle bursts (not covering the screen)
      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.6 },
        colors: ["#d4af37", "#ffb703", "#e63946"],
        zIndex: 999999,
        scalar: 0.9,
        disableForReducedMotion: true
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] transition-all"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#e8dfd6] bg-[#fcf9f4] p-6 text-center text-[#2b2520] shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        {/* Subtle Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full text-[#7a7269] transition-colors hover:bg-black/5 hover:text-black cursor-pointer"
          aria-label="Close"
        >
          <FaTimes className="text-xs" />
        </button>

        {/* Minimal Festive Header */}
        <div className="mb-2 flex items-center justify-center gap-1.5 text-xl">
          <span>🪔</span>
          <span className="text-sm">✨</span>
        </div>

        <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#8c6b38]">
          Diwali Special
        </span>

        <h3 className="mt-1 font-serif text-xl font-bold text-[#1f1b18]">
          Diwali Sale is Live
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-[#5e564f]">
          Celebrate with luxury handwoven styles. Get a complimentary handcrafted surprise gift with your order.
        </p>

        {/* Minimalist Gift Highlight */}
        <div className="mt-4 rounded-xl border border-[#e6dcce] bg-[#f7f2e8] px-3.5 py-2.5">
          <div className="text-[0.65rem] font-bold uppercase tracking-wider text-[#8c6b38]">
            🎁 Complimentary Festive Gift
          </div>
          <div className="mt-0.5 text-[0.72rem] text-[#4a4239]">
            Auto-applied on all orders • Limited period
          </div>
        </div>

        {/* Clean Minimal Action Button */}
        <div className="mt-5">
          <Link
            href="/category/all"
            onClick={handleClose}
            className="block w-full rounded-xl bg-[#2a2622] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#fcf9f4] transition-all hover:bg-black active:scale-[0.98]"
          >
            Shop Collection →
          </Link>
        </div>
      </div>
    </div>
  );
}
