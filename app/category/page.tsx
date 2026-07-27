import Image from "next/image";
import Link from "next/link";
import { StoreFooter } from "@/components/StoreFooter";
import { categoryQuickLinks } from "@/app/category/category-data";
import { BAG_ASSETS, JEWELLERY_ASSETS, MODEL_ASSETS, PRODUCT_ASSETS } from "@/lib/fashion-assets";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const LOCAL_ASSET_PREFIXES = ["/models/", "/products/", "/jewellery/", "/bags/"];

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
  if (LOCAL_ASSET_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return value;
  }
  return `${API_URL}${value}`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatCategoryLabel = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getCategoryPathParts = (value: string) =>
  value
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

const getDisplayCategoryTitle = (value: string) => {
  const parts = getCategoryPathParts(value);
  if (parts.length === 0) return formatCategoryLabel(value);

  return formatCategoryLabel(parts[parts.length - 1] || parts[0]);
};

const getDisplayCategorySummary = (value: string) => {
  const parts = getCategoryPathParts(value);
  if (parts.length <= 1) {
    return "";
  }

  return parts
    .slice(0, -1)
    .map((part) => formatCategoryLabel(part))
    .join(" / ");
};

const getCategoryPreviewImage = (value?: string, fallback?: string) => {
  if (value) {
    return toImageUrl(value);
  }

  return fallback || "/products/product-placeholder.png";
};

const getCategoryAssetFallback = (title: string, summary?: string) => {
  const lookup = `${title} ${summary || ""}`.toLowerCase();

  if (lookup.includes("western")) return MODEL_ASSETS.western;
  if (lookup.includes("traditional") || lookup.includes("kurta")) return MODEL_ASSETS.traditional;
  if (lookup.includes("formal")) return MODEL_ASSETS.formal;
  if (lookup.includes("jewellery") || lookup.includes("necklace")) {
    return JEWELLERY_ASSETS.templeGoldNecklace;
  }
  if (lookup.includes("bag")) return BAG_ASSETS.structuredOccasionClutch;
  if (lookup.includes("sale")) return PRODUCT_ASSETS.western1;

  return MODEL_ASSETS.editorial;
};

const categoryIconBySlug: Record<string, string> = {
  all: "apps",
  western: "checkroom",
  traditional: "auto_awesome",
  formals: "business_center",
  shirts: "dry_cleaning",
  jeans: "styler",
  jewellery: "diamond",
  bags: "shopping_bag",
  "plus-size": "accessibility_new",
  sale: "local_offer"
};

const directionCopy: Record<
  string,
  {
    match: string;
    title: string;
    eyebrow: string;
    description: string;
    image: string;
  }
