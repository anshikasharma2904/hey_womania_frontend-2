"use client";

import Image from "next/image";
import Link from "next/link";

interface BudgetTier {
  id: string;
  minPrice: number;
  maxPrice: number;
  imageSrc: string;
  imageAlt: string;
}

const budgetTiers: BudgetTier[] = [
  {
    id: "under-1499",
    minPrice: 0,
    maxPrice: 1499,
    imageSrc: "/budget-tag-under-1499.webp",
    imageAlt: "Shop By Budget Below ₹1,499"
  },
  {
    id: "1500-4999",
    minPrice: 1500,
    maxPrice: 4999,
    imageSrc: "/budget-tag-1500-4999.webp",
    imageAlt: "Shop By Budget ₹1,500 - ₹4,999"
  },
  {
    id: "5000-9999",
    minPrice: 5000,
    maxPrice: 9999,
    imageSrc: "/budget-tag-5000-9999.webp",
    imageAlt: "Shop By Budget ₹5,000 - ₹9,999"
  },
  {
    id: "10000-19999",
    minPrice: 10000,
    maxPrice: 19999,
    imageSrc: "/budget-tag-10000-19999.webp",
    imageAlt: "Shop By Budget ₹10,000 - ₹19,999"
  },
  {
    id: "above-20000",
    minPrice: 20000,
    maxPrice: 999999,
    imageSrc: "/budget-tag-above-20000.webp",
    imageAlt: "Shop By Budget Above ₹20,000"
  }
];

export function ShopByBudget() {
  return (
    <section className="bg-transparent px-0 py-1 md:py-2">
      <div className="mx-auto max-w-7xl px-3 pt-1 pb-2 md:px-8 md:pt-2 md:pb-3">
        {/* Section Header */}
        <div className="mb-3 sm:mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.66rem] sm:text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/70">
              Curated Collections
            </p>
            <h3 className="mt-1 font-sans text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[-0.05em] text-[#111111]">
              Shop by Budget
            </h3>
          </div>
          <Link
            href="/category/all"
            className="rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-3 py-1.5 sm:px-4 sm:py-2 text-[0.7rem] sm:text-xs font-semibold text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white md:px-5 md:py-3 md:text-sm"
          >
            View All
          </Link>
        </div>

        {/* 5 Budget Graphic Cards in 1 Row - Click Redirects to Filtered Category Page */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3.5 md:gap-5 w-full">
          {budgetTiers.map((tier) => (
            <Link
              key={tier.id}
              href={`/category/all?minPrice=${tier.minPrice}&maxPrice=${tier.maxPrice}`}
              className="relative block aspect-[1/1.82] w-full cursor-pointer"
            >
              <Image
                src={tier.imageSrc}
                alt={tier.imageAlt}
                fill
                sizes="(max-width: 640px) 20vw, (max-width: 1024px) 20vw, 240px"
                className="object-contain object-center"
                priority
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
