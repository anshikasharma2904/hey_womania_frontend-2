import Image from "next/image";
import Link from "next/link";
import { BestSellersCoverflow } from "@/components/BestSellersCoverflow";
import { ShopByCategory } from "@/components/ShopByCategory";
import { HeroVideoSlider } from "@/components/HeroVideoSlider";
import { LuxuryCategoryNavigation } from "@/components/LuxuryCategoryNavigation";
import { NewArrivalsCarousel } from "@/components/NewArrivalsCarousel";
import { StoreFooter } from "@/components/StoreFooter";
import { slugifyProductName } from "@/app/category/category-data";
import { MODEL_ASSETS } from "@/lib/fashion-assets";
import { categoryQuickLinks } from "@/app/category/category-data";

export const revalidate = 300;

const testimonials = [
  {
    name: "Sarah M.",
    tag: "Verified Buyer",
    image: MODEL_ASSETS.western,
    quote:
      "Loved the fit and fabric quality. The western edit looked even better in person and arrived beautifully packed."
  },
  {
    name: "Aisha K.",
    tag: "Traditional Edit",
    image: MODEL_ASSETS.traditional,
    quote:
      "The festive pieces felt premium, light to wear, and easy to style. Delivery and size guidance were both smooth."
  },
  {
    name: "Meera D.",
    tag: "Occasion Wear",
    image: MODEL_ASSETS.couture,
    quote:
      "The detailing and finish stood out immediately. It finally feels like a fashion store with real statement pieces."
  }
];

const trustPoints = [
  {
    title: "Easy Exchanges",
    text: "Flexible returns and assisted sizing support."
  },
  {
    title: "Fresh Drops",
    text: "New western, traditional, and plus-size edits every week."
  },
  {
    title: "Secure Checkout",
    text: "Fast bag flow with trusted payment and delivery updates."
  }
];

type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number;
  category: string;
  images: string[];
  variants: any[];
};

type BestSellerProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  images?: string[];
  soldCount?: number;
};

const arrivalImages: string[] = [
  MODEL_ASSETS.western,
  MODEL_ASSETS.traditional,
  MODEL_ASSETS.couture,
  MODEL_ASSETS.editorial,
  MODEL_ASSETS.minimal,
  MODEL_ASSETS.formal
];

const categoryIcons = ["checkroom", "styler", "diamond", "shopping_bag", "palette", "local_mall"];

function formatPrice(value: unknown) {
  const price = Number(value || 0);
  return `₹${Number.isFinite(price) ? price.toLocaleString("en-IN") : "0"}`;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function formatCategoryLabel(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getCategoryPathParts(value: string) {
  return value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getDisplayCategoryLabel(value: string) {
  const parts = getCategoryPathParts(value);
  if (parts.length === 0) return formatCategoryLabel(value);

  return formatCategoryLabel(parts[parts.length - 1] || parts[0]);
}

async function fetchProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/products?limit=24`, {
      cache: "no-store"
    });
    if (!res.ok) return [];
    const result = await res.json();
    let list = result.data ? result.data : Array.isArray(result) ? result : [];
    return list.filter((p: any) => p.title !== "U.S polo" && p.title !== "T shirt - pcs / Default");
  } catch {
    return [];
  }
}

async function fetchBestSellers(): Promise<BestSellerProduct[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/products/best-sellers?limit=7`, {
      cache: "no-store"
    });
    if (!res.ok) return [];
    const result = await res.json();
    let list = result.data ? result.data : Array.isArray(result) ? result : [];
    return list.filter((p: any) => p.title !== "U.S polo" && p.title !== "T shirt - pcs / Default");
  } catch {
    return [];
  }
}

function mapProductsToArrivals(products: Product[]) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return products.slice(0, 10).map((product, index) => {
    const price = product.salePrice || product.price || 0;
    const compareAt = product.price > product.salePrice ? product.price : price * 1.2;
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.availableStock || 0), 0) || 0;

    let imageUrl = arrivalImages[index % arrivalImages.length];
    if (product.images && product.images.length > 0) {
        imageUrl = product.images[0].startsWith('http') ? product.images[0] : `${apiUrl}${product.images[0]}`;
    }

    return {
      title: product.title,
      subtitle: product.category,
      price: formatPrice(price),
      compareAt: formatPrice(compareAt),
      reviews: `${totalStock} in stock`,
      image: imageUrl,
      imageClass: "h-[112%] right-[-4%] bottom-[-10%]",
      href: `/product/${product.slug}`
    };
  });
}

