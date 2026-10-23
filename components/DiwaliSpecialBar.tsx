"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaFire, FaTimes, FaGift, FaArrowRight, FaTag } from "react-icons/fa";

export function DiwaliSpecialBar() {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const copyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (dismissed) return null;

  return (
    <aside
      aria-label="Diwali Special Offers"
      className="relative z-40 overflow-hidden bg-gradient-to-r from-[#501118] via-[#7a1c25] to-[#450e14] text-amber-100 shadow-md"
    >
      {/* Decorative background sparks */}
      <div className="pointer-events-none absolute -left-10 top-0 h-full w-32 bg-[radial-gradient(circle,rgba(255,200,100,0.2),transparent_70%)]" />
      <div className="pointer-events-none absolute right-10 top-0 h-full w-40 bg-[radial-gradient(circle,rgba(255,180,60,0.18),transparent_70%)]" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 text-xs md:px-8">
        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3 text-center">
          <span className="text-base select-none animate-pulse">🪔</span>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="font-extrabold uppercase tracking-widest text-[#fbd38d] text-[11px] sm:text-xs">
              Diwali Mahotsav Live:
            </span>
            <span className="text-white/90 hidden sm:inline">
              Extra 10% OFF with code
            </span>
            <button
              type="button"
              onClick={() => copyCode("DIWALI10")}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 font-mono text-[11px] font-black text-amber-200 transition-all hover:bg-amber-400/30 active:scale-95 cursor-pointer"
              title="Click to copy promo code"
            >
              <span>DIWALI10</span>
              <span className="text-[10px] font-sans font-semibold text-white/80">
                {copied ? "✓ Copied" : "Copy"}
              </span>
            </button>
            <span className="hidden md:inline text-white/70">
              • Free Gift on Every Order
            </span>
          </div>

          <Link
            href="/category/all"
            className="hidden sm:inline-flex items-center gap-1 font-bold text-amber-300 underline underline-offset-2 hover:text-white transition-colors"
          >
            <span>Shop Now</span>
            <span className="text-[10px]">→</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="ml-2 text-white/60 hover:text-white p-1 transition-colors"
          aria-label="Dismiss Diwali announcement"
        >
          <FaTimes className="text-[11px]" />
        </button>
      </div>
    </aside>
  );
}
