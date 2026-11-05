"use client";

import Image from "next/image";
import Link from "next/link";

interface CategoryPill {
  title: string;
  image: string;
  href: string;
  bgGradient: string;
  borderClass: string;
}

const categoryPills: CategoryPill[] = [
  {
    title: "CO-ORDS",
    image: "/categoryImage/coordSet.webp",
    href: "/category/co-ords",
    bgGradient: "from-[#f5d9c7] via-[#fae8dc] to-[#fdf4ee]",
    borderClass: "border-[#dfb59d]"
  },
  {
    title: "SHIRTS STORIES",
    image: "/categoryImage/shirtStory.webp",
    href: "/category/shirts-stories",
    bgGradient: "from-[#d2e4f5] via-[#e2effa] to-[#f0f6fc]",
    borderClass: "border-[#a8c9e7]"
  },
  {
    title: "SAREE",
    image: "/categoryImage/saree.webp",
    href: "/category/saree",
    bgGradient: "from-[#e4d4f2] via-[#eee3f8] to-[#f7f0fc]",
    borderClass: "border-[#c7addd]"
  },
  {
    title: "DESI COLLECTIONS",
    image: "/categoryImage/desi.webp",
    href: "/category/desi-collections",
    bgGradient: "from-[#f7ddc3] via-[#faebd9] to-[#fdf5eb]",
    borderClass: "border-[#e0b88f]"
  },
  {
    title: "JEWEL ROOM",
    image: "/categoryImage/jewelroom.webp",
    href: "/category/jewel-room",
    bgGradient: "from-[#f7cfdf] via-[#fae0eb] to-[#fdf0f5]",
    borderClass: "border-[#e2a8c2]"
  },
  {
    title: "BAG AFFAIRS",
    image: "/bags/Studio Mini Bag.webp",
    href: "/category/bag-affairs",
    bgGradient: "from-[#ede2cc] via-[#f4ebd9] to-[#faf5eb]",
    borderClass: "border-[#cfbe9a]"
  },
  {
    title: "DRESS GALLERY",
    image: "/categoryImage/dressgallery.webp",
    href: "/category/dress-gallery",
    bgGradient: "from-[#cee8dc] via-[#e0f1e8] to-[#f0f8f4]",
    borderClass: "border-[#9ecdb7]"
  },
  {
    title: "EVERYDAY",
    image: "/categoryImage/everyday.webp",
    href: "/category/everyday",
    bgGradient: "from-[#e2e8be] via-[#ecf0d3] to-[#f5f7e7]",
    borderClass: "border-[#bfc78e]"
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
              className={`group relative flex items-center justify-between gap-2.5 sm:gap-3 rounded-full border ${cat.borderClass} bg-gradient-to-r ${cat.bgGradient} p-2 pr-4 sm:p-2.5 sm:pr-5 shadow-[0_2px_8px_rgba(95,93,62,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#111111] hover:shadow-[0_8px_20px_rgba(17,17,17,0.08)]`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full border border-white/80 bg-white shadow-sm ring-1 ring-black/5">
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
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-[#786f68] shadow-sm transition-all duration-300 group-hover:bg-[#111111] group-hover:text-white group-hover:translate-x-0.5">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
