"use client";

import React, { useState } from "react";
import { detectFabricDetail } from "@/lib/product-fabric";

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

interface ProductTabsProps {
  initialReviews: Review[];
  productName?: string;
  description?: string;
  category?: string;
}

const faqs = [
  {
    q: "How do I choose my size?",
    a: "Please refer to the standard size guide on the product page. If you are between sizes, we recommend ordering one size up for a comfortable, relaxed fit."
  },
  {
    q: "What is the return and exchange policy?",
    a: "We offer a hassle-free 7-day return and exchange policy on eligible unworn items with original tags and packaging intact."
  },
  {
    q: "How long does delivery take?",
    a: "Standard delivery typically takes 3 to 5 business days across India. Express shipping is also available during checkout."
  },
  {
    q: "How should I care for this garment?",
    a: "We recommend gentle machine wash in cold water or dry cleaning for delicate embellished pieces to maintain fabric luster and longevity."
  }
];

export function ProductReviewsAndFaqTabs({
  initialReviews,
  productName = "",
  description = "",
  category = ""
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"fabric" | "reviews" | "faq">("fabric");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [visibleCount, setVisibleCount] = useState(4);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const specs = detectFabricDetail(productName, description, category);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, reviews.length));
  };

  return (
    <div className="rounded-[1.8rem] border border-[#ece6df] bg-white p-5 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-8">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece6df] pb-4">
        <div className="flex items-center gap-5 sm:gap-8 text-xs font-bold uppercase tracking-[0.16em]">
          <button
            type="button"
            onClick={() => setActiveTab("fabric")}
            className={`pb-2 transition-colors duration-200 cursor-pointer ${
              activeTab === "fabric"
                ? "border-b-2 border-[#111111] text-[#111111]"
                : "text-[#8b837b] hover:text-[#111111]"
            }`}
          >
            {specs.isJewelleryOrBag ? "Material & Craft" : "Fabric & Details"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-2 transition-colors duration-200 cursor-pointer ${
              activeTab === "reviews"
                ? "border-b-2 border-[#111111] text-[#111111]"
                : "text-[#8b837b] hover:text-[#111111]"
            }`}
          >
            Rating & Reviews
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("faq")}
            className={`pb-2 transition-colors duration-200 cursor-pointer ${
              activeTab === "faq"
                ? "border-b-2 border-[#111111] text-[#111111]"
                : "text-[#8b837b] hover:text-[#111111]"
            }`}
          >
            FAQ
          </button>
        </div>
      </div>

      {/* Fabric & Material Tab Content */}
      {activeTab === "fabric" && (
        <div className="mt-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[#fcfaf7] border border-[#ece6df] p-4 sm:p-5">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#9c4049]">
                Authentic Specifications
              </p>
              <h3 className="mt-1 text-base sm:text-lg font-bold text-[#111111]">
                {specs.fabric}
              </h3>
              <p className="mt-1 text-xs text-[#736b63]">
                {productName}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-[#f4ece1] px-3.5 py-1.5 text-[0.72rem] font-semibold text-[#8c6b38]">
              <span>✦</span>
              <span>100% Verified Quality Checked</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Box 1: Material */}
            <div className="rounded-2xl border border-[#ece6df] bg-[#fdfbf9] p-4 transition-all hover:bg-white hover:shadow-xs">
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#9c4049]">
                {specs.isJewelleryOrBag ? "Base Material" : "Primary Fabric"}
              </span>
              <p className="mt-2 text-sm font-bold text-[#111111] leading-snug">
                {specs.fabric}
              </p>
              <p className="mt-1 text-[0.72rem] text-[#786f65]">
                Breathable, gentle on skin and tailored for all-day comfort.
              </p>
            </div>

            {/* Box 2: Weave / Texture */}
            <div className="rounded-2xl border border-[#ece6df] bg-[#fdfbf9] p-4 transition-all hover:bg-white hover:shadow-xs">
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#9c4049]">
                {specs.isJewelleryOrBag ? "Finish & Plating" : "Weave & Feel"}
              </span>
              <p className="mt-2 text-sm font-bold text-[#111111] leading-snug">
                {specs.weaveOrTexture}
              </p>
              <p className="mt-1 text-[0.72rem] text-[#786f65]">
                Smooth handfeel with high shape retention and fine fall.
              </p>
            </div>

            {/* Box 3: Work & Pattern */}
            <div className="rounded-2xl border border-[#ece6df] bg-[#fdfbf9] p-4 transition-all hover:bg-white hover:shadow-xs">
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#9c4049]">
                Work & Pattern
              </span>
              <p className="mt-2 text-sm font-bold text-[#111111] leading-snug">
                {specs.pattern}
              </p>
              <p className="mt-1 text-[0.72rem] text-[#786f65]">
                Intricately rendered artisanal finishing on hem and borders.
              </p>
            </div>

            {/* Box 4: Care */}
            <div className="rounded-2xl border border-[#ece6df] bg-[#fdfbf9] p-4 transition-all hover:bg-white hover:shadow-xs">
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#9c4049]">
                Care Instructions
              </span>
              <p className="mt-2 text-sm font-bold text-[#111111] leading-snug">
                {specs.care}
              </p>
              <p className="mt-1 text-[0.72rem] text-[#786f65]">
                Recommended method to retain color luster and shape.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab Content */}
      {activeTab === "reviews" && (
        <div className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.slice(0, visibleCount).map((review) => (
              <article
                key={review.name}
                className="rounded-[1.2rem] border border-[#ece6df] bg-[#fcfaf7] p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center gap-1 text-[#ffb000]">
                  {Array.from({ length: review.rating }).map((_, starIndex) => (
                    <span key={starIndex} className="text-xs">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-[#111111]">
                  {review.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6d655d]">
                  {review.text}
                </p>
                <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#9b938b]">
                  {review.date}
                </p>
              </article>
            ))}
          </div>

          {visibleCount < reviews.length ? (
            <button
              type="button"
              onClick={handleLoadMore}
              className="mx-auto mt-6 block rounded-full border border-[#ddd5cc] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:bg-[#f4efe8] active:scale-95 cursor-pointer"
            >
              Load More Reviews
            </button>
          ) : (
            <p className="mt-6 text-center text-xs text-[#8b837b]">
              Showing all verified customer reviews
            </p>
          )}
        </div>
      )}

      {/* FAQ Tab Content */}
      {activeTab === "faq" && (
        <div className="mt-6 divide-y divide-[#ece6df]">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#111111] transition hover:text-[#8d6d60] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="ml-4 text-base font-bold text-[#8b837b]">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs leading-6 text-[#6d655d] md:text-sm">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
