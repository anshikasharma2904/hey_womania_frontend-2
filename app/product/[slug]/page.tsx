import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductOptionsClient } from "@/components/ProductOptionsClient";
import { ProductDetailInteractive } from "@/components/ProductDetailInteractive";
import { formatCoOrd } from "@/lib/format-utils";
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

  let product = null;
  try {
    const res = await fetch(`${apiUrl}/api/products/${slug}`, {
      cache: "no-store"
    });
    if (res.ok) {
      const p = await res.json();
      const hasDiscount = p.salePrice && p.salePrice < p.price;
      const finalPrice = hasDiscount ? p.salePrice : p.price;
      const originalPrice = p.price;
      const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;
      
      const gallery = (p.images || []).map((img: string) => {
        if (img.startsWith('http')) return img;
        return `${apiUrl}${img}`;
      });

      const categoryParts = String(p.category || "")
        .split("/")
        .map((part: string) => part.trim())
        .filter(Boolean);

      const normalizedVariants = (p.variants || []).map((v: any) => ({
        ...v,
        images: (v.images || [])
          .map((img: string) => {
            if (!img) return "";
            if (img.startsWith("http")) return img;
            return `${apiUrl}${img}`;
          })
          .filter(Boolean)
      }));

      product = {
        id: p.id,
        name: p.title,
        price: `₹${finalPrice}`,
        originalPrice: hasDiscount ? `₹${originalPrice}` : null,
        discountPercent: hasDiscount ? `${discountPercent}% OFF` : null,
        subtitle: p.description || "Newly added",
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

  // Related products
  let relatedProducts = catalogProducts.slice(0, 4);
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
        const gallery = (p.images || []).map((img: string) => {
          if (img.startsWith("http")) return img;
          return `${apiUrl}${img}`;
        });
        return {
          name: p.title,
          slug: p.slug,
          price: `₹${p.salePrice || p.price}`,
          image: gallery.length > 0 ? gallery[0] : "/products/product-placeholder.png"
        };
      });

      if (liveRelated.length > 0) {
        relatedProducts = liveRelated;
      }
    }
  } catch (err) {
    console.error("Failed to fetch related products:", err);
  }

  if (!relatedProducts.length) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/products`, {
      cache: 'no-store'
    });
      if (res.ok) {
        const data = await res.json();
        const allLive = data.data ? data.data : Array.isArray(data) ? data : [];
        const fallbackRelated = allLive
          .filter((p: any) => p.slug !== product.slug)
          .slice(0, 4)
          .map((p: any) => {
            const gallery = (p.images || []).map((img: string) => {
              if (img.startsWith("http")) return img;
              return `${apiUrl}${img}`;
            });
            return {
              name: p.title,
              slug: p.slug,
              price: `₹${p.salePrice || p.price}`,
              image: gallery.length > 0 ? gallery[0] : "/products/product-placeholder.png"
            };
          });

        if (fallbackRelated.length > 0) {
          relatedProducts = fallbackRelated;
        }
      }
    } catch (err) {
      console.error("Failed to fetch fallback related products:", err);
    }
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

        <ProductDetailInteractive product={product as any} />

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="rounded-[1.8rem] border border-[#ece6df] bg-white p-5 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece6df] pb-4">
              <div className="flex flex-wrap gap-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#6d655d]">
                <button className="border-b-2 border-[#111111] pb-2 text-[#111111]">
                  Product Details
                </button>
                <button className="pb-2">Rating & Reviews</button>
                <button className="pb-2">FAQ</button>
              </div>
              <div className="rounded-full bg-[#f4efe8] px-4 py-2 text-xs font-semibold text-[#111111]">
                146 Reviews
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {reviewCards.map((review) => (
                <article
                  key={review.name}
                  className="rounded-[1.2rem] border border-[#ece6df] bg-[#fcfaf7] p-4"
                >
                  <div className="flex items-center gap-1 text-[#ffb000]">
                    {Array.from({ length: review.rating }).map((_, starIndex) => (
                      <span key={starIndex} className="text-xs">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#111111]">
                    {review.name}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#6d655d]">
                    {review.text}
                  </p>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#9b938b]">
                    {review.date}
                  </p>
                </article>
              ))}
            </div>

            <button className="mx-auto mt-6 block rounded-full border border-[#ddd5cc] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
              Load More Reviews
            </button>
          </div>

          <div className="rounded-[1.8rem] border border-[#ece6df] bg-white p-5 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-6">
            <h2 className="text-[1.35rem] font-black uppercase tracking-[-0.04em] text-[#111111]">
              You Might Also Like
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug || slugifyProductName(item.name)}`}
                  className="group rounded-[1.35rem] border border-[#f0e7de] bg-[#fffdfa] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#e1d1c6] hover:shadow-[0_18px_34px_rgba(95,93,62,0.08)]"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.1rem] bg-[#f4efe8] flex items-center justify-center p-1">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={260}
                      height={340}
                      className="h-full w-full object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="line-clamp-2 min-h-[2.8rem] text-[0.92rem] font-semibold leading-[1.35rem] text-[#111111]">
                      {item.name}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[1rem] font-bold text-[#111111]">
                      {item.price}
                      </span>
                      <span className="text-[0.75rem] text-[#a7a09a] line-through">
                        ₹242
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>

      <StoreFooter />
    </main>
  );
}
