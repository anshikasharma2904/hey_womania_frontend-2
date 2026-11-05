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
    id: "below-1999",
    minPrice: 0,
    maxPrice: 1999,
    imageSrc: "/budget-tag-below-1999.webp",
    imageAlt: "Shop By Budget Below ₹1,999 - Stylish Looks Small Budget"
  },
  {
    id: "above-2000",
    minPrice: 2000,
    maxPrice: 999999,
    imageSrc: "/budget-tag-above-2000.webp",
    imageAlt: "Shop By Budget ₹2,000 & Above - Premium Styles Elevated Looks"
  }
];

export function ShopByBudget() {
  return (
    <section className="bg-transparent px-3 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
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
            className="rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-4 py-2 text-xs font-semibold text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white md:px-5 md:py-3 md:text-sm"
          >
            View All
          </Link>
        </div>

        {/* 2 Budget Graphic Cards in 1 Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-8 w-full max-w-2xl mx-auto">
          {budgetTiers.map((tier) => (
            <Link
              key={tier.id}
              href={`/category/all?minPrice=${tier.minPrice}&maxPrice=${tier.maxPrice}`}
              className="relative block aspect-[1/1.68] w-full cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            >
              <Image
                src={tier.imageSrc}
                alt={tier.imageAlt}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 35vw, 320px"
                className="object-contain object-center"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
