"use client";

import Image from "next/image";
import Link from "next/link";

interface CategoryPill {
  title: string;
  image: string;
  href: string;
}

const categoryPills: CategoryPill[] = [
  {
    title: "CO-ORDS",
    image: "/categoryImage/coordSet.webp",
    href: "/category/co-ords"
  },
  {
    title: "SHIRTS STORIES",
    image: "/categoryImage/shirtStory.webp",
    href: "/category/shirts-stories"
  },
  {
    title: "TOP STYLE",
    image: "/categoryImage/topStyle.webp",
    href: "/category/top-style"
  },
  {
    title: "DESI COLLECTIONS",
    image: "/categoryImage/desi.webp",
    href: "/category/desi-collections"
  },
  {
    title: "BRANDS STUDIO",
    image: "/categoryImage/brandStudio.webp",
    href: "/category/brands-studio"
  },
  {
    title: "JEWEL ROOM",
    image: "/categoryImage/jewelroom.webp",
    href: "/category/jewel-room"
  },
  {
    title: "BAG AFFAIRS",
    image: "/bags/Studio Mini Bag.webp",
    href: "/category/bag-affairs"
  },
  {
    title: "BIG SIZES STYLE",
    image: "/categoryImage/Big size style.webp",
    href: "/category/big-sizes-styl"
  },
  {
    title: "DRESS GALLERY",
    image: "/categoryImage/dressgallery.webp",
    href: "/category/dress-gallery"
  },
  {
    title: "EVERYDAY",
    image: "/categoryImage/everyday.webp",
    href: "/category/everyday"
  }
];

export function ShopByCategorySection() {
  return (
    <section className="bg-transparent px-3 py-4 md:px-8 md:py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header matching image banner */}
        <div className="mb-4 sm:mb-6 text-center">
          <h2
            className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-[#80142b] tracking-tight"
            style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", serif' }}
          >
            Shop by Category
          </h2>
          <p className="mt-1 text-xs sm:text-sm md:text-base text-[#6d655d] font-medium">
            Explore curated fashion edits for every style.
          </p>
        </div>

        {/* 10 Category Capsule Pills (2 rows of 5 on desktop, 2-3 per row on mobile/tablet) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4">
          {categoryPills.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex items-center gap-2 sm:gap-3 rounded-full border border-[#f2dede]/80 bg-gradient-to-r from-[#fff9f7] via-[#fff5f2] to-[#ffffff] p-1.5 sm:p-2 pr-3 sm:pr-4 shadow-[0_2px_10px_rgba(128,20,43,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#80142b]/30 hover:shadow-[0_4px_16px_rgba(128,20,43,0.12)]"
            >
              <div className="relative h-11 w-11 sm:h-13 sm:w-13 md:h-14 md:w-14 shrink-0 overflow-hidden rounded-full border border-[#f0d5d5] bg-[#faece9]">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="56px"
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-[0.68rem] sm:text-[0.74rem] md:text-xs font-bold leading-tight tracking-wide text-[#701a2b] transition-colors group-hover:text-[#901a35]">
                {cat.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
