"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { FaTimes, FaFire, FaGift, FaCopy, FaCheck } from "react-icons/fa";

export function DiwaliPatakaPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger fireworks burst sound-effect look using confetti
  const triggerPatakaBurst = () => {
    // Left rocket burst
    confetti({
      particleCount: 45,
      angle: 60,
      spread: 70,
      origin: { x: 0.15, y: 0.65 },
      colors: ["#ff0055", "#ffa500", "#ffd700", "#ff4500", "#ffffff"],
      zIndex: 999999,
      shapes: ["circle", "star"],
      scalar: 1.2
    });

    // Right rocket burst
    confetti({
      particleCount: 45,
      angle: 120,
      spread: 70,
      origin: { x: 0.85, y: 0.65 },
      colors: ["#ffd700", "#ff1493", "#00ffff", "#ff4500", "#ffe066"],
      zIndex: 999999,
      shapes: ["circle", "star"],
      scalar: 1.2
    });

    // Center fountain / anar sparkler
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { x: 0.5, y: 0.45 },
        colors: ["#ffb703", "#fb8500", "#d62828", "#ffd166", "#ffffff"],
        zIndex: 999999,
        scalar: 1.3
      });
    }, 250);
  };

  useEffect(() => {
    // Show after slight delay for high impact
    const timer = setTimeout(() => {
      setIsOpen(true);
      triggerPatakaBurst();

      // Continuous pataka bursts every 2.5s while popup is open
      animationIntervalRef.current = setInterval(() => {
        triggerPatakaBurst();
      }, 2500);
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("DIWALI10");
      setCopied(true);
      triggerPatakaBurst();
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
    >
      {/* Sparkles background effect overlay */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-b from-[#2d0509] via-[#4d0c15] to-[#1c0205] p-6 text-center text-white shadow-[0_25px_60px_rgba(230,57,70,0.45)] sm:p-8">
        {/* Decorative corner glows */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-amber-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-red-600/25 blur-2xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Close Diwali special popup"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Festive Diya and Firecracker Header */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="text-3xl animate-bounce" style={{ animationDuration: "1.2s" }}>
            🪔
          </span>
          <span className="text-3xl animate-pulse">
            🎆
          </span>
          <span className="text-3xl animate-bounce" style={{ animationDuration: "1.4s" }}>
            ✨
          </span>
        </div>

        <span className="inline-block rounded-full border border-amber-400/50 bg-amber-500/15 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.25em] text-amber-300">
          Shubh Deepawali Exclusive
        </span>

        <h3 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#ffebcc] sm:text-3xl">
          Diwali Mahotsav Live!
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-amber-100/90 sm:text-sm">
          Light up your wardrobe with handwoven couture. Enjoy an exclusive festive treat on all designer collections.
        </p>

        {/* Coupon Card Container */}
        <div className="mt-5 rounded-2xl border border-dashed border-amber-400/60 bg-black/40 p-3.5 backdrop-blur-xs">
          <div className="text-[0.68rem] font-bold uppercase tracking-widest text-amber-300/90">
            Use Festive Promo Code
          </div>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="font-mono text-xl font-black tracking-wider text-amber-400">
              DIWALI10
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[0.7rem] font-bold text-black transition-all hover:bg-amber-400 active:scale-95"
            >
              {copied ? (
                <>
                  <FaCheck className="text-xs text-green-900" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FaCopy className="text-xs" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-1 text-[0.68rem] text-amber-200/80">
            Flat 10% OFF + Complimentary Festive Packaging
          </div>
        </div>

        {/* Action Button & Burst Trigger */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/category/all"
            onClick={handleClose}
            className="flex-1 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02] active:scale-95"
          >
            Explore Festive Edit →
          </Link>

          <button
            type="button"
            onClick={triggerPatakaBurst}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-amber-200 transition-colors hover:bg-white/20 active:scale-95"
            title="Burst more firecrackers"
          >
            <span>Burst Pataka</span> 💥
          </button>
        </div>

        <p className="mt-3 text-[0.65rem] text-amber-200/60">
          Limited period Diwali celebration offer • Valid on orders across all categories
        </p>
      </div>
    </div>
  );
}
