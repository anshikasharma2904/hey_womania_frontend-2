import Image from "next/image";
import Link from "next/link";
import { StoreFooter } from "@/components/StoreFooter";
import { categoryQuickLinks } from "@/app/category/category-data";
import { BAG_ASSETS, JEWELLERY_ASSETS, MODEL_ASSETS, PRODUCT_ASSETS } from "@/lib/fashion-assets";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type LiveCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productsCount?: number;
};

type LiveProduct = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  price: number;
  salePrice: number;
  category: string;
};

const toImageUrl = (value?: string) => {
  if (!value) return "/products/product-placeholder.png";
  if (value.startsWith("http")) return value;
  return `${API_URL}${value}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fallbackCategoryMedia: Record<string, string> = {
  all: MODEL_ASSETS.formal,
  western: MODEL_ASSETS.western,
  traditional: MODEL_ASSETS.traditional,
  formals: MODEL_ASSETS.formal,
  shirts: MODEL_ASSETS.minimal,
  jeans: MODEL_ASSETS.editorial,
  jewellery: JEWELLERY_ASSETS.templeGoldNecklace,
  bags: BAG_ASSETS.structuredOccasionClutch,
  "plus-size": MODEL_ASSETS.couture,
  sale: PRODUCT_ASSETS.western1
};

const directionCopy: Record<
  string,
  {
    title: string;
    eyebrow: string;
    description: string;
    image: string;
  }
> = {
  western: {
    title: "Western Wear",
    eyebrow: "Featured Floor",
    description: "City tailoring and fluid silhouettes",
    image: MODEL_ASSETS.western
  },
  traditional: {
    title: "Traditional Wear",
    eyebrow: "Featured Floor",
    description: "Ceremony color, festive texture",
    image: MODEL_ASSETS.traditional
  },
  formals: {
    title: "Formals",
    eyebrow: "Featured Floor",
    description: "Sharp evening dressing and quiet work polish",
    image: MODEL_ASSETS.formal
  }
};

const spotlightDefaults = [
  {
    slug: "jewellery",
    eyebrow: "Heirloom Shine",
    title: "Jewellery",
    image: JEWELLERY_ASSETS.templeGoldNecklace
  },
  {
    slug: "bags",
    eyebrow: "Everyday Carry",
    title: "Bags",
    image: BAG_ASSETS.structuredOccasionClutch
  },
  {
    slug: "traditional",
    eyebrow: "Occasion Floor",
    title: "Traditional",
    image: PRODUCT_ASSETS.traditional2
  },
  {
    slug: "sale",
    eyebrow: "Season Offers",
    title: "Sale",
    image: PRODUCT_ASSETS.western1
  }
];

async function getCategories(): Promise<LiveCategory[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: "no-store" });
    const result = await res.json().catch(() => ({}));
    return result.data ? result.data : Array.isArray(result) ? result : [];
  } catch (err) {
    console.error("Error fetching categories", err);
    return [];
  }
}

async function getProducts(): Promise<LiveProduct[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=100`, { cache: "no-store" });
    const result = await res.json().catch(() => ({}));
    return result.data ? result.data : Array.isArray(result) ? result : [];
  } catch (err) {
    console.error("Error fetching products", err);
    return [];
  }
}

