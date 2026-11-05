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
    <section className="bg-transparent px-3 py-6 sm:py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Section Header - Left aligned matching Shop by Budget and Just Dropped with View All */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.66rem] sm:text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/70">
              Curated Collections
            </p>
            <h2 className="mt-1 font-sans text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[-0.05em] text-[#111111]">
              Shop by Category
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6d655d] font-normal">
              Explore curated fashion edits for every style.
            </p>
          </div>
          <Link
            href="/category/all"
            className="shrink-0 rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-3 py-1.5 sm:px-4 sm:py-2 text-[0.7rem] sm:text-xs font-semibold text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white md:px-5 md:py-3 md:text-sm"
          >
            View All
          </Link>
        </div>

        {/* 8 Category Capsule Pills (2 rows of 4 on desktop, 2 per row on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
          {categoryPills.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative flex items-center justify-between gap-2.5 sm:gap-3 rounded-full border border-[#eddcd4] bg-white p-2 pr-4 sm:p-2.5 sm:pr-5 shadow-[0_2px_8px_rgba(95,93,62,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#111111] hover:shadow-[0_8px_20px_rgba(17,17,17,0.08)]"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full border border-[#e8dfd7] bg-[#fbf8f5] shadow-sm">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="64px"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="text-[0.75rem] sm:text-xs md:text-[0.84rem] font-bold uppercase tracking-wider text-[#111111] transition-colors group-hover:text-[#9c4049] truncate">
                  {cat.title}
                </span>
              </div>
              <span className="shrink-0 text-xs text-[#b5ada5] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#111111]">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