> = {
  western: {
    match: "Western Wear",
    title: "Western Wear",
    eyebrow: "Featured Floor",
    description: "City tailoring and fluid silhouettes",
    image: MODEL_ASSETS.western
  },
  traditional: {
    match: "Traditional Wear",
    title: "Traditional Wear",
    eyebrow: "Featured Floor",
    description: "Ceremony color, festive texture",
    image: MODEL_ASSETS.traditional
  },
  formals: {
    match: "Formals",
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

  const findLiveCategory = (match: string) => {
    const normalizedMatch = match.trim().toLowerCase();

    return categoriesWithProducts.find((category) => {
      const parts = getCategoryPathParts(category.name);
      const labels = [
        category.name,
        category.slug,
        ...parts,
        ...parts.map((part) => formatCategoryLabel(part))
      ]
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase());

      return labels.includes(normalizedMatch);
    });
  };

  const groupedCategoryFamilies = Array.from(
    categoriesWithProducts.reduce((map, category) => {
      const parts = getCategoryPathParts(category.name);
      const main = formatCategoryLabel(parts[0] || category.name);
      const child = formatCategoryLabel(parts[1] || parts[parts.length - 1] || category.name);

      if (!map.has(main)) {
        map.set(main, new Set<string>());
      }

      if (child && child !== main) {
        map.get(main)!.add(child);
      }

      return map;
    }, new Map<string, Set<string>>())
  )
    .map(([title, items]) => ({
      title,
      items: Array.from(items).sort((a, b) => a.localeCompare(b))
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

const shortcutCategories = [
  {
    slug: "all",
    href: "/category/all",
    title: "All",
    image: MODEL_ASSETS.editorial
  },
  ...categoriesWithProducts.map((category) => ({
    slug: category.slug,
    href: `/category/${category.slug}`,
    title: getDisplayCategoryTitle(category.name),
    summary: getDisplayCategorySummary(category.name),
    image: getCategoryPreviewImage(
      category.image,
      category.products[0]?.images?.[0] ||
          getCategoryAssetFallback(
            getDisplayCategoryTitle(category.name),
            getDisplayCategorySummary(category.name)
          )
      )
    }))
  ];

  const directionCards = (Object.entries(directionCopy) as Array<
    [string, (typeof directionCopy)[keyof typeof directionCopy]]
  >).map(([slug, fallback]) => {
    const liveCategory = findLiveCategory(fallback.match) || categoryMap.get(slug);
    return {
      slug: liveCategory?.slug || slug,
      href: `/category/${liveCategory?.slug || slug}`,
      title: liveCategory ? getDisplayCategoryTitle(liveCategory.name) : fallback.title,
      eyebrow: fallback.eyebrow,
      description: fallback.description,
      image: toImageUrl(liveCategory?.image || liveCategory?.products[0]?.images?.[0] || fallback.image)
    };
  });

  const spotlightCards = spotlightDefaults.map((item) => {
    const liveCategory = findLiveCategory(item.title) || categoryMap.get(item.slug);
    return {
      ...item,
      href: `/category/${liveCategory?.slug || item.slug}`,
      title: liveCategory ? getDisplayCategoryTitle(liveCategory.name) : item.title,
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
          <h1 className="mt-6 max-w-[15ch] font-[family:var(--font-display)] text-[2.5rem] leading-[0.94] tracking-[-0.06em] text-[#7b5648] md:text-[3.8rem] xl:text-[5rem]">
            Build your wardrobe by mood, silhouette, and occasion.
          </h1>
          <p className="mt-5 max-w-3xl text-[0.96rem] leading-7 text-[#7c6b61] md:text-[1rem]">
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
              <h2 className="mt-4 font-[family:var(--font-display)] text-[2.15rem] leading-[0.95] tracking-[-0.05em] text-[#7b5648] md:text-[3.15rem]">
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

          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {shortcutCategories.map((category) => {
              const isSale = category.slug === "sale";
              return (
                <Link
                  key={category.slug}
                  href={category.href}
                  className="group flex flex-col rounded-[1.8rem] border border-[#f0e5d9] bg-white/88 p-4 text-center shadow-[0_18px_36px_rgba(121,91,66,0.06)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`relative flex h-[132px] w-full items-center justify-center overflow-hidden rounded-[1.45rem] border shadow-[0_16px_34px_rgba(121,91,66,0.08)] ${
                      isSale
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#f0e5d9] bg-[#faf4ed] text-[#b08d7b]"
                    }`}
                  >
                    {"image" in category && category.image ? (
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 180px"
                        className={`transition-transform duration-500 group-hover:scale-[1.05] ${
                          isSale ? "object-cover opacity-80" : "object-cover object-top"
                        }`}
                      />
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(34,26,21,0.12)_100%)]" />
                  </div>
                  <div className="mt-4 space-y-1 px-1">
                    <p className="text-[0.98rem] font-medium leading-8 text-[#77675d]">{category.title}</p>
                    {"summary" in category && category.summary ? (
                      <p className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-[#b89d90]">
                        {category.summary}
                      </p>
                    ) : null}
                  </div>
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
              <h2 className="mt-4 font-[family:var(--font-display)] text-[2.4rem] leading-[0.95] tracking-[-0.06em] text-[#7b5648] md:text-[3.8rem]">
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
                href={card.href}
                className="group rounded-[2.2rem] border border-[#f3e8dd] bg-[#f8efe6] p-4 shadow-[0_22px_56px_rgba(121,91,66,0.08)]"
              >
                <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-[1.8rem] bg-[#fdf8f2] md:h-[400px]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="px-3 pb-3 pt-6">
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.34em] text-[#cb6e67]">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-3 font-[family:var(--font-display)] text-[2rem] leading-none tracking-[-0.04em] text-[#7b5648] md:text-[2.45rem]">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[#7c6b61]">{card.description}</p>
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
            <h2 className="mt-6 max-w-[12ch] font-[family:var(--font-display)] text-[2.4rem] leading-[0.95] tracking-[-0.05em] md:text-[3.9rem]">
              One category page that leads into every buying path.
            </h2>
            <p className="mt-5 max-w-4xl text-base leading-8 text-white/88">
              Use this page like a fashion navigation hub: enter from imagery, jump by
              category shortcut, or move directly into sale and accessories.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {groupedCategoryFamilies.slice(0, 2).map((group) => (
                <div
                  key={group.title}
                  className="rounded-[2rem] border border-white/16 bg-white/8 p-8 backdrop-blur-sm"
                >
                  <h3 className="font-[family:var(--font-display)] text-[2.2rem] leading-none">
                    {group.title}
                  </h3>
                  <div className="mt-8 space-y-5 text-[1.05rem] font-medium uppercase tracking-[0.28em] text-white/90">
                    {group.items.length > 0 ? (
                      group.items.map((item) => <p key={item}>{item}</p>)
                    ) : (
                      <p>{group.title}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {spotlightCards.map((card) => (
              <Link
                key={card.slug}
                href={card.href}
                className="rounded-[2.2rem] border border-[#f3e8dd] bg-[#fffaf4] p-5 shadow-[0_22px_56px_rgba(121,91,66,0.08)]"
              >
                <div className="relative h-[240px] overflow-hidden rounded-[1.8rem] bg-[#fdf8f2]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    className="object-cover object-top"
                  />
                </div>
                <p className="mt-6 text-[0.82rem] font-semibold uppercase tracking-[0.34em] text-[#cb6e67]">
                  {card.eyebrow}
                </p>
                <h3 className="mt-3 font-[family:var(--font-display)] text-[1.9rem] leading-none tracking-[-0.04em] text-[#7b5648]">
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
