"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ArrivalCard = {
  title: string;
  subtitle: string;
  price: string;
  compareAt: string;
  reviews: string;
  image: string;
  imageClass: string;
  href?: string;
};

type NewArrivalsCarouselProps = {
  cards?: ArrivalCard[];
};

export function NewArrivalsCarousel({ cards: incomingCards }: NewArrivalsCarouselProps) {
  const cards = (incomingCards || []).slice(0, 10);
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleCards = [
    ...cards.slice(activeIndex),
    ...cards.slice(0, activeIndex)
  ].slice(0, 4);

  useEffect(() => {
    if (cards.length === 0) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % cards.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, [cards.length]);

  useEffect(() => {
    if (activeIndex >= cards.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, cards.length]);

  return (
    <section id="shop-category-grid" className="mt-8 bg-[#fcf9f4] px-0 py-2 md:mt-12 md:px-0 md:py-4">
      <div className="mx-auto max-w-7xl rounded-[2rem] bg-white px-4 py-8 shadow-[0_22px_60px_rgba(95,93,62,0.06)] md:px-8 md:py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/70">
              Shop by Category
            </p>
            <h3 className="mt-2 font-sans text-3xl font-black uppercase tracking-[-0.05em] text-[#111111] md:text-5xl ">
              Just dropped
            </h3>
          </div>
          <Link
            href="/category/all"
            className="rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-4 py-2 text-xs font-semibold text-[#111111] transition-colors duration-300 hover:bg-[#111111] hover:text-white md:px-5 md:py-3 md:text-sm"
          >
            View All
          </Link>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-[1.45rem] border border-dashed border-[#e2d7cc] bg-[#fcf9f4] px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[#6d655d]">
              No Zoho new-arrival items found yet.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0">
            {visibleCards.map((item, index) => (
            <Link
              key={`${item.title}-${activeIndex}-${index}`}
              href={item.href || "/category"}
              className="group relative w-[calc((100%-0.75rem)/2)] min-w-[calc((100%-0.75rem)/2)] overflow-hidden rounded-[1.45rem] border border-[#efe7de] bg-white p-3.5 shadow-[0_10px_22px_rgba(95,93,62,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_34px_rgba(95,93,62,0.08)] sm:w-[220px] sm:min-w-[220px] sm:rounded-[1.7rem] sm:p-4 lg:w-auto lg:min-w-0 md:p-5"
            >
              <div className="relative overflow-hidden rounded-[1.1rem] bg-[#f0ebe4] sm:rounded-[1.35rem]">
                <div className="relative h-[200px] w-full sm:h-[270px] lg:h-[320px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 42vw, (max-width: 1200px) 21vw, 260px"
                    className={`absolute w-auto object-contain transition-transform duration-500 group-hover:scale-[1.04] ${item.imageClass}`}
                  />
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <p className="text-[0.56rem] font-semibold uppercase tracking-[0.18em] text-[#a64548] md:text-[0.68rem]">
                  {item.subtitle}
                </p>
                <h3 className="mt-2 min-h-[2.5rem] text-[0.98rem] font-semibold leading-5 text-[#171717] sm:min-h-[2.9rem] sm:text-[1.2rem] sm:leading-6 lg:text-[1.05rem]">
                  {item.title}
                </h3>
                <div className="mt-3 flex items-center gap-1 text-[#ffb000] sm:mt-4">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <span key={starIndex} className="text-[0.82rem] sm:text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-[0.82rem] text-[#7a726a] sm:text-[0.92rem]">
                  ({item.reviews})
                </p>
                <div className="mt-3 flex flex-col gap-1 sm:mt-4">
                  <div className="flex items-end gap-2">
                    <p className="text-[1rem] font-bold text-[#111111] sm:text-[1.25rem]">
                      {item.price}
                    </p>
                    <p className="text-[0.8rem] text-[#a39a92] line-through sm:text-sm">
                      {item.compareAt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
            ))}
          </div>
        )}

        {cards.length > 0 && (
          <div className="mt-6 flex justify-center gap-2">
            {cards.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index ? "w-8 bg-[#111111]" : "w-2.5 bg-[#d8c6bf]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
