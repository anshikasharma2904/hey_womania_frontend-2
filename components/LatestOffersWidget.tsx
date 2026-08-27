"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { JEWELLERY_ASSETS, MODEL_ASSETS, PRODUCT_ASSETS } from "@/lib/fashion-assets";

const offers = [
  {
    title: "Grand Summer Sale is LIVE",
    meta: "5 days ago",
    accent: "50-80% off",
    tone: "Sale Event",
    image: MODEL_ASSETS.traditional
  },
  {
    title: "Western wardrobe deals are here",
    meta: "6 days ago",
    accent: "Fresh markdowns",
    tone: "Western Edit",
    image: MODEL_ASSETS.western
  },
  {
    title: "Today’s best jewellery deal is here",
    meta: "21 days ago",
    accent: "Heirloom shine",
    tone: "Jewellery",
    image: JEWELLERY_ASSETS.templeGoldNecklace
  },
  {
    title: "Deal of the day is LIVE",
    meta: "29 days ago",
    accent: "Bag picks inside",
    tone: "Accessories",
    image: PRODUCT_ASSETS.couture1
  }
];

export function LatestOffersWidget() {
  const [open, setOpen] = useState(false);
  const unreadCount = useMemo(() => offers.length, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  return (
    <>
      <div className="fixed bottom-6 right-0 z-[70] flex items-end gap-3 md:bottom-8">
        {/* <button
          type="button"
          aria-label="Open latest offers tab"
          onClick={() => setOpen(true)}
          className="hidden h-[180px] w-14 items-center justify-center rounded-l-[1.4rem] border border-r-0 border-[#cfc0b4] bg-[linear-gradient(180deg,#8d7767_0%,#5f5d3e_100%)] text-white shadow-[0_18px_40px_rgba(95,93,62,0.28)] transition-all duration-300 hover:w-16 md:flex"
        >
          <div className="flex items-center gap-3 [writing-mode:vertical-rl]">
            <span className="text-xs font-semibold uppercase tracking-[0.28em]">
              Latest Offers
            </span>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ef6f63] px-1 text-[0.68rem] font-semibold text-white [writing-mode:horizontal-tb]">
              {unreadCount}
            </span>
          </div>
        </button> */}

        <div className="group mr-5 flex items-center gap-3 md:mr-6">
          <div className="hidden rounded-xl bg-[#25D366] px-4 py-2 text-sm font-medium text-white opacity-0 shadow-[0_12px_24px_rgba(0,0,0,0.24)] transition-opacity duration-200 group-hover:opacity-100 md:block">
            Chat with us
          </div>
          <a
            href="https://wa.me/918006637777"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_rgba(37,211,102,0.38)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.06] hover:shadow-[0_24px_48px_rgba(37,211,102,0.45)] md:h-16 md:w-16"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 md:h-8 md:w-8">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>

      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[80] bg-[rgba(34,27,21,0.18)] backdrop-blur-[3px]"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-24 right-3 w-[min(92vw,22rem)] overflow-hidden rounded-[1.4rem] border border-[#eadfd4] bg-[#fffaf5] shadow-[0_28px_80px_rgba(58,45,35,0.22)] sm:right-5 sm:w-[min(80vw,25rem)] md:bottom-10 md:right-16 md:top-24 md:w-[min(28rem,calc(100vw-8rem))] md:rounded-[1.8rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-[linear-gradient(135deg,#6e584a_0%,#5f5d3e_50%,#8d6d60_100%)] px-4 py-3 text-white sm:px-5 md:px-6 md:py-4">
              <div>
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-white/70">
                  Hey Womaniyaa Alerts
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-[-0.03em] sm:text-xl md:text-[1.7rem]">
                  Latest Offers
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close latest offers"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 transition-opacity duration-200 hover:opacity-75"
              >
                <span className="material-symbols-outlined text-[1.5rem] md:text-[1.75rem]">
                  close
                </span>
              </button>
            </div>

            <div className="max-h-[48vh] overflow-y-auto bg-[#fffaf5] sm:max-h-[54vh] md:max-h-[calc(100vh-16rem)]">
              {offers.map((offer) => (
                <article
                  key={`${offer.title}-${offer.meta}`}
                  className="grid grid-cols-[72px_1fr] gap-3 border-b border-[#ece6df] px-3 py-3 transition-colors duration-300 hover:bg-[#fcf4ec] sm:grid-cols-[88px_1fr] sm:gap-3 sm:px-4 md:grid-cols-[116px_1fr] md:gap-4"
                >
                  <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(180deg,#f7efe6,#ece2d8)]">
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      width={260}
                      height={150}
                      className="h-[72px] w-full object-contain object-bottom sm:h-[82px] md:h-[96px]"
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[#9c4049]">
                      {offer.tone}
                    </p>
                    <h3 className="mt-1 text-[0.92rem] font-semibold leading-tight text-[#2f2b26] sm:text-[1rem] md:mt-1.5 md:text-[1.2rem] md:tracking-[-0.02em]">
                      {offer.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-[#c1842f] sm:text-xs md:mt-1.5 md:text-sm">
                      {offer.accent} ✨
                    </p>
                    <p className="mt-2 text-xs text-[#8a8178] sm:text-sm md:mt-3 md:text-[1.15rem] md:leading-none">
                      {offer.meta}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-[#ece6df] bg-[#f7efe6] p-3 sm:p-4">
              <button
                type="button"
                className="w-full rounded-xl bg-[linear-gradient(135deg,#6e584a_0%,#5f5d3e_50%,#8d6d60_100%)] px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_rgba(95,93,62,0.24)] transition-all duration-300 hover:opacity-90 sm:px-5 sm:py-4 sm:text-sm md:text-[0.95rem]"
              >
                Subscribe to Notifications
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
