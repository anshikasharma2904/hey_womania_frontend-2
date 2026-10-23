"use client";

import Image from "next/image";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { useWishbag } from "@/contexts/WishbagContext";
import { FaTrash, FaShoppingBag, FaHeart, FaArrowRight } from "react-icons/fa";
import { HiOutlineSparkles, HiOutlineShoppingBag } from "react-icons/hi2";

const POPULAR_CATEGORIES = [
  { label: "Everyday", href: "/category/everyday", image: "/categoryImage/everyday.webp" },
  { label: "Co-Ords", href: "/category/co-ords", image: "/categoryImage/coordSet.webp" },
  { label: "Top Style", href: "/category/top-style", image: "/categoryImage/topStyle.webp" },
  { label: "Jewel Room", href: "/category/jewel-room", image: "/categoryImage/jewelroom.webp" }
];

export default function WishbagPage() {
  const { items, removeFromWishbag } = useWishbag();

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-20 pt-6 text-[#1c1c19] sm:px-6 md:px-12 md:pb-24 md:pt-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[#8b837b]">
          <Link href="/" className="hover:text-[#111111] transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-[#1c1c19] font-semibold">Wishbag</span>
        </div>

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-[2rem] border border-[#ecdcd0] bg-gradient-to-br from-[#fdf8f3] via-[#faede2] to-[#f4dfd0] p-6 sm:p-8 md:p-12 shadow-[0_20px_50px_rgba(95,93,62,0.06)]">
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#c53b45]/5 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-[#b88b4a]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e4ccbe] bg-white/80 px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#9c4049] shadow-xs backdrop-blur-sm">
                <FaHeart className="text-[#c53b45] text-xs" />
                <span>Curated Wardrobe</span>
              </div>
              <h1 className="mt-4 font-[family:var(--font-display)] text-3xl font-bold tracking-tight text-[#1c1c19] sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.08]">
                Saved styles, ready when you are.
              </h1>
              <p className="mt-3.5 text-sm leading-relaxed text-[#6d655d] sm:text-base md:mt-4 md:leading-8">
                Keep your most-loved western, traditional, and jewellery picks in one calm, elegant space before moving them to your bag.
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex w-full flex-col gap-2.5 sm:flex-row md:w-auto md:items-center">
                <Link
                  href="/category/all"
                  className="rounded-full border border-[#ddd0c5] bg-white/90 px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#33312e] shadow-sm transition-all hover:bg-white hover:shadow-md active:scale-95"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/cart"
                  className="rounded-full bg-[#111111] px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-[#2e2a27] hover:shadow-lg active:scale-95"
                >
                  Move All to Bag
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Empty State / Items Grid */}
        {items.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-[#ece6df] bg-white p-8 text-center shadow-[0_14px_40px_rgba(95,93,62,0.04)] sm:p-12 md:p-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fdf2f4] text-[#c53b45] shadow-inner sm:h-24 sm:w-24">
              <FaHeart className="text-3xl sm:text-4xl" />
            </div>

            <h2 className="mt-6 font-[family:var(--font-display)] text-2xl font-bold text-[#1c1c19] sm:text-3xl md:text-4xl">
              Your wishbag is empty
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-[#7a726a] sm:text-base">
              Explore our new arrivals and tap the heart on styles you love to save them for later.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/category/all"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#9c4049] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(156,64,73,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#81353f] hover:shadow-[0_16px_30px_rgba(156,64,73,0.35)] active:scale-95"
              >
                <span>Explore All Collections</span>
                <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {/* Popular Categories Shortcut */}
            <div className="mt-14 border-t border-[#f0e7de] pt-10">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.24em] text-[#8b837b]">
                Popular Categories to Explore
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 max-w-3xl mx-auto">
                {POPULAR_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    className="group relative flex flex-col items-center rounded-2xl border border-[#ece6df] bg-[#fbf8f4] p-3 transition-all hover:bg-white hover:shadow-md"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border border-[#e4dcd3] bg-white sm:h-20 sm:w-20 shadow-xs">
                      <Image
                        src={cat.image}
                        alt={cat.label}
                        fill
                        sizes="80px"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <span className="mt-3 text-xs font-bold text-[#2d2926] uppercase tracking-wide group-hover:text-[#9c4049]">
                      {cat.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-6">
            {items.map((item) => (
              <article
                key={item.slug}
                className="group relative flex flex-col rounded-[1.4rem] border border-[#ece6df] bg-white p-3 shadow-[0_10px_30px_rgba(95,93,62,0.04)] transition-all hover:shadow-[0_18px_45px_rgba(95,93,62,0.09)] sm:rounded-[1.8rem] sm:p-4"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFromWishbag(item.slug)}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#9c4049] shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 sm:right-4 sm:top-4"
                  aria-label="Remove from wishbag"
                >
                  <FaTrash className="text-xs" />
                </button>

                <Link href={item.href} className="block overflow-hidden rounded-[1rem] bg-[#f5ede4] sm:rounded-[1.3rem]">
                  <div className="relative aspect-[3/4] w-full flex items-center justify-center p-2">
                    <ImageWithFallback
                      src={item.image}
                      fallbackSrcs={item.images || []}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 24vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>

                <div className="mt-3.5 flex flex-1 flex-col sm:mt-4">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#9c4049]">
                    {item.category}
                  </p>
                  <h2 className="mt-1.5 font-[family:var(--font-display)] text-base font-bold leading-tight text-[#1c1c19] line-clamp-2 sm:text-lg">
                    {item.title}
                  </h2>
                  <p className="mt-auto pt-3 text-base font-black text-[#111111] sm:text-xl">
                    {String(item.price).startsWith("₹") ? item.price : `₹${item.price}`}
                  </p>
                </div>

                <div className="mt-4 pt-1">
                  <Link
                    href={`/product/${item.slug}`}
                    className="block w-full rounded-full bg-[#111111] py-2.5 text-center text-xs font-bold uppercase tracking-[0.14em] text-white shadow-xs transition-all hover:bg-[#9c4049] active:scale-95"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
