"use client";

import Image from "next/image";
import Link from "next/link";

interface BudgetTier {
  id: string;
  minPrice: number;
  maxPrice: number;
  line1: string;
  line2: string;
  cardBorder: string;
  cardShadow: string;
  blobColor: string;
  priceColor: string;
  buttonBg: string;
  buttonHoverBg: string;
  imageSrc: string;
  imageAlt: string;
}

const budgetTiers: BudgetTier[] = [
  {
    id: "under-1499",
    minPrice: 0,
    maxPrice: 1499,
    line1: "₹0 -",
    line2: "₹1,499",
    cardBorder: "border-[#fcd9df]",
    cardShadow: "hover:shadow-[0_8px_20px_rgba(235,90,120,0.15)]",
    blobColor: "bg-[#fedfe5]/85",
    priceColor: "#d82d57",
    buttonBg: "bg-[#d82d57]",
    buttonHoverBg: "hover:bg-[#be2046]",
    imageSrc: "/models/model-western.png",
    imageAlt: "Budget Friendly Fashion Edit"
  },
  {
    id: "1500-4999",
    minPrice: 1500,
    maxPrice: 4999,
    line1: "₹1,500 -",
    line2: "₹4,999",
    cardBorder: "border-[#e5ddf8]",
    cardShadow: "hover:shadow-[0_8px_20px_rgba(100,60,170,0.15)]",
    blobColor: "bg-[#eee6fd]/85",
    priceColor: "#4f2b8c",
    buttonBg: "bg-[#4f2b8c]",
    buttonHoverBg: "hover:bg-[#3d1e70]",
    imageSrc: "/bags/Structured Occasion Clutch.webp",
    imageAlt: "Designer Handbag Edit"
  },
  {
    id: "5000-9999",
    minPrice: 5000,
    maxPrice: 9999,
    line1: "₹5,000 -",
    line2: "₹9,999",
    cardBorder: "border-[#fae3cf]",
    cardShadow: "hover:shadow-[0_8px_20px_rgba(180,95,30,0.15)]",
    blobColor: "bg-[#fdeede]/85",
    priceColor: "#a34810",
    buttonBg: "bg-[#a34810]",
    buttonHoverBg: "hover:bg-[#863708]",
    imageSrc: "/models/model-editorial.png",
    imageAlt: "Premium Occasion Edit"
  },
  {
    id: "10000-19999",
    minPrice: 10000,
    maxPrice: 19999,
    line1: "₹10,000 -",
    line2: "₹19,999",
    cardBorder: "border-[#d8efe5]",
    cardShadow: "hover:shadow-[0_8px_20px_rgba(15,130,90,0.15)]",
    blobColor: "bg-[#e5f6ee]/85",
    priceColor: "#0b6644",
    buttonBg: "bg-[#0b6644]",
    buttonHoverBg: "hover:bg-[#074d33]",
    imageSrc: "/models/model-traditional.png",
    imageAlt: "Celebration & Festive Couture"
  },
  {
    id: "above-20000",
    minPrice: 20000,
    maxPrice: 999999,
    line1: "Above",
    line2: "₹20,000",
    cardBorder: "border-[#fadbd8]",
    cardShadow: "hover:shadow-[0_8px_20px_rgba(165,15,40,0.15)]",
    blobColor: "bg-[#fde8e5]/85",
    priceColor: "#8f0d22",
    buttonBg: "bg-[#8f0d22]",
    buttonHoverBg: "hover:bg-[#6f0616]",
    imageSrc: "/budget-luxury-couture.jpg",
    imageAlt: "Royal Couture & Fine Jewellery"
  }
];

export function ShopByBudget() {
  return (
    <section className="bg-transparent px-0 py-2 md:mt-4 md:px-0 md:py-4">
      <div className="mx-auto max-w-7xl px-3 py-3 md:px-8 md:py-6">
        {/* Section Header */}
        <div className="mb-4 sm:mb-8 flex items-center justify-between gap-3">
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

        {/* 5 Compact Cards in 1 Row - Real Photo Assets */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3.5 md:gap-5 w-full">
          {budgetTiers.map((tier) => (
            <Link
              key={tier.id}
              href={`/category/all?minPrice=${tier.minPrice}&maxPrice=${tier.maxPrice}`}
              className={`group relative flex flex-col items-center justify-between rounded-xl sm:rounded-2xl md:rounded-3xl border ${tier.cardBorder} bg-white p-1.5 sm:p-3 md:p-4 transition-all duration-300 hover:-translate-y-1 ${tier.cardShadow} shadow-[0_2px_10px_rgba(0,0,0,0.03)] cursor-pointer overflow-hidden text-center`}
            >
              {/* Organic Watercolor Splash Blob */}
              <div
                className={`absolute top-1 sm:top-2 inset-x-1 sm:inset-x-3 h-14 sm:h-24 md:h-32 rounded-full ${tier.blobColor} blur-[2px] opacity-90 transition-transform duration-500 ease-out group-hover:scale-110 pointer-events-none -z-0`}
                style={{
                  borderRadius: "42% 58% 63% 37% / 45% 45% 55% 55%"
                }}
              />

              {/* Photo Asset Container */}
              <div className="relative z-10 w-full pt-1 sm:pt-2 flex items-center justify-center h-12 sm:h-20 md:h-28 overflow-hidden">
                <div className="relative w-10 h-11 sm:w-16 sm:h-18 md:w-22 md:h-26 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src={tier.imageSrc}
                    alt={tier.imageAlt}
                    fill
                    sizes="(max-width: 640px) 50px, (max-width: 1024px) 80px, 110px"
                    className="object-contain object-bottom drop-shadow-sm rounded-lg"
                  />
                </div>
              </div>

              {/* Price Range Text */}
              <div className="relative z-10 my-1 sm:my-2 w-full">
                <span
                  className="block font-sans text-[0.62rem] min-[380px]:text-[0.68rem] sm:text-sm md:text-base lg:text-[1.1rem] font-black tracking-tight leading-tight"
                  style={{ color: tier.priceColor }}
                >
                  {tier.line1}
                </span>
                <span
                  className="block font-sans text-[0.62rem] min-[380px]:text-[0.68rem] sm:text-sm md:text-base lg:text-[1.1rem] font-black tracking-tight leading-tight"
                  style={{ color: tier.priceColor }}
                >
                  {tier.line2}
                </span>
              </div>

              {/* Circular Action Button */}
              <div className="relative z-10 mt-0.5 sm:mt-1">
                <div
                  className={`w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full ${tier.buttonBg} ${tier.buttonHoverBg} text-white shadow-xs flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
                >
                  <svg
                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 fill-none stroke-current"
                    strokeWidth="2.6"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
