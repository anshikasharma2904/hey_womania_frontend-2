"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { categoryQuickLinks } from "@/app/category/category-data";

type CategoryLink = {
  slug: string;
  href: string;
  label: string;
  icon: string;
};

type LuxuryCategoryNavigationProps = {
  categories?: CategoryLink[];
};

export function LuxuryCategoryNavigation({ categories: incomingCategories }: LuxuryCategoryNavigationProps) {
  const categories = incomingCategories && incomingCategories.length > 0 ? incomingCategories : categoryQuickLinks;

  return (
    <section className="bg-[linear-gradient(180deg,#fcf8f2_0%,#f6eee5_48%,#f2e8de_100%)] px-0 py-0 md:px-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-0 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {/* <p className="text-[0.72rem] font-medium uppercase tracking-[0.42em] text-[#a98071]">
              Discover Categories Through Film
            </p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-[3rem] leading-[0.9] tracking-[-0.06em] text-[#6c4a40] md:text-[5.4rem]">
              Browse western, traditional, and formal moods from the main edit.
            </h2> */}
          </div>

          <div className="max-w-md">
            {/* <p className="text-base leading-7 text-[#6f5f56]">
              A cleaner visual category moment for the homepage, using real
              collection references instead of abstract placeholders.
            </p> */}
          </div>
        </div>

        <div className="mt-12 rounded-[2.5rem] border border-[#efe4d8] bg-[linear-gradient(180deg,#fffdf9_0%,#f8f0e8_100%)] px-6 py-8 shadow-[0_18px_52px_rgba(97,74,58,0.08)] md:px-10 md:py-10">
          <div className="mb-6 flex items-center justify-between">
            <span className="hidden text-2xl text-[#c6b7ab] md:block">‹</span>
            <p className="text-center text-[0.64rem] font-medium uppercase tracking-[0.32em] text-[#b18a7b]">
              Lead Categories
            </p>
            <span className="hidden text-2xl text-[#c6b7ab] md:block">›</span>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar md:justify-between md:gap-4 md:overflow-visible lg:flex-nowrap">
            {categories.map((category) => (
              <motion.div
                key={category.slug}
                className="flex-none"
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  transition: { duration: 0.35, ease: "easeOut" }
                }}
              >
                <Link href={category.href} className="group flex w-[88px] flex-col items-center text-center md:w-[92px] lg:w-[100px]">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fffefb_0%,#f7ebe1_100%)] shadow-[0_16px_34px_rgba(97,74,58,0.08)] transition-all duration-500 group-hover:shadow-[0_24px_48px_rgba(97,74,58,0.14)] md:h-24 md:w-24">
                    <div className="absolute inset-[7px] rounded-full border border-[#f1c1b6]/90" />
                    <div className="absolute inset-[19px] rounded-full bg-[linear-gradient(180deg,#fff6f1_0%,#fde9e2_100%)] shadow-inner" />
                    <div className="absolute inset-[28px] rounded-full border border-white/70 md:inset-[32px]" />
                    <span className="material-symbols-outlined relative z-10 text-[1.35rem] text-[#ef6f63] md:text-[1.55rem]">
                      {category.icon}
                    </span>
                  </div>

                  <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[#6f5f56] transition-colors duration-300 group-hover:text-[#9c4049] md:text-[0.78rem]">
                    {category.label}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
