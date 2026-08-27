"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatCoOrd } from "@/lib/format-utils";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MODEL_ASSETS, PRODUCT_ASSETS } from "@/lib/fashion-assets";

gsap.registerPlugin(ScrollTrigger);

type ProductCard = {
  name: string;
  price: string;
  image: string;
};

type Scene = {
  id: string;
  label: string;
  season: string;
  look: string;
  collection: string;
  headline: string;
  description: string;
  typography: string;
  model: string;
  silhouette: string;
  glow: string;
  products: ProductCard[];
};

type DiagonalPosition = {
  x: number;
  y: number;
  scale: number;
  depth: number;
  blur: number;
  opacity: number;
  rotate: number;
};

const scenes: Scene[] = [
  {
    id: "western",
    label: "01 / Western Wear",
    season: "Spring Summer 2026",
    look: "Look 01",
    collection: "Evening Structure",
    headline: "Modern tailoring, softened.",
    description: "Liquid satin. Quiet power.",
    typography: "WESTERN",
    model: MODEL_ASSETS.western,
    silhouette: MODEL_ASSETS.western,
    glow: "from-[#fff4e5]/90 via-[#f0ddc5]/55 to-transparent",
    products: [
      {
        name: "Sable Drape Blazer",
        price: "₹420",
        image: PRODUCT_ASSETS.western2
      },
      {
        name: "Goldline Satin Set",
        price: "₹380",
        image: PRODUCT_ASSETS.couture2
      }
    ]
  },
  {
    id: "traditional",
    label: "02 / Traditional Wear",
    season: "Ceremony Edit 2026",
    look: "Look 02",
    collection: "Ceremonial Light",
    headline: "Regal drape, held in light.",
    description: "Ivory sheen. Inherited glamour.",
    typography: "TRADITIONAL",
    model: MODEL_ASSETS.traditional,
    silhouette: MODEL_ASSETS.traditional,
    glow: "from-[#fff7ee]/90 via-[#ead2ae]/45 to-transparent",
    products: [
      {
        name: "Aurelia Embroidered Saree",
        price: "₹540",
        image: PRODUCT_ASSETS.traditional2
      },
      {
        name: "Temple Gold Blouse",
        price: "₹310",
        image: PRODUCT_ASSETS.traditional1
      }
    ]
  },
  {
    id: "couture",
    label: "03 / Indo-Western Couture",
    season: "Atelier Chapter 2026",
    look: "Look 03",
    collection: "Borderless Atelier",
    headline: "Fusion, cut with precision.",
    description: "Architectural volume. Polished drape.",
    typography: "COUTURE",
    model: MODEL_ASSETS.couture,
    silhouette: MODEL_ASSETS.couture,
    glow: "from-[#fff4eb]/90 via-[#d8bea5]/40 to-transparent",
    products: [
      {
        name: "Atelier Sculpt Jacket",
        price: "₹690",
        image: PRODUCT_ASSETS.couture1
      },
      {
        name: "Sandstone Veil Skirt",
        price: "₹460",
        image: PRODUCT_ASSETS.western1
      }
    ]
  },
  {
    id: "editorial",
    label: "04 / Editorial Fashion",
    season: "Campaign Finale 2026",
    look: "Look 04",
    collection: "Campaign Finale",
    headline: "A final frame for the cover.",
    description: "Soft shadow. Bold proportion.",
    typography: "EDITORIAL",
    model: MODEL_ASSETS.editorial,
    silhouette: MODEL_ASSETS.editorial,
    glow: "from-[#fff8ef]/90 via-[#e7d8c1]/40 to-transparent",
    products: [
      {
        name: "Noir Veil Column",
        price: "₹740",
        image: PRODUCT_ASSETS.couture2
      },
      {
        name: "Muse Gold Heel",
        price: "₹295",
        image: PRODUCT_ASSETS.western2
      }
    ]
  }
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function CinematicFashionHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const modelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const modelAmbientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const typoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const typoAmbientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const silhouetteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const silhouetteAmbientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[][]>([]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isMobile = window.innerWidth < 768;
      const totalSteps = scenes.length - 1;
      const diagonalPositions: DiagonalPosition[] = isMobile
        ? [
            { x: -36, y: 34, scale: 0.38, depth: 6, blur: 3.8, opacity: 0.05, rotate: -8 },
            { x: -18, y: 18, scale: 0.58, depth: 12, blur: 3, opacity: 0.12, rotate: -4 },
            { x: 2, y: 2, scale: 0.82, depth: 20, blur: 1.8, opacity: 0.32, rotate: 1 },
            { x: 24, y: -18, scale: 1.24, depth: 42, blur: 0.2, opacity: 1, rotate: 5 }
          ]
        : [
            { x: -42, y: 24, scale: 0.28, depth: 2, blur: 16, opacity: 0.03, rotate: -8 },
            { x: -18, y: 12, scale: 0.48, depth: 8, blur: 10, opacity: 0.1, rotate: -5 },
            { x: 8, y: 4, scale: 0.72, depth: 20, blur: 3, opacity: 0.28, rotate: 1 },
            { x: 34, y: -8, scale: 1, depth: 48, blur: 0, opacity: 1, rotate: 4 }
          ];

      const render = (rawProgress: number) => {
        const sceneProgress = rawProgress * totalSteps;

        scenes.forEach((_, index) => {
          const distance = sceneProgress - index;
          const visibility = clamp(1 - Math.abs(distance), 0, 1);
          const incoming = clamp(1 + distance, 0, 1);
          const outgoing = clamp(distance, 0, 1);
          const base = diagonalPositions[index];
          const translateX =
            base.x +
            (isMobile ? -18 : -16) * outgoing +
            (isMobile ? 20 : 18) * incoming +
            (index - 1.5) * (isMobile ? 0.8 : 1.15);
          const translateY =
            base.y +
            (isMobile ? 8 : 6) * outgoing -
            (isMobile ? 10 : 8) * incoming;
          const rotation =
            base.rotate +
            -1.1 * outgoing +
            0.95 * incoming;
          const modelScale = base.scale + visibility * 0.42 - outgoing * 0.08;
          const modelOpacity = clamp(base.opacity + visibility * 0.18, 0, 1);
          const blurAmount = prefersReducedMotion
            ? 0
            : base.blur + (1 - visibility) * 0.7;
          const contrast = 0.8 + visibility * 0.2;
          const saturate = 0.76 + visibility * 0.24;
          const brightness = 0.84 + visibility * 0.16;
          const shadowOpacity = 0.005 + visibility * 0.24;

          if (modelRefs.current[index]) {
            gsap.set(modelRefs.current[index], {
              xPercent: translateX,
              yPercent: translateY,
              scale: modelScale,
              rotate: rotation,
              opacity: modelOpacity,
              filter: `blur(${blurAmount}px) saturate(${saturate}) contrast(${contrast}) brightness(${brightness})`,
              boxShadow: `0 42px 100px rgba(75,48,23,${shadowOpacity})`,
              zIndex: Math.round(visibility * 100) + base.depth + index
            });
          }

          if (contentRefs.current[index]) {
            gsap.set(contentRefs.current[index], {
              xPercent: 3 * incoming - 3 * outgoing,
              yPercent: 1 * outgoing - 1 * incoming,
              opacity: clamp(visibility * 0.82, 0, 1),
              zIndex: Math.round(visibility * 50) + 10
            });
          }

          if (typoRefs.current[index]) {
            gsap.set(typoRefs.current[index], {
              xPercent: 7 * incoming - 11 * outgoing,
              yPercent: 8 * outgoing - 4 * incoming,
              scale: 0.97 + visibility * 0.06,
              opacity: 0.015 + visibility * 0.045
            });
          }

          if (silhouetteRefs.current[index]) {
            gsap.set(silhouetteRefs.current[index], {
              xPercent: -3 * outgoing + 2 * incoming,
              yPercent: 3 * outgoing - 2 * incoming,
              opacity: 0.01 + visibility * 0.025,
              scale: 0.995 + visibility * 0.01
            });
          }

          if (railRefs.current[index]) {
            gsap.set(railRefs.current[index], {
              yPercent: -24 * outgoing + 24 * incoming,
              opacity: clamp(visibility * 1.02, 0, 1)
            });
          }

          cardRefs.current[index]?.forEach((card, cardIndex) => {
            if (!card) {
              return;
            }

            gsap.set(card, {
              xPercent: 0,
              yPercent:
                (cardIndex === 0 ? -14 : 14) * outgoing +
                (cardIndex === 0 ? 14 : -14) * incoming,
              opacity: clamp(visibility * 0.92 - cardIndex * 0.06, 0, 1),
              scale: 0.94 + visibility * 0.08 - cardIndex * 0.01,
              rotate: cardIndex === 0 ? -0.8 + visibility * 0.4 : 0.8 - visibility * 0.4,
              filter: `blur(${(1 - visibility) * 0.7}px)`,
              boxShadow: `0 10px 24px rgba(85,60,35,${0.03 + visibility * 0.03})`
            });
          });
        });

        if (progressBarRef.current) {
          gsap.set(progressBarRef.current, {
            scaleX: clamp(rawProgress, 0, 1),
            transformOrigin: "left center"
          });
        }
      };

      render(0);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${isMobile ? 2800 : 4200}`,
        pin: true,
        scrub: prefersReducedMotion ? false : 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress)
      });

      if (!prefersReducedMotion) {
        modelAmbientRefs.current.forEach((node, index) => {
          if (!node) {
            return;
          }

          gsap.to(node, {
            yPercent: index % 2 === 0 ? -1.2 : 1,
            xPercent: index % 2 === 0 ? 1.4 : -1.2,
            rotate: index % 2 === 0 ? -0.45 : 0.4,
            duration: 8.2 + index * 0.95,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        });

        silhouetteAmbientRefs.current.forEach((node, index) => {
          if (!node) {
            return;
          }

          gsap.to(node, {
            xPercent: index % 2 === 0 ? 1.4 : -1.4,
            yPercent: index % 2 === 0 ? -1.2 : 1.2,
            duration: 9 + index,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        });

        typoAmbientRefs.current.forEach((node, index) => {
          if (!node) {
            return;
          }

          gsap.to(node, {
            yPercent: index % 2 === 0 ? -0.8 : 0.7,
            scale: index % 2 === 0 ? 1.01 : 0.992,
            opacity: index % 2 === 0 ? "+=0.008" : "-=0.006",
            duration: 7.4 + index * 0.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-noise relative isolate h-screen overflow-hidden bg-[#f8f6f0]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,242,235,0.98)_46%,rgba(236,229,219,0.86)_100%)]" />
      <div className="absolute inset-y-0 right-0 z-10 hidden w-[15vw] min-w-[176px] bg-[#f6f5f2]/94 md:block" />
      <div className="absolute inset-x-0 top-0 z-30 px-6 pt-5 md:px-10 lg:px-16 lg:pt-8">
        <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.42em] text-mocha/45">
          <span>Maison Aurelia Runway</span>
          <span>Lookbook Film 2026</span>
        </div>
        <div className="mt-4 h-px bg-white/35">
          <div ref={progressBarRef} className="h-full w-full bg-[#b78e51]" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        {scenes.map((scene, sceneIndex) => (
          <div
            key={`${scene.id}-diagonal-model`}
            ref={(node) => {
              modelRefs.current[sceneIndex] = node;
            }}
            className="will-change-transform absolute bottom-[-34%] left-[-38%] h-[108vh] w-[84vw] md:bottom-[-34%] md:left-[18%] md:h-[118vh] md:w-[28vw] lg:bottom-[-34%] lg:left-[30%] lg:h-[120vh] lg:w-[24vw]"
          >
            <div
              ref={(node) => {
                modelAmbientRefs.current[sceneIndex] = node;
              }}
              className="relative h-full w-full overflow-visible"
            >
              <div className="absolute inset-[20%] rounded-full bg-white/5 blur-[28px]" />
              <Image
                src={scene.model}
                alt={`${scene.collection} fashion model`}
                fill
                priority={sceneIndex < 2}
                className="object-contain object-bottom mix-blend-multiply drop-shadow-[0_28px_64px_rgba(75,48,23,0.14)]"
                sizes="(max-width: 768px) 72vw, 32vw"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 px-6 pb-8 pt-44 md:px-10 md:pt-28 lg:px-16 lg:pb-14 lg:pt-32">
        {scenes.map((scene, sceneIndex) => (
          <div
            key={scene.id}
            className="pointer-events-none absolute inset-0 grid items-end md:grid-cols-[1.1fr_0.9fr]"
          >
            <div
              ref={(node) => {
                silhouetteRefs.current[sceneIndex] = node;
              }}
              className={`silhouette-glow absolute bottom-[16%] left-[11%] h-[20vh] w-[12vw] rounded-full bg-gradient-to-br ${scene.glow}`}
            >
              <div
                ref={(node) => {
                  silhouetteAmbientRefs.current[sceneIndex] = node;
                }}
                className="relative h-full w-full"
              >
                <Image
                  src={scene.silhouette}
                  alt=""
                  fill
                  className="object-contain object-left-bottom opacity-10"
                  priority={sceneIndex === 0}
                />
              </div>
            </div>

            <div
              ref={(node) => {
                typoRefs.current[sceneIndex] = node;
              }}
              className="absolute left-[12%] top-[16%] z-10 font-[family:var(--font-display)] text-[6vw] font-medium leading-none tracking-[0.15em] text-[rgba(184,174,161,0.03)] md:left-[14%] md:text-[3vw]"
            >
              <div
                ref={(node) => {
                  typoAmbientRefs.current[sceneIndex] = node;
                }}
              >
                {scene.typography}
              </div>
            </div>

            <div
              ref={(node) => {
                contentRefs.current[sceneIndex] = node;
              }}
              className="will-change-transform absolute inset-0 z-30"
            >
              <div className="absolute bottom-[10%] left-[4%] max-w-[8rem] md:bottom-[12%] md:left-[2%]">
                <p className="mb-2 text-[0.46rem] uppercase tracking-[0.42em] text-mocha/22">
                  Edit
                </p>
                <h1 className="max-w-[7.5rem] font-[family:var(--font-display)] text-[0.94rem] font-normal leading-[1.02] tracking-[-0.02em] text-[#3f3428]/72 md:text-[1.12rem] lg:text-[1.22rem]">
                  {scene.collection}
                </h1>
              </div>

              <div
                ref={(node) => {
                  railRefs.current[sceneIndex] = node;
                }}
                className="absolute right-[2%] top-[8%] min-h-[360px] w-[150px] overflow-hidden sm:w-[160px] md:right-[3%] md:min-h-[560px] md:w-[150px]"
              >
                {scene.products.slice(0, 2).map((product, cardIndex) => (
                  <motion.div
                    key={`${scene.id}-${product.name}`}
                    ref={(node) => {
                      if (!cardRefs.current[sceneIndex]) {
                        cardRefs.current[sceneIndex] = [];
                      }
                      cardRefs.current[sceneIndex][cardIndex] = node;
                    }}
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.35, ease: "easeOut" }
                    }}
                    className={`will-change-transform pointer-events-auto absolute left-0 ${
                      cardIndex === 0 ? "top-[2%]" : "top-[33%]"
                    } glass-card w-[142px] rounded-[1rem] p-2 shadow-luxe sm:w-[154px] md:w-[150px]`}
                  >
                    {cardIndex === 0 ? (
                      <>
                        <div className="mb-2 flex items-start justify-between px-1">
                          <span className="text-sm leading-none text-mocha/42">♡</span>
                          <span className="text-base leading-none text-mocha/38">+</span>
                        </div>
                        <div className="overflow-hidden rounded-[1rem] bg-white/72">
                          <Image
                            src={scene.model}
                            alt={`${scene.collection} style`}
                            width={420}
                            height={540}
                            className="h-[126px] w-full object-contain object-bottom transition-transform duration-500 hover:scale-105 md:h-[138px]"
                            sizes="(max-width: 768px) 142px, 150px"
                            loading={sceneIndex === 0 ? "eager" : "lazy"}
                          />
                        </div>
                        <div className="px-1 pb-1 pt-3">
                          <p className="text-[0.48rem] uppercase tracking-[0.2em] text-mocha/50 md:text-[0.5rem]">
                            {scene.collection}
                          </p>
                          <p className="mt-1 text-[0.58rem] tracking-[0.14em] text-mocha/46 md:text-[0.62rem]">
                            {product.price}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-2 flex items-start justify-between px-1">
                          <span className="text-sm leading-none text-mocha/42">♡</span>
                          <span className="text-base leading-none text-mocha/38">+</span>
                        </div>
                        <div className="overflow-hidden rounded-[1rem] bg-white/72">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={420}
                            height={540}
                            className="h-[98px] w-full object-cover object-top transition-transform duration-500 hover:scale-110 md:h-[108px]"
                            sizes="(max-width: 768px) 142px, 150px"
                            loading={sceneIndex === 0 ? "eager" : "lazy"}
                          />
                        </div>
                        <div className="px-1 pb-1 pt-3">
                          <p className="text-[0.48rem] uppercase tracking-[0.2em] text-mocha/50 md:text-[0.5rem]">
                            {formatCoOrd(product.name)}
                          </p>
                          <p className="mt-1 text-[0.58rem] tracking-[0.14em] text-mocha/46 md:text-[0.62rem]">
                            {product.price}
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
