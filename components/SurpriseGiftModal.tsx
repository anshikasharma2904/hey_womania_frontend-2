"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTimes, FaGift, FaCheckCircle, FaShoppingBag } from "react-icons/fa";
import { SURPRISE_GIFT_ITEM } from "@/lib/surpriseGift";

interface SurpriseGiftModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  addedProductName?: string;
}

export function SurpriseGiftModal({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  addedProductName: initialProductName
}: SurpriseGiftModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState(initialProductName || "");

  // Support both controlled props and global window events
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  useEffect(() => {
    if (initialProductName) {
      setProductName(initialProductName);
    }
  }, [initialProductName]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e.detail?.productName) {
        setProductName(e.detail.productName);
      }
      setIsOpen(true);
    };

    window.addEventListener("surprise_gift_modal_open", handleOpen);
    return () => {
      window.removeEventListener("surprise_gift_modal_open", handleOpen);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (controlledOnClose) {
      controlledOnClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#f0dfce] bg-white p-6 sm:p-8 text-center shadow-[0_25px_60px_-15px_rgba(156,64,73,0.3)] z-10 transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95">
        
        {/* Decorative Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#9c4049] via-[#d4af37] to-[#9c4049]" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#fcf9f4] text-[#8b837b] hover:bg-[#f4efe8] hover:text-[#111] transition-colors"
          aria-label="Close"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Reward Pill Badge */}
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#fff3e0] via-[#fdf1e8] to-[#fff3e0] px-4 py-1.5 border border-[#fed7aa] text-[0.72rem] font-black uppercase tracking-[0.2em] text-[#b45309] shadow-sm">
          <span>✨</span>
          <span>Surprise Gift Unlocked!</span>
          <span>✨</span>
        </div>

        {/* 3D Gift Box Visual with Animated Halo */}
        <div className="relative mx-auto my-5 flex items-center justify-center">
          {/* Pulsing Backlight */}
          <div className="absolute h-36 w-36 rounded-full bg-gradient-to-tr from-[#fbcfe8]/50 via-[#fde047]/40 to-[#fda4af]/40 blur-2xl animate-pulse" />

          {/* Gift Image Container */}
          <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-2xl overflow-hidden border-2 border-[#f5d0b5] shadow-[0_12px_28px_rgba(156,64,73,0.18)] bg-white transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/surprise-gift-box.jpg"
              alt="Complimentary Surprise Gift Box"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Ribbon Floating Badge */}
          <span className="absolute -bottom-2.5 rounded-full bg-[#9c4049] px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-md border border-white">
            100% Free
          </span>
        </div>

        {/* Headline & Explanation */}
        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111] leading-tight">
          Woohoo! Free Gift Added!
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-[#6d655d] max-w-sm mx-auto leading-relaxed">
          {productName ? (
            <>
              You added <span className="font-bold text-[#111]">&quot;{productName}&quot;</span> to your bag. 
              We&apos;ve automatically included a complimentary <span className="font-bold text-[#9c4049]">Surprise Gift</span> with your order!
            </>
          ) : (
            <>
              We&apos;ve automatically added an exclusive <span className="font-bold text-[#9c4049]">Surprise Gift</span> to your shopping bag to celebrate your purchase!
            </>
          )}
        </p>

        {/* Gift Card Preview */}
        <div className="mt-5 rounded-2xl border border-[#ece6df] bg-[#fcf9f4] p-3.5 text-left flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white border border-[#e5ded6] overflow-hidden relative shrink-0">
              <Image
                src="/surprise-gift-box.jpg"
                alt="Gift Thumbnail"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#111]">
                {SURPRISE_GIFT_ITEM.title}
              </p>
              <p className="text-[11px] text-[#8b837b] flex items-center gap-1.5 mt-0.5">
                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                  FREE
                </span>
                <span>• Qty: 1</span>
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-300">
            Unlocked ✓
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/cart"
            onClick={handleClose}
            className="w-full flex-1 rounded-full bg-[#111111] hover:bg-[#9c4049] text-white py-3.5 px-6 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
          >
            <FaShoppingBag className="text-xs" />
            <span>View Bag & Gift</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <button
            onClick={handleClose}
            type="button"
            className="w-full sm:w-auto rounded-full bg-[#f4efe8] hover:bg-[#ece6df] text-[#6d655d] hover:text-[#111] py-3.5 px-5 text-xs font-bold uppercase tracking-[0.14em] transition-colors"
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}
