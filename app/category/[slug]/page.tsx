import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryDetailClient } from "@/components/CategoryDetailClient";
import { StoreFooter } from "@/components/StoreFooter";
import {
  categoryQuickLinks,
  type CategorySlug
} from "../category-data";

export const dynamic = "force-dynamic";

const categoryFilterColumns: Record<
  CategorySlug,
  Array<{ title: string; links: { label: string; href: string }[] }>
> = {
  all: [
    {
      title: "Traditional Wear",
      links: [
        { label: "Lehengas & Suits", href: "/category/traditional" },
        { label: "Kurtas, Tunics & Tops", href: "/category/traditional" },
        { label: "Sarees", href: "/category/traditional" },
        { label: "Dress Materials", href: "/category/traditional" }
      ]
    },
    {
      title: "Western Wear",
      links: [
        { label: "Dresses", href: "/category/western" },
        { label: "Tops", href: "/category/shirts" },
        { label: "Shirts", href: "/category/shirts" },
        { label: "Jeans", href: "/category/jeans" }
      ]
    },
    {
      title: "Accessories",
      links: [
        { label: "Jewellery", href: "/category/jewellery" },
        { label: "Bags", href: "/category/bags" },
        { label: "Plus Size", href: "/category/plus-size" },
        { label: "Sale Picks", href: "/category/sale" }
      ]
    }
  ],
  western: [
    {
      title: "Western Wear",
      links: [
        { label: "Dresses", href: "/category/western" },
        { label: "Tops", href: "/category/shirts" },
        { label: "Tshirts & Shirts", href: "/category/shirts" },
        { label: "Jeans", href: "/category/jeans" },
        { label: "Co-ords", href: "/category/western" },
        { label: "Shorts", href: "/category/western" },
        { label: "Outer Layers", href: "/category/western" }
      ]
    }
  ],
  traditional: [
    {
      title: "Traditional Wear",
      links: [
        { label: "Lehengas & Suits", href: "/category/traditional" },
        { label: "Kurtas, Tunics & Tops", href: "/category/traditional" },
        { label: "Sarees", href: "/category/traditional" },
        { label: "Ethnic Wear", href: "/category/traditional" },
        { label: "Dupattas & Shawls", href: "/category/traditional" }
      ]
    }
  ],
  formals: [
    {
      title: "Formals",
      links: [
        { label: "Work Dresses", href: "/category/formals" },
        { label: "Trousers & Capris", href: "/category/formals" },
        { label: "Waistcoats", href: "/category/formals" },
        { label: "Outer Layers", href: "/category/formals" }
      ]
    }
  ],
  jeans: [
    {
      title: "Jeans",
      links: [
        { label: "Straight Fit", href: "/category/jeans" },
        { label: "Relaxed Fit", href: "/category/jeans" },
        { label: "Dark Wash", href: "/category/jeans" },
        { label: "High Rise", href: "/category/jeans" }
      ]
    }
  ],
  shirts: [
    {
      title: "Shirts & Tops",
      links: [
        { label: "Shirts", href: "/category/shirts" },
        { label: "Tshirts", href: "/category/shirts" },
        { label: "Blouses", href: "/category/shirts" },
        { label: "Satin Shirts", href: "/category/shirts" }
      ]
    }
  ],
  jewellery: [
    {
      title: "Jewellery",
      links: [
        { label: "Necklaces", href: "/category/jewellery" },
        { label: "Earrings", href: "/category/jewellery" },
        { label: "Rings", href: "/category/jewellery" },
        { label: "Bangles", href: "/category/jewellery" }
      ]
    }
  ],
  bags: [
    {
      title: "Bags",
      links: [
        { label: "Mini Bags", href: "/category/bags" },
        { label: "Shoulder Bags", href: "/category/bags" },
        { label: "Evening Clutches", href: "/category/bags" },
        { label: "Daily Use", href: "/category/bags" }
      ]
    }
  ],
  "plus-size": [
    {
      title: "Plus Size",
      links: [
        { label: "Curve Dresses", href: "/category/plus-size" },
        { label: "Curve Tops", href: "/category/plus-size" },
        { label: "Curve Formals", href: "/category/plus-size" },
        { label: "Curve Occasion", href: "/category/plus-size" }
      ]
    }
  ],
  sale: [
    {
      title: "Sale",
      links: [
        { label: "Western Deals", href: "/category/sale" },
        { label: "Traditional Deals", href: "/category/sale" },
        { label: "Formal Deals", href: "/category/sale" },
        { label: "Accessory Deals", href: "/category/sale" }
      ]
    },
    {
      title: "Popular Reductions",
      links: [
        { label: "Party Looks", href: "/category/sale" },
        { label: "Workwear", href: "/category/sale" },
        { label: "Bags", href: "/category/sale" },
        { label: "Jewellery", href: "/category/sale" }
      ]
    }
  ]
};

