import { notFound } from "next/navigation";
import { CategoryDetailClient } from "@/components/CategoryDetailClient";
import { StoreFooter } from "@/components/StoreFooter";
import {
  categoryQuickLinks
} from "../category-data";

export const dynamic = "force-dynamic";

const categoryFilterColumns: Record<
  string,
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
  searchParams?: Promise<{
    search?: string;
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

const toTitleCase = (value: string) =>
  value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const getDisplayTitleFromCategoryPath = (value: string) => {
  const parts = getCategoryPathParts(value);
  if (parts.length === 0) return "";

  return formatCategoryLabel(parts[parts.length - 1] || parts[0]);
};

export default async function CategoryDetailPage({
  params,
  searchParams
}: CategoryDetailPageProps) {
  const { slug: rawSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const slug = rawSlug;
  const searchQuery = String(resolvedSearchParams?.search || "").trim();
  const normalizedSearchQuery = searchQuery.toLowerCase();

  let liveProducts: any[] = [];
  let liveCategories: any[] = [];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_URL}/api/admin/products`, {
        cache: "no-store"
      }),
      fetch(`${API_URL}/api/categories?limit=500`, {
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
      const categoryPath = String(p.category || "");
      const categoryParts = categoryPath
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean);
      const fullSlug = slugify(categoryPath);
      const mainSlug = slugify(categoryParts[0] || "");

      return slug === "all" || fullSlug === slug || mainSlug === slug;
    })
    .map((p: any) => {
      const categoryPath = String(p.category || "");
      const categoryParts = categoryPath
        .split("/")
        .map((part) => part.trim())
        .filter(Boolean);
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
        categoryLabel: formatCategoryLabel(categoryParts[1] || categoryParts[0] || "Collection"),
        subcategoryLabel: categoryParts[2] ? formatCategoryLabel(categoryParts[2]) : undefined,
        image: gallery.length > 0 ? gallery[0] : "/products/product-placeholder.png",
        gallery,
        variants: p.variants || [],
        sizes: Array.isArray(p.variants)
          ? p.variants
              .map((variant: any) => String(variant?.size || "").trim())
              .filter(Boolean)
          : [],
        slug: p.slug
      };
    })
    .filter((product: any) => {
      if (!normalizedSearchQuery) {
        return true;
      }

      const searchableText = [
        product.name,
        product.subtitle,
        product.categoryLabel,
        product.subcategoryLabel
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearchQuery);
    });

  const matchedCategory =
    slug === "all"
      ? null
      : liveCategories.find((category: any) => slugify(category.slug || category.name || "") === slug);

  const matchingMainCategoryName =
    slug === "all"
      ? null
      : liveCategories
          .map((category: any) => String(category.name || ""))
          .find((name) => slugify(name.split("/")[0] || "") === slug);

  const filterMainCategory =
    matchingMainCategoryName?.split("/")[0] ||
    matchedCategory?.name?.split("/")[0] ||
    null;

  const isMainCategoryRoute =
    slug !== "all" &&
    !!filterMainCategory &&
    slug === slugify(filterMainCategory);

  const dynamicCategoryColumns = (() => {
    const groups = new Map<string, { label: string; href: string }[]>();

    for (const category of liveCategories) {
      const rawName = String(category.name || "");
      const parts = getCategoryPathParts(rawName);
      if (parts.length === 0) continue;

      const [mainRaw, secondRaw, thirdRaw] = parts;
      const mainSlug = slugify(mainRaw || "");
      const fullSlug = slugify(category.slug || rawName);

      if (slug !== "all") {
        if (filterMainCategory && slugify(filterMainCategory) !== mainSlug && slug !== fullSlug) {
          continue;
        }
      }

      const title = formatCategoryLabel(secondRaw || mainRaw);
      if (!groups.has(title)) {
        groups.set(title, []);
      }

      if (thirdRaw) {
        const links = groups.get(title)!;
        const label = formatCategoryLabel(thirdRaw);
        const href = `/category/${category.slug || slugify(rawName)}`;
        if (!links.some((item) => item.label === label && item.href === href)) {
          links.push({ label, href });
        }
      }
    }

    if (slug === "all" && groups.size === 0) {
      for (const category of liveCategories) {
        const rawName = String(category.name || "");
        const href = `/category/${category.slug || slugify(rawName)}`;
        const title = formatCategoryLabel(getCategoryPathParts(rawName)[0] || rawName);
        if (!groups.has(title)) {
          groups.set(title, []);
        }
        const links = groups.get(title)!;
        if (!links.some((item) => item.label === title && item.href === href)) {
          links.push({ label: title, href });
        }
      }
    }

    return Array.from(groups.entries()).map(([title, links]) => ({
      title,
      links: links.sort((a, b) => a.label.localeCompare(b.label))
    }));
  })();

  if (mappedLive.length === 0 && slug !== "all") {
    notFound();
  }

  const category = {
    title:
      searchQuery
        ? `Search Results for "${searchQuery}"`
        : slug === "all"
        ? "All Products"
        : isMainCategoryRoute
          ? formatCategoryLabel(filterMainCategory || slug)
          : getDisplayTitleFromCategoryPath(matchedCategory?.name || matchingMainCategoryName || "") ||
          toTitleCase(slug),
    eyebrow:
      searchQuery
        ? "SEARCH RESULTS"
        : slug === "all"
        ? "SHOP THE FULL COLLECTION"
        : isMainCategoryRoute
          ? "SHOP THE MAIN CATEGORY"
          : "SHOP BY CATEGORY",
    intro:
      searchQuery
        ? `Showing live products matching "${searchQuery}".`
        : slug === "all"
        ? "Browse the complete live catalog with the same category experience as before."
        : matchedCategory?.description || "",
    products: mappedLive
  };

  const liveQuickLinks = [
    {
      slug: "all",
      label: "All",
      href: "/category/all",
      icon: "apps"
    },
    ...liveCategories.map((category: any) => ({
      slug: slugify(category.slug || category.name || ""),
      label: category.name,
      href: `/category/${slugify(category.slug || category.name || "")}`,
      icon: "category"
    }))
  ];

  const activeCategoryColumns =
    dynamicCategoryColumns.length > 0
      ? dynamicCategoryColumns
      : categoryFilterColumns[slug] ?? categoryFilterColumns.all;

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-52 text-[#1c1c19] md:px-10 md:pt-40 lg:pt-44 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <CategoryDetailClient
          slug={slug}
          category={category}
          quickLinks={liveQuickLinks}
          activeCategoryColumns={activeCategoryColumns}
          sizes={filterGroups.sizes}
        />
      </section>

      <StoreFooter />
    </main>
  );
}
