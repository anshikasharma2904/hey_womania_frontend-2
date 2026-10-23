"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { FaTimes } from "react-icons/fa";

export function DiwaliPatakaPopup() {
  const [isOpen, setIsOpen] = useState(false);

  // Gentle, classy festive sparkle burst on open
  const triggerConfetti = () => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#d4af37", "#f59e0b", "#9c4049", "#fcd34d"],
      zIndex: 999999,
      scalar: 0.95,
      disableForReducedMotion: true,
    });
  };

  useEffect(() => {
    // Show gently once on load after a brief delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      triggerConfetti();
    }, 600);

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
      aria-labelledby="diwali-sale-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] transition-all duration-300 animate-fadeIn"
    >
      {/* Click outside backdrop to close */}
      <div
        className="fixed inset-0 -z-10"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Clean Ivory Boutique Style Card */}
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-[#e8dfd6] bg-[#fcf9f4] p-6 sm:p-7 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Delicate Golden Top Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c69a58]/70 to-transparent" />

        {/* Subtle Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full text-[#7a7269] transition-colors hover:bg-black/5 hover:text-black cursor-pointer"
          aria-label="Close"
        >
          <FaTimes className="text-xs" />
        </button>

        {/* Festive Diya Header Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e8ded1] bg-[#f5efe6] px-3.5 py-1 text-[0.65rem] font-bold tracking-[0.22em] uppercase text-[#8c6b38]">
          <span className="text-xs select-none">🪔</span>
          <span>Maha Diwali Special</span>
          <span className="text-xs select-none">✨</span>
        </div>

        {/* Headline */}
        <h3
          id="diwali-sale-title"
          className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1917]"
        >
          Diwali Sale is Live
        </h3>

        {/* Up to 80% Off highlight */}
        <div className="mt-1 flex items-baseline justify-center gap-2">
          <span className="text-xs uppercase tracking-wider text-[#8c6b38] font-bold">
            UP TO
          </span>
          <span className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-[#9c4049]">
            80% OFF
          </span>
        </div>

        <p className="mt-1 text-xs text-[#6b6257] leading-relaxed">
          Celebrate with handcrafted luxury couture & designer bags.
        </p>

        {/* Complimentary Surprise Gift Box Card */}
        <div className="mt-4 rounded-2xl border border-[#e6dcce] bg-white p-3.5 shadow-sm text-left flex items-center gap-3.5">
          {/* Gift Image */}
          <div className="relative h-18 w-18 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-[#efe6dc] shrink-0 bg-[#fcf9f4]">
            <Image
              src="/surprise-gift-box.jpg"
              alt="Complimentary Surprise Gift Box"
              fill
              className="object-cover"
              sizes="80px"
              priority
            />
            <span className="absolute bottom-1 right-1 rounded bg-[#9c4049] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
              FREE
            </span>
          </div>

          {/* Gift Details */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#9c4049]">
              <span>🎁</span>
              <span>Complimentary Festive Gift</span>
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#1c1917] leading-tight truncate">
              Mystery Surprise Gift Box
            </p>
            <p className="mt-1 text-[0.7rem] text-[#7a7269] leading-snug">
              Included with every order • Worth ₹499
            </p>
            <span className="inline-block mt-1 text-[0.65rem] text-[#2e7d32] font-semibold bg-[#edf7ed] px-2 py-0.5 rounded border border-[#c8e6c9]">
              Auto-applied at checkout
            </span>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/category/all"
            onClick={handleClose}
            className="w-full rounded-xl bg-[#1c1917] hover:bg-[#342e2b] py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#fcf9f4] shadow-md transition-all active:scale-[0.99] text-center"
          >
            Shop Festive Collection →
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="text-[0.72rem] text-[#8c8275] hover:text-[#1c1917] font-medium transition-colors py-1 cursor-pointer"
          >
            Continue Browsing
          </button>
        </div>

        {/* Subtle footnote */}
        <p className="mt-1 text-[0.62rem] text-[#a3988b]">
          ✨ Limited period festive extravaganza • No promo code required
        </p>
      </div>
    </div>
  );
}
