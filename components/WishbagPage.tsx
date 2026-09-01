"use client";

import Image from "next/image";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { useWishbag } from "@/contexts/WishbagContext";
import { FaTrash } from "react-icons/fa";

export default function WishbagPage() {
  const { items, removeFromWishbag } = useWishbag();

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-8 text-[#1c1c19] md:px-16 md:pb-24 md:pt-12 lg:pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.34em] text-[#9c4049]/70">
              Wishbag
            </p>
            <h1 className="mt-4 font-[family:var(--font-display)] text-[2.25rem] tracking-[-0.04em] text-[#1c1c19] md:text-6xl">
              Saved styles, ready when you are.
            </h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-[#6d655d] md:mt-5 md:text-base md:leading-8">
              Keep your most-loved western, traditional, and jewellery picks in one
              calm shopping space before moving them to bag.
            </p>
          </div>

          {items.length > 0 && (
            <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-row md:items-center md:gap-3">
              <Link
                href="/category/all"
                className="whitespace-nowrap rounded-full border border-[#e6dcd4] bg-white px-3 py-3 text-center text-[0.64rem] font-semibold uppercase tracking-[0.04em] text-[#5f5d3e] shadow-[0_12px_28px_rgba(95,93,62,0.04)] transition-all duration-300 hover:-translate-y-0.5 md:px-6 md:text-[0.82rem] md:tracking-[0.08em]"
              >
                Continue Shopping
              </Link>
              <Link
                href="/cart"
                className="whitespace-nowrap rounded-full bg-[#5f5d3e] px-3 py-3 text-center text-[0.64rem] font-semibold uppercase tracking-[0.04em] text-white transition-opacity duration-300 hover:opacity-90 md:px-6 md:text-[0.82rem] md:tracking-[0.08em]"
              >
                Move All to Bag
              </Link>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold text-[#1c1c19] md:text-2xl">
              Your wishbag is empty
            </h2>
            <p className="mt-2 text-sm text-[#6d655d]">
              Save your favorite items to view them here later.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 lg:mt-10 lg:grid-cols-3 lg:gap-5">
            {items.map((item) => (
              <article
                key={item.slug}
                className="relative flex flex-col rounded-[1.2rem] border border-[#ece6df] bg-white/92 p-3 shadow-[0_18px_40px_rgba(95,93,62,0.06)] md:rounded-[1.8rem] md:p-5"
              >
                <button
                  type="button"
                  onClick={() => removeFromWishbag(item.slug)}
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#9c4049] shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                  aria-label="Remove from wishbag"
                >
                  <FaTrash className="text-xs" />
                </button>
                <Link href={item.href} className="group block">
                  <div className="relative overflow-hidden rounded-[0.95rem] bg-[#f4efe8] md:rounded-[1.4rem]">
                    <div className="relative h-[160px] w-full sm:h-[200px] md:h-[280px] flex items-center justify-center p-2">
                      <ImageWithFallback
                        src={item.image}
                        fallbackSrcs={item.images || []}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 45vw, (max-width: 1024px) 50vw, 30vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                  </div>
                </Link>

                <div className="mt-4 flex flex-1 flex-col md:mt-5">
                  <p className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#9c4049]/72 md:text-[0.68rem] md:tracking-[0.22em]">
                    {item.category}
                  </p>
                  <h2 className="mt-2 font-[family:var(--font-display)] text-[1.25rem] leading-tight tracking-[-0.03em] text-[#1c1c19] md:text-[1.6rem] line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="mt-auto pt-3 text-base font-bold text-[#111111] md:pt-4 md:text-xl">
                    {String(item.price).startsWith("₹") ? item.price : `₹${item.price}`}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-2 md:mt-6 md:flex-row md:gap-3">
                  <Link
                    href={`/product/${item.slug}`}
                    className="flex-1 rounded-full bg-[#5f5d3e] px-4 py-2.5 text-center text-[0.64rem] font-semibold uppercase tracking-[0.06em] text-white transition-opacity duration-300 hover:opacity-90 md:px-5 md:py-3 md:text-[0.78rem] md:tracking-[0.08em]"
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
