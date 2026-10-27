import React, { Suspense } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductDetailInteractive } from "@/components/ProductDetailInteractive";
import { ProductReviewsAndFaqTabs } from "@/components/ProductReviewsAndFaqTabs";
import { RelatedProductCard } from "@/components/RelatedProductCard";
import { formatCoOrd, isSizeValue } from "@/lib/format-utils";
import {
  catalogProducts,
  slugifyProductName
} from "@/app/category/category-data";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const reviewCards = [
  {
    name: "Samantha B.",
    rating: 5,
    text:
      "The fit was exactly what I hoped for. Fabric feels premium and the finishing details make it look much more elevated in person.",
    date: "Posted on June 14, 2026"
  },
  {
    name: "Asha M.",
    rating: 4,
    text:
      "Loved the silhouette and color tone. Delivery was smooth and the styling works well with both western and occasion wardrobes.",
    date: "Posted on May 29, 2026"
  },
  {
    name: "Elena R.",
    rating: 5,
    text:
      "Beautiful piece. The drape and shape are flattering, and it photographs really well for events and evening looks.",
    date: "Posted on May 18, 2026"
  },
  {
    name: "Divya R.",
    rating: 4,
    text:
      "Good quality and very wearable. I would buy again from the same category because the finish and comfort both feel reliable.",
    date: "Posted on April 2, 2026"
  }
];

export function generateStaticParams() {
  return catalogProducts.map((product) => ({
    slug: product.slug
  }));
}