export default async function CategoryPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const productCategoryMap = new Map<
    string,
    {
      id: string;
      name: string;
      slug: string;
      description?: string;
      image?: string;
      productsCount: number;
      products: LiveProduct[];
    }
  >();

  products.forEach((product) => {
    const rawCategory = product.category?.trim();
    if (!rawCategory) return;

    const slug = slugify(rawCategory);
    const existing = productCategoryMap.get(slug);

    if (existing) {
      existing.products.push(product);
      existing.productsCount += 1;
      if (!existing.image && product.images?.[0]) {
        existing.image = product.images[0];
      }
      return;
    }

    productCategoryMap.set(slug, {
      id: slug,
      name: rawCategory,
      slug,
      productsCount: 1,
      image: product.images?.[0],
      products: [product]
    });
  });

  const categoriesWithProducts = Array.from(productCategoryMap.values())
    .map((productCategory) => {
      const matchedCategory = categories.find(
        (category) => (category.slug || slugify(category.name)) === productCategory.slug
      );

      return {
        id: matchedCategory?.id || productCategory.id,
        name: matchedCategory?.name || productCategory.name,
        slug: matchedCategory?.slug || productCategory.slug,
        description: matchedCategory?.description,
        image: matchedCategory?.image || productCategory.image,
        productsCount: productCategory.productsCount,
        products: productCategory.products
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const categoryMap = new Map(categoriesWithProducts.map((category) => [category.slug, category]));

  const shortcutCategories = categoryQuickLinks.map((link) => {
    const liveCategory = categoryMap.get(link.slug);
    return {
      ...link,
      title: liveCategory?.name || link.label,
      count: liveCategory?.productsCount || (link.slug === "all" ? products.length : 0)
    };
  });

  const directionCards = ["western", "traditional", "formals"].map((slug) => {
    const liveCategory = categoryMap.get(slug);
    const fallback = directionCopy[slug];
    return {
      slug,
      title: liveCategory?.name || fallback.title,
      eyebrow: fallback.eyebrow,
      description: fallback.description,
      image: toImageUrl(liveCategory?.image || liveCategory?.products[0]?.images?.[0] || fallback.image)
    };
  });

  const spotlightCards = spotlightDefaults.map((item) => {
    const liveCategory = categoryMap.get(item.slug);
    return {
      ...item,
      title: liveCategory?.name || item.title,
      image: toImageUrl(liveCategory?.image || liveCategory?.products[0]?.images?.[0] || item.image)
    };
  });

  return (
    <main className="min-h-screen bg-[#f7f0e7] px-4 pb-12 pt-40 text-[#1c1c19] md:px-10 md:pt-44 lg:px-16">
      <section className="mx-auto max-w-[1840px]">
        <section className="rounded-[2.2rem] bg-[radial-gradient(circle_at_top,#fff9f2_0%,#fbf3ea_48%,#f7efe6_100%)] px-6 py-10 shadow-[0_30px_80px_rgba(121,91,66,0.09)] md:px-10 md:py-16 lg:px-16">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.42em] text-[#bf9685]">
            Hey Womania Categories
          </p>
          <h1 className="mt-8 max-w-[14ch] font-[family:var(--font-display)] text-[3.3rem] leading-[0.9] tracking-[-0.08em] text-[#7b5648] md:text-[5.2rem] xl:text-[7.4rem]">
            Build your wardrobe by mood, silhouette, and occasion.
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-[#7c6b61] md:text-[1.05rem]">
            Browse a cleaner fashion storefront: western, traditional, formals, shirts,
            jeans, jewellery, bags, plus-size dressing, and a live sale floor.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/category/all"
              className="inline-flex rounded-full bg-[#6f6a42] px-8 py-4 text-[0.86rem] font-semibold uppercase tracking-[0.28em] text-white shadow-[0_18px_44px_rgba(111,106,66,0.28)]"
            >
              Shop All Categories
            </Link>
            <Link
              href="/category/sale"
              className="inline-flex rounded-full border border-[#ddcdbf] bg-white/70 px-8 py-4 text-[0.86rem] font-semibold uppercase tracking-[0.28em] text-[#9b7968]"
            >
              View Sale
            </Link>
          </div>
        </section>

        <section className="mt-10 rounded-[2.5rem] bg-[linear-gradient(180deg,#fffdf9_0%,#fbf5ee_100%)] px-6 py-8 shadow-[0_26px_70px_rgba(121,91,66,0.08)] md:px-10 md:py-12 lg:px-14">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-[0.76rem] font-semibold uppercase tracking-[0.38em] text-[#bf9685]">
                Shop By Category
              </p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-[2.7rem] leading-[0.92] tracking-[-0.06em] text-[#7b5648] md:text-[4.2rem]">
                Start with the essentials
              </h2>
            </div>
            <Link
              href="/category/all"
              className="inline-flex rounded-full border border-[#ddd0c3] bg-white px-7 py-3 text-[0.84rem] font-semibold uppercase tracking-[0.24em] text-[#111111]"
            >
              View All
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
            {shortcutCategories.map((category) => {
              const isSale = category.slug === "sale";
              return (
                <Link
                  key={category.slug}
                  href={category.href}
                  className="group flex flex-col items-center text-center"
                >
                  <div
                    className={`flex h-[118px] w-[118px] items-center justify-center rounded-full border shadow-[0_16px_34px_rgba(121,91,66,0.08)] transition-transform duration-300 group-hover:-translate-y-1 ${
                      isSale
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#f0e5d9] bg-[#faf4ed] text-[#b08d7b]"
                    }`}
                  >
                    <div
                      className={`flex h-[90px] w-[90px] items-center justify-center rounded-full border ${
                        isSale
                          ? "border-[#2a2a2a] bg-[#111111]"
                          : "border-[#f0e7de] bg-[#f3ece4]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[2rem]">
                        {category.icon}
                      </span>
                    </div>
                  </div>
                  <p className="mt-5 text-[1.05rem] font-medium text-[#77675d]">{category.title}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[0.76rem] font-semibold uppercase tracking-[0.38em] text-[#bf9685]">
                Wardrobe Edits
              </p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-[3rem] leading-[0.92] tracking-[-0.07em] text-[#7b5648] md:text-[5.5rem]">
                The three strongest directions
              </h2>
            </div>
            <Link
              href="/category/all"
              className="inline-flex rounded-full border border-[#ddcdbf] bg-white/80 px-8 py-4 text-[0.84rem] font-semibold uppercase tracking-[0.24em] text-[#9b7968]"
            >
              Browse All Looks
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {directionCards.map((card) => (
              <Link
                key={card.slug}
                href={`/category/${card.slug}`}
                className="group rounded-[2.2rem] border border-[#f3e8dd] bg-[#f8efe6] p-4 shadow-[0_22px_56px_rgba(121,91,66,0.08)]"
              >
                <div className="relative flex h-[360px] items-center justify-center overflow-hidden rounded-[1.8rem] bg-[#fdf8f2] md:h-[470px]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="px-3 pb-3 pt-6">
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.34em] text-[#cb6e67]">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-3 font-[family:var(--font-display)] text-[2.45rem] leading-none tracking-[-0.05em] text-[#7b5648] md:text-[3rem]">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-lg leading-8 text-[#7c6b61]">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-8 xl:grid-cols-[1.12fr_1fr]">
          <div className="overflow-hidden rounded-[3rem] bg-[linear-gradient(135deg,#7f6253_0%,#6f6a42_100%)] px-6 py-8 text-white shadow-[0_28px_80px_rgba(86,69,50,0.2)] md:px-10 md:py-12">
            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.38em] text-white/72">
              Store Highlight
            </p>
            <h2 className="mt-6 max-w-[12ch] font-[family:var(--font-display)] text-[3rem] leading-[0.92] tracking-[-0.07em] md:text-[5.3rem]">
              One category page that leads into every buying path.
            </h2>
            <p className="mt-5 max-w-4xl text-lg leading-9 text-white/88">
              Use this page like a fashion navigation hub: enter from imagery, jump by
              category shortcut, or move directly into sale and accessories.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/16 bg-white/8 p-8 backdrop-blur-sm">
                <h3 className="font-[family:var(--font-display)] text-[2.2rem] leading-none">Clothes</h3>
                <div className="mt-8 space-y-5 text-[1.05rem] font-medium uppercase tracking-[0.28em] text-white/90">
                  <p>Western Wear</p>
                  <p>Traditional Wear</p>
                  <p>Formals</p>
                  <p>Shirts</p>
                  <p>Jeans</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/16 bg-white/8 p-8 backdrop-blur-sm">
                <h3 className="font-[family:var(--font-display)] text-[2.2rem] leading-none">Accessories</h3>
                <div className="mt-8 space-y-5 text-[1.05rem] font-medium uppercase tracking-[0.28em] text-white/90">
                  <p>Jewellery</p>
                  <p>Bags</p>
                  <p>Plus Size</p>
                  <p>Sale</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {spotlightCards.map((card) => (
              <Link
                key={card.slug}
                href={`/category/${card.slug}`}
                className="rounded-[2.2rem] border border-[#f3e8dd] bg-[#fffaf4] p-5 shadow-[0_22px_56px_rgba(121,91,66,0.08)]"
              >
                <div className="relative h-[270px] overflow-hidden rounded-[1.8rem] bg-[#fdf8f2]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    className="object-contain p-7"
                  />
                </div>
                <p className="mt-6 text-[0.82rem] font-semibold uppercase tracking-[0.34em] text-[#cb6e67]">
                  {card.eyebrow}
                </p>
                <h3 className="mt-3 font-[family:var(--font-display)] text-[2.25rem] leading-none tracking-[-0.05em] text-[#7b5648]">
                  {card.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <StoreFooter />
    </main>
  );
}
