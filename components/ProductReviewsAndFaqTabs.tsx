"use client";

import React, { useState } from "react";

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

interface ProductTabsProps {
  initialReviews: Review[];
  productName?: string;
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

export function ProductReviewsAndFaqTabs({ initialReviews, productName }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "faq">("reviews");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [visibleCount, setVisibleCount] = useState(4);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, reviews.length));
  };

  return (
    <div className="rounded-[1.8rem] border border-[#ece6df] bg-white p-5 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-6">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece6df] pb-4">
        <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-[0.16em]">
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
