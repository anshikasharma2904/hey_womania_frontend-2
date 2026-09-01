"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";

type ShopByCategoryProps = {
  mostLovedImages?: string[];
  justDroppedImages?: string[];
};

const categories: { title: string; items: string; image: string; href: string; isSlider?: string; video?: string }[] = [
  { title: "MOST LOVED", items: "Trending Now", image: "", href: "/category/most-loved", isSlider: "mostLoved" },
  { title: "JUST DROPPED", items: "New Arrivals", image: "", href: "/category/just-dropped", isSlider: "justDropped" },
  { title: "LAST CHANCE", items: "Clearance", image: "/categoryImage/lastChance.jpeg", href: "/category/last-chance" },
  { title: "EVERYDAY", items: "Daily Wear", image: "/categoryImage/everyday.jpeg", href: "/category/everyday" },
  { title: "Co-Ords", items: "Matching Sets", image: "/categoryImage/coordSet.jpeg", href: "/category/co-ords" },
  { title: "SHIRTS STORIES", items: "Tops & Blouses", image: "/categoryImage/shirtStory.jpeg", href: "/category/shirt" },
  { title: "TOP STYLE", items: "Premium Styles", image: "/categoryImage/topStyle.jpeg", href: "/category/top-style" },
  { title: "DESI COLLECTIONS", items: "Ethnic Wear", image: "/categoryImage/desi.jpeg", href: "/category/desi-collections" },
  { title: "BRANDS STUDIO", items: "Designer", image: "/categoryImage/brandStudio.jpeg", href: "/category/brands-studio" },
  { title: "JEWEL ROOM", items: "Accessories", image: "/categoryImage/jewelroom.jpeg", href: "/category/jewel-room" },
  { title: "BAG AFFAIRS", items: "Handbags", image: "/bags/Studio Mini Bag.jpeg", href: "/category/bag-affairs" },
  { title: "BIG SIZES STYL", items: "Plus Size", image: "/categoryImage/Big size style.jpeg", href: "/category/big-sizes-styl" },
  { title: "DRESS GALLERY", items: "All Dresses", image: "/categoryImage/dressgallery.jpeg", href: "/category/dress-gallery" }
];

export function ShopByCategory({ mostLovedImages = [], justDroppedImages = [] }: ShopByCategoryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch dynamic category images from site settings
    fetch("http://localhost:5000/api/settings")
      .then(res => {
        if (!res.ok) return {} as any;
        return res.json();
      })
      .then(data => {
        if (data.categoryImages) {
          setCustomImages(data.categoryImages);
        }
      })
      .catch(err => console.error("Error fetching category images:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8">
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <h2 className="text-xl md:text-4xl font-bold tracking-tight text-[#111111] font-sans">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
          {categories.map((category) => {
            // Priority: Dynamic Custom Image -> MostLoved/JustDropped Slider -> Hardcoded Image
            let activeImage = customImages[category.title] || category.image;

            if (category.isSlider === "mostLoved" && mostLovedImages.length > 0) {
              activeImage = mostLovedImages[currentIndex % mostLovedImages.length];
            } else if (category.isSlider === "justDropped" && justDroppedImages.length > 0) {
              activeImage = justDroppedImages[currentIndex % justDroppedImages.length];
            }

            return (
              <Link
                key={category.title}
                href={category.href}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 overflow-hidden rounded-full border border-[#ece6df] bg-[#f8f0e8] transition-transform duration-300 group-hover:scale-105">
                  {category.video || (activeImage && activeImage.match(/\.(mp4|webm)$/i)) ? (
                    <video
                      src={category.video || (activeImage.startsWith('http') ? activeImage : `http://localhost:5000${activeImage}`)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    activeImage && (
                      <ImageWithFallback
                        src={activeImage.startsWith('http') || activeImage.startsWith('/') ? activeImage : `http://localhost:5000${activeImage}`}
                        alt={category.title}
                        fill
                        className="object-contain scale-[1.0] transition-opacity duration-1000"
                      />
                    )
                  )}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#111111]">
                  {category.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
