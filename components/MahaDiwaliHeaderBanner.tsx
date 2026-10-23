"use client";

import React from "react";
import Link from "next/link";
import { DiwaliFairyLights } from "./DiwaliFairyLights";

export function MahaDiwaliHeaderBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#4d030c] via-[#750e1b] to-[#450209] px-3 py-2 text-white shadow-inner sm:px-6">
      {/* Hanging fairy string lights across top */}
      <DiwaliFairyLights />

      {/* Background Animated Fireworks (Left & Right) */}
      <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 opacity-35 hidden sm:block">
        <svg className="h-16 w-16 animate-spin" style={{ animationDuration: "20s" }} viewBox="0 0 100 100">
          <g stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round">
            <line x1="50" y1="10" x2="50" y2="28" />
            <line x1="50" y1="90" x2="50" y2="72" />
            <line x1="10" y1="50" x2="28" y2="50" />
            <line x1="90" y1="50" x2="72" y2="50" />
            <line x1="22" y1="22" x2="35" y2="35" />
            <line x1="78" y1="78" x2="65" y2="65" />
            <line x1="22" y1="78" x2="35" y2="65" />
            <line x1="78" y1="22" x2="65" y2="35" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#ffb703" className="animate-ping" />
        </svg>
      </div>

      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-35 hidden sm:block">
        <svg className="h-16 w-16 animate-spin" style={{ animationDuration: "18s", animationDirection: "reverse" }} viewBox="0 0 100 100">
          <g stroke="#ffb703" strokeWidth="2.5" strokeLinecap="round">
            <line x1="50" y1="10" x2="50" y2="28" />
            <line x1="50" y1="90" x2="50" y2="72" />
            <line x1="10" y1="50" x2="28" y2="50" />
            <line x1="90" y1="50" x2="72" y2="50" />
            <line x1="22" y1="22" x2="35" y2="35" />
            <line x1="78" y1="78" x2="65" y2="65" />
            <line x1="22" y1="78" x2="35" y2="65" />
            <line x1="78" y1="22" x2="65" y2="35" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#ffd700" className="animate-ping" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between flex-wrap gap-2 text-center md:flex-nowrap">
        {/* Left: MAHA DIWALI SALE Brand Tag */}
        <div className="flex items-center gap-2 mx-auto md:mx-0">
          <div className="relative inline-flex items-center rounded-xl border border-amber-300/80 bg-gradient-to-r from-[#6e1355] to-[#3b062c] px-3 py-1 shadow-[0_0_12px_rgba(255,215,0,0.35)]">
            <span className="text-sm select-none mr-1.5 animate-bounce" style={{ animationDuration: "2s" }}>
              🪔
            </span>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-[#ffdd55]">
                MAHA
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-white drop-shadow-sm">
                DIWALI SALE
              </span>
            </div>
            <span className="ml-2 text-sm select-none">🎉</span>
          </div>
        </div>

        {/* Center: UP TO 80% OFF & Sale is Live Capsule */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mx-auto">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[0.62rem] sm:text-xs font-bold uppercase tracking-wider text-amber-200">
              UP TO
            </span>
            <span className="text-base sm:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#fff6d6] via-[#ffd97d] to-[#f4a261] drop-shadow-[0_1px_6px_rgba(255,215,0,0.6)]">
              80% OFF
            </span>
          </div>

          {/* Sale is Live capsule with electric lighting */}
          <div className="inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-black/40 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider text-amber-200 shadow-inner">
            <span className="text-amber-400 animate-pulse">⚡</span>
            <span>Sale is Live</span>
          </div>
        </div>

        {/* Right: Surprise Gift & Action Link */}
        <div className="flex items-center justify-center gap-3 mx-auto md:mx-0">
          <span className="hidden lg:inline text-[0.68rem] text-amber-100/90 font-medium">
            🎁 Free Surprise Gift on Every Order
          </span>
          <Link
            href="/category/all"
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider text-[#3d0309] shadow-sm hover:scale-105 transition-transform"
          >
            <span>Shop Now</span>
            <span className="text-[10px]">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
