"use client";

import React, { useState } from "react";
import { detectFabricDetail } from "@/lib/product-fabric";

interface ProductFabricDetailsProps {
  title: string;
  description?: string;
  category?: string;
}

export function ProductFabricDetails({
  title,
  description = "",
  category = ""
}: ProductFabricDetailsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const specs = detectFabricDetail(title, description, category);

  return (
    <div className="mt-6 rounded-2xl border border-[#ece6df] bg-[#fcfaf7] overflow-hidden transition-all duration-300">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-[#f8f4ee] cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9c4049]/10 text-[#9c4049]">
            {specs.isJewelleryOrBag ? (
              <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#111111]">
              {specs.materialTypeLabel}
            </h4>
            <p className="text-[0.7rem] text-[#8a7f74]">
              {specs.fabric}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a7f74]">
          <span className="text-[0.68rem] uppercase tracking-wider">{isOpen ? "Hide" : "View"}</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Details Grid */}
      {isOpen && (
        <div className="border-t border-[#ece6df] p-4 bg-white/60">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
            {/* Primary Material / Fabric */}
            <div className="rounded-xl border border-[#f0e8de] bg-[#fdfbf9] p-3">
              <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#9c4049]">
                {specs.isJewelleryOrBag ? "Base Material" : "Fabric"}
              </span>
              <p className="mt-1 font-semibold text-[#111111] leading-snug">
                {specs.fabric}
              </p>
            </div>

            {/* Weave / Texture / Finish */}
            <div className="rounded-xl border border-[#f0e8de] bg-[#fdfbf9] p-3">
              <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#9c4049]">
                {specs.isJewelleryOrBag ? "Finish & Craft" : "Weave & Feel"}
              </span>
              <p className="mt-1 font-semibold text-[#111111] leading-snug">
                {specs.weaveOrTexture}
              </p>
            </div>

            {/* Pattern / Detailing */}
            <div className="rounded-xl border border-[#f0e8de] bg-[#fdfbf9] p-3">
              <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#9c4049]">
                Work & Pattern
              </span>
              <p className="mt-1 font-semibold text-[#111111] leading-snug">
                {specs.pattern}
              </p>
            </div>

            {/* Recommended Care */}
            <div className="rounded-xl border border-[#f0e8de] bg-[#fdfbf9] p-3">
              <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#9c4049]">
                Care Instructions
              </span>
              <p className="mt-1 font-semibold text-[#111111] leading-snug">
                {specs.care}
              </p>
            </div>
          </div>

          {/* Authenticity Pill */}
          <div className="mt-3.5 flex items-center gap-2 rounded-lg bg-[#f6efe6] px-3 py-2 text-[0.68rem] text-[#736555]">
            <span className="text-[#9c4049] text-xs">✦</span>
            <span>Hand-finished craftsmanship verified for longevity and daily comfort.</span>
          </div>
        </div>
      )}
    </div>
  );
}