const filterGroups = {
  sizes: ["S", "M", "L", "XL"]
};

type CategoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return categoryQuickLinks.map((item) => ({
    slug: item.slug
  }));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toTitleCase = (value: string) =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export default async function CategoryDetailPage({
  params
}: CategoryDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug as CategorySlug;

  let liveProducts: any[] = [];
  let liveCategories: any[] = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/api/admin/products`, {
        cache: "no-store"
      }),
      fetch(`${API_URL}/api/categories`, {
        cache: "no-store"
      })
    ]);

    if (productsRes.ok) {
      const data = await productsRes.json();
      liveProducts = data.data ? data.data : Array.isArray(data) ? data : [];
    }

    if (categoriesRes.ok) {
      const data = await categoriesRes.json();
      liveCategories = data.data ? data.data : Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error("Failed to fetch category data:", error);
  }

  const mappedLive = liveProducts
    .filter((p: any) => {
      const pSlug = slugify(p.category || "");
      return pSlug === slug || slug === "all";
    })
    .map((p: any) => {
      const hasDiscount = p.salePrice && p.salePrice < p.price;
      const finalPrice = hasDiscount ? p.salePrice : p.price;
      const originalPrice = p.price;

      const gallery = (p.images || []).map((img: string) => {
        if (img.startsWith("http")) return img;
        return `${API_URL}${img}`;
      });

      return {
        id: p.id,
        name: p.title,
        price: `₹${finalPrice}`,
        originalPrice: hasDiscount ? `₹${originalPrice}` : undefined,
        subtitle: p.description || "Newly added",
        image: gallery.length > 0 ? gallery[0] : "/products/product-placeholder.png",
        gallery,
        variants: p.variants || [],
        slug: p.slug
      };
    });

  const matchedCategory =
    slug === "all"
      ? null
      : liveCategories.find((category: any) => slugify(category.slug || category.name || "") === slug);

  if (mappedLive.length === 0 && slug !== "all") {
    notFound();
  }

  const category = {
    title: slug === "all" ? "All Products" : matchedCategory?.name || toTitleCase(slug),
    eyebrow: slug === "all" ? "SHOP THE FULL COLLECTION" : "SHOP BY CATEGORY",
    intro:
      slug === "all"
        ? "Browse the complete live catalog with the same category experience as before."
        : matchedCategory?.description || `Browse the live ${toTitleCase(slug)} collection.`,
    products: mappedLive
  };

  const activeQuickLink = categoryQuickLinks.find((item) => item.slug === slug);
  const activeCategoryColumns =
    categoryFilterColumns[slug] ?? categoryFilterColumns.all;

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-44 text-[#1c1c19] md:px-10 md:pt-40 lg:pt-44 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[#8b837b]">
          <Link href="/">Home</Link>
          <span>&gt;</span>
          <Link href="/category">Category</Link>
          <span>&gt;</span>
          <span className="text-[#1c1c19]">{category.title}</span>
        </div>

        <div className="flex flex-col gap-4 border-b border-[#ece6df] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.26em] text-[#9c4049]/70">
              {category.eyebrow}
            </p>
            <h1 className="mt-3 font-sans text-3xl font-black uppercase tracking-[-0.05em] text-[#111111] md:text-5xl">
              {category.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6d655d] md:text-base">
              {category.intro}
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar md:flex-wrap md:overflow-visible md:pb-0">
            {categoryQuickLinks.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className={`shrink-0 rounded-full px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
                  item.slug === slug
                    ? "bg-[#111111] text-white"
                    : "bg-[#f4efe8] text-[#6f5f56] hover:bg-[#e8e1d8]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <CategoryDetailClient
          slug={slug}
          category={category}
          quickLinks={categoryQuickLinks}
          activeQuickLink={activeQuickLink}
          activeCategoryColumns={activeCategoryColumns}
          sizes={filterGroups.sizes}
        />
      </section>

      <StoreFooter />
    </main>
  );
}