function mapProductsToCategories(products: Product[]) {
  const seen = new Set<string>();
  const categories = products
    .map((p) => p.category)
    .filter((category): category is string => Boolean(category && category.trim()))
    .filter((category) => {
      const key = category.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map((category, index) => {
      const slug = slugify(category);
      return {
        slug,
        href: `/category/${slug}`,
        label: getDisplayCategoryLabel(category),
        icon: categoryIcons[index % categoryIcons.length]
      };
    });

  return categories.length > 0 ? categories : categoryQuickLinks;
}

function mapProductsToBestSellers(products: BestSellerProduct[]) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  return products.map((product, index) => {
    const parts = getCategoryPathParts(product.category || "");
    const categoryLabel = formatCategoryLabel(parts[1] || parts[0] || "Collection");

    let imageUrl = arrivalImages[index % arrivalImages.length];
    if (product.images && product.images.length > 0) {
      imageUrl = product.images[0].startsWith("http")
        ? product.images[0]
        : `${apiUrl}${product.images[0]}`;
    }

    return {
      id: String(index + 1).padStart(2, "0"),
      title: product.title,
      subtitle: `${categoryLabel}${product.soldCount ? ` • ${product.soldCount} sold` : ""}`,
      image: imageUrl,
      href: `/product/${product.slug || slugifyProductName(product.title)}`
    };
  });
}

function mapProductsToTestimonials(products: Product[]) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const validProducts = products.filter(p => p.images && p.images.length > 0);

  const fallbackReviews = [
    {
      name: "Sarah M.",
      tag: "Verified Buyer",
      quote: "Loved the fit and fabric quality. The suit set looked even better in person and arrived beautifully packed."
    },
    {
      name: "Aisha K.",
      tag: "Verified Buyer",
      quote: "The festive embroidery felt premium, light to wear, and easy to style. Delivery and size guidance were both smooth."
    },
    {
      name: "Meera D.",
      tag: "Verified Buyer",
      quote: "The detailing and finish stood out immediately. It finally feels like a fashion store with real statement pieces."
    }
  ];

  return fallbackReviews.map((review, index) => {
    const prod = validProducts[index % Math.max(1, validProducts.length)];
    let imageUrl = arrivalImages[index % arrivalImages.length];

    if (prod && prod.images && prod.images.length > 0) {
      imageUrl = prod.images[0].startsWith("http")
        ? prod.images[0]
        : `${apiUrl}${prod.images[0]}`;
    }

    return {
      name: review.name,
      tag: review.tag,
      productTitle: prod ? prod.title : "Exclusive Collection",
      href: prod ? `/product/${prod.slug || slugifyProductName(prod.title)}` : "#",
      image: imageUrl,
      quote: prod
        ? `Loved the fit and finish of ${prod.title}. The fabric quality looked even better in person!`
        : review.quote
    };
  });
}

export default async function Home() {
  const [products, bestSellerProducts] = await Promise.all([
    fetchProducts(),
    fetchBestSellers()
  ]);
  const arrivalCards = mapProductsToArrivals(products);
  const categories = mapProductsToCategories(products);
  const bestSellerItems = mapProductsToBestSellers(bestSellerProducts);
  const testimonials = mapProductsToTestimonials(products);

  return (
    <main id="top" className="bg-[#fcf9f4] pb-20 text-[#1c1c19] md:pb-0">
      <HeroVideoSlider />

      <section className="relative overflow-hidden bg-[#fcf9f4] py-4 md:py-4 pt-10">

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center px-4 text-center">
          <h2 className="mt-8 text-3xl md:text-3xl lg:text-[4.0rem] leading-[0.9] tracking-[-0.02em] text-[#111111] text-center">
            <span className="normal-case font-normal pr-2" style={{ fontFamily: 'var(--font-cursive), cursive', fontSize: '0.8em', verticalAlign: 'middle' }}>Every Day</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9c4049] to-[#5f5d3e] pr-2 normal-case font-normal" style={{ fontFamily: 'var(--font-cursive), cursive', fontSize: '0.8em', verticalAlign: 'middle', paddingLeft: '0.2em' }}>A Fashion Day</span>
          </h2>
        </div>
      </section>

      <ShopByCategory />

      <NewArrivalsCarousel cards={arrivalCards} />

      <LuxuryCategoryNavigation categories={categories} />

      <BestSellersCoverflow items={bestSellerItems} viewAllHref="/category/all" />

      <section
        id="customer-voices"
        className="bg-[#fcf9f4] px-5 pb-10 pt-4 md:px-16 md:pb-20 md:pt-6"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#9c4049]/75">
              Our Happy Customers
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em] text-[#111111] md:text-5xl">
              Loved across every edit
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#6d655d] md:text-base">
              Real feedback from shoppers moving between western tailoring,
              traditional occasion wear, and everyday wardrobe staples.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group block rounded-[1.6rem] border border-[#ece6df] bg-white p-5 shadow-[0_18px_40px_rgba(95,93,62,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] bg-[#f4efe8] p-1 flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.productTitle}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[#ffb000]">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <span key={starIndex} className="text-xs">
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#ef6f63]">
                        {item.tag}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-1 text-xs font-semibold uppercase tracking-wider text-[#9c4049]">
                      {item.productTitle}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#554f49] sm:text-sm">
                      "{item.quote}"
                    </p>

                    <div className="mt-3 border-t border-[#f4efe8] pt-2">
                      <p className="text-xs font-bold text-[#111111]">
                        {item.name}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-3">
            {trustPoints.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.25rem] border border-[#ece6df] bg-[#f8f4ee] px-5 py-4"
              >
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#111111]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6d655d]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  );
}
