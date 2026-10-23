"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";

export function DiwaliPatakaPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show after 1.5s delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[3px] animate-fadeIn"
    >
      {/* Exact Banner Style Card */}
      <div className="relative w-full max-w-[620px] overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-[#6b0310] via-[#8f0e1c] to-[#59020b] p-6 sm:p-7 text-white shadow-[0_20px_60px_rgba(139,0,0,0.6)]">
        {/* Animated Hanging Fairy Light Garland across top */}
        <div className="pointer-events-none absolute top-0 inset-x-0 flex justify-between px-3 pt-1 select-none opacity-90">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="h-2 w-0.5 bg-amber-200/50" />
              <span
                className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_#ffd700] animate-pulse"
                style={{ animationDelay: `${(i % 4) * 0.35}s`, animationDuration: "1.2s" }}
              />
            </div>
          ))}
        </div>

        {/* Animated Firecracker Bursts on Left & Right */}
        <div className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 opacity-75">
          <svg className="w-24 h-24 animate-spin" style={{ animationDuration: "16s" }} viewBox="0 0 100 100">
            <g stroke="#ffb703" strokeWidth="2" strokeLinecap="round">
              <line x1="50" y1="10" x2="50" y2="25" />
              <line x1="50" y1="90" x2="50" y2="75" />
              <line x1="10" y1="50" x2="25" y2="50" />
              <line x1="90" y1="50" x2="75" y2="50" />
              <line x1="22" y1="22" x2="33" y2="33" />
              <line x1="78" y1="78" x2="67" y2="67" />
              <line x1="22" y1="78" x2="33" y2="67" />
              <line x1="78" y1="22" x2="67" y2="33" />
            </g>
            <circle cx="50" cy="50" r="4" fill="#ffd166" className="animate-ping" />
          </svg>
        </div>

        <div className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 opacity-75">
          <svg className="w-24 h-24 animate-spin" style={{ animationDuration: "14s", animationDirection: "reverse" }} viewBox="0 0 100 100">
            <g stroke="#ffd700" strokeWidth="2" strokeLinecap="round">
              <line x1="50" y1="10" x2="50" y2="25" />
              <line x1="50" y1="90" x2="50" y2="75" />
              <line x1="10" y1="50" x2="25" y2="50" />
              <line x1="90" y1="50" x2="75" y2="50" />
              <line x1="22" y1="22" x2="33" y2="33" />
              <line x1="78" y1="78" x2="67" y2="67" />
              <line x1="22" y1="78" x2="33" y2="67" />
              <line x1="78" y1="22" x2="67" y2="33" />
            </g>
            <circle cx="50" cy="50" r="4" fill="#ff9f1c" className="animate-ping" />
          </svg>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white/90 hover:bg-black/60 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <FaTimes className="text-xs" />
        </button>

        {/* Content Container (matching the user's reference banner layout) */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 pt-3">
          {/* Left: MAHA DIWALI SALE Badge with Diya */}
          <div className="flex flex-col items-center text-center">
            <div className="relative inline-flex flex-col items-center">
              {/* Circular glowing badge */}
              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-[#7e1866] to-[#400833] px-5 py-2.5 shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                <span className="text-[0.62rem] font-black uppercase tracking-[0.25em] text-[#ffdd55] drop-shadow-sm">
                  MAHA
                </span>
                <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  DIWALI SALE
                </span>
                {/* Lit Diya on badge */}
                <div className="absolute -bottom-3 -left-3 text-xl select-none filter drop-shadow-[0_0_8px_rgba(255,180,0,0.8)] animate-bounce" style={{ animationDuration: "2s" }}>
                  🪔
                </div>
              </div>
            </div>
          </div>

          {/* Right: UP TO 80% OFF & Sale is Live Capsule */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <div className="flex items-baseline gap-2">
              <span className="font-bold uppercase tracking-wider text-amber-200 text-xs sm:text-sm">
                UP TO
              </span>
              <span className="font-black tracking-tight text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-[#fff6d6] via-[#ffd97d] to-[#f4a261] drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">
                80% OFF
              </span>
            </div>

            {/* Sale is Live capsule badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-black/40 px-3.5 py-1 text-[0.7rem] font-bold tracking-wider text-amber-200 shadow-inner">
              <span className="text-amber-400">⚡</span>
              <span>Sale is Live</span>
              <span className="text-amber-400">⚡</span>
            </div>

            {/* Free surprise gift highlight */}
            <div className="mt-1.5 text-[0.68rem] text-amber-100 font-medium">
              🎁 + Free Surprise Gift with Every Order!
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 mt-5 pt-3 border-t border-amber-400/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[0.7rem] text-amber-200/90 font-medium text-center sm:text-left">
            Limited Time Festive Extravaganza • Auto Applied at Checkout
          </span>
          <Link
            href="/category/all"
            onClick={handleClose}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-[#3d0309] shadow-lg shadow-amber-400/30 transition-transform hover:scale-105 active:scale-95"
          >
            Shop Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
