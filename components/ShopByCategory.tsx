import Link from "next/link";
import Image from "next/image";

const categories = [
  { title: "MOST LOVED", items: "Trending Now", image: "", video: "/video/hey%20womaniya%20111.mp4", href: "/category/most-loved" },
  { title: "JUST DROPPED", items: "New Arrivals", image: "", video: "/video/video%202.mp4", href: "/category/just-dropped" },
  { title: "LAST CHANCE", items: "Clearance", image: "/models/model-traditional.png", href: "/category/last-chance" },
  { title: "EVERYDAY", items: "Daily Wear", image: "/models/model-minimal.png", href: "/category/everyday" },
  { title: "CO-ORDS", items: "Matching Sets", image: "/models/model-western.png", href: "/category/co-ords" },
  { title: "SHIRTS STORIES", items: "Tops & Blouses", image: "/models/model-formal.png", href: "/category/shirts-stories" },
  { title: "TOP STYLE", items: "Premium Styles", image: "/models/model-couture.png", href: "/category/top-style" },
  { title: "DESI COLLECTIONS", items: "Ethnic Wear", image: "/models/model-traditional.png", href: "/category/desi-collections" },
  { title: "BRANDS STUDIO", items: "Designer", image: "/models/model-editorial.png", href: "/category/brands-studio" },
  { title: "JEWEL ROOM", items: "Accessories", image: "/jewellery/Temple Gold Necklace.webp", href: "/category/jewel-room" },
  { title: "BAG AFFAIRS", items: "Handbags", image: "/bags/Studio Mini Bag.jpeg", href: "/category/bag-affairs" },
  { title: "BIG SIZES STYL", items: "Plus Size", image: "/models/model-minimal.png", href: "/category/big-sizes-styl" },
  { title: "DRESS GALLERY", items: "All Dresses", image: "/models/model-western.png", href: "/category/dress-gallery" }
];

export function ShopByCategory() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8">
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <h2 className="text-xl md:text-4xl font-bold tracking-tight text-[#111111] font-sans">
            Shop by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 overflow-hidden rounded-full border border-[#ece6df] bg-[#f8f0e8] transition-transform duration-300 group-hover:scale-105">
                {category.video ? (
                  <video
                    src={category.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover object-top"
                  />
                )}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[#111111]">
                {category.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
