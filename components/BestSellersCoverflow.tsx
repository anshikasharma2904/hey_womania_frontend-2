"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MODEL_ASSETS } from "@/lib/fashion-assets";
import { slugifyProductName } from "@/app/category/category-data";

type BestSellerItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

type BestSellersCoverflowProps = {
  title?: string;
  viewAllHref?: string;
};

const items: BestSellerItem[] = [
  {
    id: "01",
    title: "Western Tailoring",
    subtitle: "Structured drape and sharp layering",
    image: MODEL_ASSETS.western,
    href: `/product/${slugifyProductName("Sable Drape Blazer")}`
  },
  {
    id: "02",
    title: "Evening Layers",
    subtitle: "Soft structure for after-dark edits",
    image: MODEL_ASSETS.editorial,
    href: `/product/${slugifyProductName("Studio Evening Dress")}`
  },
  {
    id: "03",
    title: "Minimal Form",
    subtitle: "Relaxed luxury with clean contrast",
    image: MODEL_ASSETS.formal,
    href: `/product/${slugifyProductName("Ivory Formal Jacket")}`
  },
  {
    id: "04",
    title: "Ceremonial Light",
    subtitle: "Traditional elegance in motion",
    image: MODEL_ASSETS.traditional,
    href: `/product/${slugifyProductName("Arah Festive Lehenga")}`
  },
  {
    id: "05",
    title: "Borderless Atelier",
    subtitle: "Contemporary couture, softened",
    image: MODEL_ASSETS.couture,
    href: `/product/${slugifyProductName("Wedding Guest Edit")}`
  },
  {
    id: "06",
    title: "Muse Edit",
    subtitle: "Polished silhouettes for city dressing",
    image: MODEL_ASSETS.minimal,
    href: `/product/${slugifyProductName("Studio Ivory Look")}`
  },
  {
    id: "07",
    title: "Quiet Power",
    subtitle: "A refined monochrome fashion note",
    image: MODEL_ASSETS.editorial,
    href: `/product/${slugifyProductName("Muse Outer Layer")}`
  }
];

const DEPTH_STATES = {
  0: {
    x: 0,
    z: 220,
    y: -6,
    rotateY: 0,
    scale: 1,
    opacity: 1,
    blur: 0,
    shadow: "0 46px 90px rgba(0,0,0,0.32)"
  },
  1: {
    x: 148,
    z: 60,
    y: 8,
    rotateY: -35,
    scale: 0.7,
    opacity: 0.76,
    blur: 1,
    shadow: "0 26px 52px rgba(0,0,0,0.18)"
  },
  2: {
    x: 246,
    z: -70,
    y: 26,
    rotateY: -42,
    scale: 0.56,
    opacity: 0.4,
    blur: 2.5,
    shadow: "0 18px 34px rgba(0,0,0,0.1)"
  },
  3: {
    x: 314,
    z: -170,
    y: 38,
    rotateY: -50,
    scale: 0.45,
    opacity: 0.2,
    blur: 4,
    shadow: "0 12px 24px rgba(0,0,0,0.08)"
  }
} as const;

const coverflowState = (relativeIndex: number) => {
  const clamped = Math.max(-3, Math.min(3, relativeIndex));
  const distance = Math.abs(clamped) as 0 | 1 | 2 | 3;
  const direction = clamped < 0 ? -1 : 1;
  const base = DEPTH_STATES[distance];

  return {
    ...base,
    x: distance === 0 ? 0 : base.x * direction,
    rotateY: distance === 0 ? 0 : base.rotateY * direction
  };
};

export function BestSellersCoverflow({
  title = "Best Sellers",
  viewAllHref = "/best-sellers"
}: BestSellersCoverflowProps) {
  const [activeIndex, setActiveIndex] = useState(3);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const handleActivate = (index: number) => {
    setActiveIndex((currentIndex) => (currentIndex === index ? currentIndex : index));
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      for (let index = 0; index < items.length; index += 1) {
        const card = cardRefs.current[index];
        const detail = textRefs.current[index];
        if (!card || !detail) {
          continue;
        }

        const relativeIndex = index - activeIndex;
        const state = coverflowState(relativeIndex);

        gsap.to(card, {
          xPercent: -50,
          x: state.x,
          y: state.y,
          z: state.z,
          rotateY: state.rotateY,
          scale: state.scale,
          opacity: state.opacity,
          filter: `blur(${state.blur}px)`,
          boxShadow: state.shadow,
          zIndex: 100 - Math.abs(relativeIndex) * 10,
          duration: 1.05,
          ease: "power3.out"
        });

        gsap.to(detail, {
          autoAlpha: relativeIndex === 0 ? 1 : 0,
          y: relativeIndex === 0 ? 0 : 18,
          duration: 0.7,
          ease: "power2.out"
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [activeIndex]);

  return (
    <section
      id="best-sellers"
      ref={sectionRef}
      className="bg-[radial-gradient(circle_at_top,rgba(255,244,232,0.9),transparent_24%),linear-gradient(180deg,#e8dfd6_0%,#d8ccbf_22%,#23201d_100%)] px-5 pb-20 pt-8 md:px-16 md:pb-28"
    >
      <div className="mb-10 flex items-center justify-between gap-4">
        <h2 className="font-sans text-4xl font-black tracking-[-0.06em] text-[#111111] md:text-6xl">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#343434] shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-opacity duration-300 hover:opacity-75 md:px-5 md:py-3 md:text-lg"
        >
          View All
          <span className="material-symbols-outlined text-[1.1rem]">chevron_right</span>
        </Link>
      </div>

      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] px-4 pb-10 pt-10 shadow-[0_24px_70px_rgba(20,18,16,0.28)] md:px-10 md:pb-16 md:pt-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_62%)]" />

        <div className="[perspective:2200px]">
          <div className="relative h-[360px] [transform-style:preserve-3d] md:h-[470px]">
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                onMouseEnter={() => handleActivate(index)}
                onFocus={() => handleActivate(index)}
                aria-label={`Focus ${item.title}`}
                className="absolute left-1/2 top-10 h-[250px] w-[170px] rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.14),transparent_28%),linear-gradient(180deg,#8d6d60_0%,#5f4b40_28%,#241d1a_72%,#161311_100%)] p-0 [transform-style:preserve-3d] transition-transform duration-500 md:h-[320px] md:w-[220px]"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_22%,rgba(0,0,0,0.16))]" />
                <div className="pointer-events-none absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-white/75 shadow-[0_10px_22px_rgba(255,255,255,0.08)]" />
                <div className="pointer-events-none absolute bottom-0 left-1/2 h-8 w-8 -translate-x-1/2 translate-y-1/2 rounded-full border border-[#f0d0b4]/40 bg-[#b76a3c] shadow-[0_12px_24px_rgba(183,106,60,0.24)]" />
                <img
                  src={item.image}
                  alt={item.title}
                  className="pointer-events-none absolute bottom-0 left-1/2 h-[86%] w-auto -translate-x-1/2 object-contain"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="relative mt-4 h-[88px] md:h-[96px]">
          {items.map((item, index) => (
            <div
              key={`${item.id}-detail`}
              ref={(node) => {
                textRefs.current[index] = node;
              }}
              className="absolute inset-x-0 top-0 text-center"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#ef8b76]">
                #{item.id}
              </p>
              <h3 className="mt-2 font-sans text-[1.6rem] font-black tracking-[-0.05em] text-white md:text-[2rem]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-white/58 md:text-[0.95rem]">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