export default async function ProductDetailPage({
  params
}: ProductDetailPageProps) {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Start public product loading alongside the independent customer lookup.
  const productRequest = fetch(`${apiUrl}/api/products/${slug}`, {
    next: { revalidate: 60, tags: ["products", `product-${slug}`] }
  }).catch(() => null);

  let customerReferralCode = "";
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hey_womania_session");
    if (sessionToken) {
      const userRes = await fetch(`${apiUrl}/api/users/me`, {
        headers: { "Cookie": `hey_womania_session=${sessionToken.value}` },
        cache: "no-store"
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData?.referralCode) {
          customerReferralCode = userData.referralCode;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch user on product page:", err);
  }

  let product = null;
  try {
    const res = await productRequest;
    if (res?.ok) {
      const p = await res.json();
      const hasDiscount = p.salePrice && p.salePrice < p.price;
      const finalPrice = hasDiscount ? p.salePrice : p.price;
      const originalPrice = p.price;
      const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;
      
      const gallery = (p.images || [])
        .filter(Boolean)
        .map((img: string) => {
          if (img.startsWith('http')) return img;
          return `${apiUrl}${img}`;
        });

      const categoryParts = String(p.category || "")
        .split("/")
        .map((part: string) => part.trim())
        .filter(Boolean);

      const normalizedVariants = (p.variants || []).map((v: any) => {
        let sizeVal = (v.size || "").trim();
        let colorVal = (v.color || "").trim();

        // If color contains a known size (e.g. "XXXL", "XXL", "M") and size is empty or "Default"
        if (isSizeValue(colorVal) && (!sizeVal || ["DEFAULT", "ONE SIZE", "FREE SIZE"].includes(sizeVal.toUpperCase()))) {
          sizeVal = colorVal.toUpperCase();
          colorVal = "";
        } else if (isSizeValue(colorVal) && isSizeValue(sizeVal)) {
          // If both are sizes (e.g. size: "Default" or both set to sizes), color is not a real color
          colorVal = "";
        }

        return {
          ...v,
          size: sizeVal || "Default",
          color: colorVal || "Default",
          images: (v.images || [])
            .map((img: string) => {
              if (!img) return "";
              if (img.startsWith("http")) return img;
              return `${apiUrl}${img}`;
            })
            .filter(Boolean)
        };
      });

      product = {
        id: p.id,
        name: p.title,
        price: `₹${finalPrice}`,
        originalPrice: hasDiscount ? `₹${originalPrice}` : null,
        discountPercent: hasDiscount ? `${discountPercent}% OFF` : null,
        subtitle: p.description || "Newly added",
        fabric: p.fabric || null,
        image: gallery.length > 0 ? gallery[0] : "/products/product-placeholder.png",
        gallery: gallery,
        slug: p.slug,
        categorySlug: categoryParts[0]
          ? categoryParts[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
          : "all",
        categoryTitle: categoryParts[0]
          ? categoryParts[0]
              .split(/[-_\s]+/)
              .filter(Boolean)
              .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
              .join(" ")
          : "All",
        relatedCategory: categoryParts[1] || categoryParts[0] || "all",
        variants: normalizedVariants
      };
    }
  } catch (error) {
    console.error("Failed to fetch product:", error);
  }

  // Fallback to catalog if not found in DB
  if (!product) {
    product = catalogProducts.find((item) => item.slug === slug) as any;
  }

  if (!product) {
    notFound();
  }


  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-6 text-[#1c1c19] md:px-10 md:pt-8 lg:px-16 lg:pt-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[#8b837b]">
          <Link href="/">Home</Link>
          <span>&gt;</span>
          <Link href="/category">Category</Link>
          <span>&gt;</span>
          <Link href={`/category/${product.categorySlug}`}>{formatCoOrd(product.categoryTitle)}</Link>
          <span>&gt;</span>
          <span className="text-[#1c1c19]">{formatCoOrd(product.name)}</span>
        </div>

        <ProductDetailInteractive product={product as any} customerReferralCode={customerReferralCode} />

        {/* Rating & Reviews + FAQ (Full Width) */}
        <section className="mt-12 w-full">
          <ProductReviewsAndFaqTabs
            initialReviews={reviewCards}
            productName={product.name}
            description={product.subtitle || ""}
            category={product.categoryTitle || ""}
            fabric={(product as any).fabric || ""}
          />
        </section>

        {/* You Might Also Like Section (Full Width 4-column Grid) */}
        <section className="mt-12 w-full">
          <Suspense fallback={
            <div className="rounded-[1.8rem] border border-[#ece6df] bg-white p-5 md:p-8" aria-busy="true" aria-label="Loading recommendations">
              <h2 className="text-[1.35rem] font-black uppercase tracking-[-0.04em] text-[#111111]">You Might Also Like</h2>
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[0, 1, 2, 3].map(index => <div key={index} className="aspect-[3/4] rounded-[1.1rem] bg-[#f4efe8] motion-safe:animate-pulse" />)}
              </div>
            </div>
          }>
            <RelatedProducts product={product} apiUrl={apiUrl} />
          </Suspense>
        </section>
      </section>

      <StoreFooter />
    </main>
  );
}


async function RelatedProducts({ product, apiUrl }: {
  product: { slug: string; categoryTitle: string; categorySlug?: string; relatedCategory?: string };
  apiUrl: string;
}) {
  // Category-matched fallback from catalog
  const currentCatSlug = (product as any).categorySlug || "";
  const matchedCatalog = catalogProducts.filter(
    (item) =>
      item.slug !== product.slug &&
      (item.categorySlug === currentCatSlug ||
       item.categoryTitle?.toLowerCase() === product.categoryTitle?.toLowerCase())
  );
  let relatedProducts = (matchedCatalog.length >= 4 ? matchedCatalog : catalogProducts.filter(p => p.slug !== product.slug)).slice(0, 4);

  try {
    const relatedCategory = encodeURIComponent((product as any).relatedCategory || product.categoryTitle || "all");
    const res = await fetch(
      `${apiUrl}/api/products/related?category=${relatedCategory}&excludeSlug=${encodeURIComponent(product.slug)}&limit=4`,
      {
        next: { revalidate: 60, tags: ["products"] }
      }
    );
    if (res.ok) {
      const data = await res.json();
      const allLive = data.data ? data.data : Array.isArray(data) ? data : [];
      const liveRelated = allLive.map((p: any) => {
        const gallery = (p.images || [])
          .filter(Boolean)
          .map((img: string) => {
            if (img.startsWith("http")) return img;
            return `${apiUrl}${img}`;
          });
        const hasDiscount = p.salePrice && p.price && p.salePrice < p.price;
        return {
          name: p.title,
          slug: p.slug,
          price: `₹${p.salePrice || p.price}`,
          originalPrice: hasDiscount ? `₹${p.price}` : null,
          image: gallery.length > 0 ? gallery[0] : "/products/product-placeholder.png",
          gallery: gallery
        };
      });

      if (liveRelated.length > 0) {
        relatedProducts = liveRelated;
      }
    }
  } catch (err) {
    console.error("Failed to fetch related products:", err);
  }

  return (
    <div className="rounded-[1.8rem] border border-[#ece6df] bg-white p-5 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-8">
      <h2 className="text-[1.35rem] font-black uppercase tracking-[-0.04em] text-[#111111]">
        You Might Also Like
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {relatedProducts.map((item) => (
          <RelatedProductCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
