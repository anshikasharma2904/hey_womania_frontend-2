"use client";

import React, { useState } from "react";
import { FaTimes, FaGift, FaTag, FaCheckCircle } from "react-icons/fa";

interface WelcomePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplied: boolean;
}

export function WelcomePromoModal({
  isOpen,
  onClose,
  onApply,
  isApplied,
}: WelcomePromoModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText("WELCOME100");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#fcf9f4] border border-[#ece6df] p-6 sm:p-7 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f3ece3] text-[#6d655d] hover:bg-[#e7ddd2] hover:text-[#111] transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Decorative badge header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9c4049] to-[#c85a67] text-white shadow-lg shadow-[#9c4049]/20">
            <FaGift className="text-2xl animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-[10px] text-white font-black ring-2 ring-white">
              ₹
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9c4049]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#9c4049]">
            <span>✨</span> Exclusive First Order Welcome Gift
          </span>

          <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#111111] sm:text-3xl">
            Get ₹100 OFF!
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-[#6d655d] leading-relaxed max-w-xs">
            Welcome to <span className="font-bold text-[#111]">Hey Womaniyaa</span>! Enjoy flat <span className="font-bold text-emerald-700">₹100 OFF</span> on your very first order with us.
          </p>

          {/* Coupon Code Pill */}
          <div className="mt-5 w-full rounded-2xl border-2 border-dashed border-[#9c4049]/40 bg-white p-3.5 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fdf2f4] text-[#9c4049]">
                <FaTag className="text-sm" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9b948d]">Promo Code</p>
                <p className="text-base font-black tracking-widest text-[#9c4049] font-mono">
                  WELCOME100
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-bold text-[#6d655d] hover:text-[#111] underline px-2 py-1"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Action Button */}
          <div className="mt-5 w-full flex flex-col gap-2.5">
            {isApplied ? (
              <div className="flex items-center justify-center gap-2 rounded-full bg-emerald-100 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <FaCheckCircle className="text-base text-emerald-600" />
                <span>Promo Code Applied (₹100 Saved)</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onApply}
                className="w-full rounded-full bg-[#9c4049] hover:bg-[#83323a] py-3.5 px-5 text-center text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-[#9c4049]/25 transition-all transform active:scale-[0.98]"
              >
                Apply ₹100 Discount Now
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#8b837b] hover:text-[#111] py-1 transition-colors"
            >
              {isApplied ? "Continue to Cart" : "No thanks, I will pay full price"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
