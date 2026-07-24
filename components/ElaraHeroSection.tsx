"use client";

import { useEffect, useRef, useState } from "react";

type HeroModel = {
  alt: string;
  src: string;
  height: string;
  offset: string;
};

const heroModels: HeroModel[] = [
  {
    alt: "Model 1",
    src: "/models/model-western.png",
    height: "h-[80vh]",
    offset: "translate-y-12"
  },
  {
    alt: "Model 2",
    src: "/models/model-traditional.png",
    height: "h-[85vh]",
    offset: "translate-y-24"
  },
  {
    alt: "Model 3",
    src: "/models/model-couture.png",
    height: "h-[80vh]",
    offset: "translate-y-0"
  },
  {
    alt: "Model 4",
    src: "/models/model-editorial.png",
    height: "h-[90vh]",
    offset: "translate-y-16"
  },
  {
    alt: "Model 5",
    src: "/models/model-minimal.png",
    height: "h-[75vh]",
    offset: "translate-y-32"
  },
  {
    alt: "Model 6",
    src: "/models/model-formal.png",
    height: "h-[78vh]",
    offset: "translate-y-8"
  }
];

export function ElaraHeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(3);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollToIndexRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const scroller = scrollerRef.current;
    if (!section || !sticky || !scroller) {
      return;
    }

    const getCards = () =>
      Array.from(scroller.querySelectorAll<HTMLElement>("[data-hero-model]"));

    const scrollToIndex = (index: number) => {
      const cards = getCards();
      const target = cards[index];
      if (!target) {
        return;
      }

      const nextLeft =
        target.offsetLeft - (scroller.clientWidth / 2 - target.clientWidth / 2);

      scroller.scrollTo({
        left: Math.max(0, nextLeft),
        behavior: "smooth"
      });
    };

    scrollToIndexRef.current = scrollToIndex;

    const updateActiveFromCenter = () => {
      const cards = getCards();
      const center = scroller.scrollLeft + scroller.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(center - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    const syncWithPageScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollRange = Math.max(section.offsetHeight - sticky.offsetHeight, 1);
      const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 1);
      const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);

      scroller.scrollLeft = progress * maxScroll;
      setScrollProgress(progress);
      updateActiveFromCenter();
    };

    syncWithPageScroll();
    window.addEventListener("scroll", syncWithPageScroll, { passive: true });
    window.addEventListener("resize", syncWithPageScroll);

    return () => {
      window.removeEventListener("scroll", syncWithPageScroll);
      window.removeEventListener("resize", syncWithPageScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[165vh] w-full bg-[linear-gradient(180deg,#f6efe6_0%,#eadfd1_48%,#dccfc0_100%)]"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen w-full items-end overflow-hidden pt-8"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.9),transparent_25%),radial-gradient(circle_at_82%_24%,rgba(244,223,204,0.7),transparent_22%),radial-gradient(circle_at_50%_72%,rgba(183,142,81,0.14),transparent_26%)]" />
          <div className="absolute left-[8%] top-[16%] h-40 w-40 rounded-full bg-white/45 blur-[70px] md:h-56 md:w-56" />
          <div className="absolute right-[10%] top-[14%] h-44 w-44 rounded-full bg-[#f1d8c2]/55 blur-[78px] md:h-64 md:w-64" />
          <div className="absolute bottom-[20%] left-[28%] h-32 w-32 rounded-full bg-[#b78e51]/18 blur-[80px] md:h-48 md:w-48" />
          <div className="absolute inset-x-[7%] top-[12%] h-px bg-[linear-gradient(90deg,transparent,rgba(164,128,107,0.22),transparent)]" />
          <div className="absolute inset-x-[10%] bottom-[18%] h-px bg-[linear-gradient(90deg,transparent,rgba(164,128,107,0.18),transparent)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1
              className="absolute left-1/2 top-[44%] z-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-[family:var(--font-display)] text-[10vw] uppercase leading-none tracking-[-0.06em] md:text-[12vw]"
              style={{
                color: `rgba(99, 68, 56, ${0.08 + scrollProgress * 0.56})`
              }}
            >
              HeyWomaniyaa
            </h1>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="relative z-20 flex h-full w-full items-end overflow-x-auto px-[10vw] pt-2 no-scrollbar"
        >
          <div className="flex min-w-max items-end gap-[5vw] md:gap-[4vw] lg:gap-[3vw]">
            {heroModels.map((model, index) => {
              const active = index === activeIndex;

              return (
                <button
                  key={model.alt}
                  type="button"
                  data-hero-model
                  onClick={() => {
                    setActiveIndex(index);
                    scrollToIndexRef.current(index);
                  }}
                  className={`relative w-auto flex-none transform transition-all duration-700 ${
                    model.height
                  } ${model.offset} ${
                    active
                      ? "scale-[1.06] -translate-y-6"
                      : "scale-[0.96] opacity-75 hover:scale-[1.03] hover:opacity-100 hover:-translate-y-4"
                  }`}
                >
                  <img
                    alt={model.alt}
                    src={model.src}
                    className="h-full w-auto object-contain"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden bg-black py-4">
          <div className="marquee-right flex min-w-max items-center gap-8 whitespace-nowrap pr-8 text-xl font-semibold uppercase tracking-[0.08em] text-white md:text-3xl">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex items-center gap-8">
                <span>FROM STYLE TO SUCCESS.</span>
                <span className="text-[#e06f4f]">✶</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
