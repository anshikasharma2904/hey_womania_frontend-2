import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { StoreFooter } from "@/components/StoreFooter";
import { ProductOptionsClient } from "@/components/ProductOptionsClient";
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

  let product = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${slug}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const p = await res.json();
      const hasDiscount = p.salePrice && p.salePrice < p.price;
      const finalPrice = hasDiscount ? p.salePrice : p.price;
      const originalPrice = p.price;
      const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const gallery = (p.images || []).map((img: string) => {
        if (img.startsWith('http')) return img;
        return `${apiUrl}${img}`;
      });

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
        categorySlug: p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : "all",
        categoryTitle: p.category ? (p.category.charAt(0).toUpperCase() + p.category.slice(1)) : "All",
        variants: p.variants || []
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/products`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      const allLive = data.data ? data.data : Array.isArray(data) ? data : [];
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const liveRelated = allLive
        .filter((p: any) => p.category?.toLowerCase() === product.categorySlug && p.slug !== product.slug)
        .slice(0, 4)
        .map((p: any) => {
          const gallery = (p.images || []).map((img: string) => {
            if (img.startsWith('http')) return img;
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

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-40 md:pt-44 text-[#1c1c19] md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[#8b837b]">
          <Link href="/">Home</Link>
          <span>&gt;</span>
          <Link href="/category">Category</Link>
          <span>&gt;</span>
          <Link href={`/category/${product.categorySlug}`}>{product.categoryTitle}</Link>
          <span>&gt;</span>
          <span className="text-[#1c1c19]">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <ProductImageGallery name={product.name} images={product.gallery} />

          <section className="rounded-[1.8rem] border border-[#ece6df] bg-white p-5 shadow-[0_14px_36px_rgba(95,93,62,0.06)] md:p-8">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-[#8f8279]">
              {product.categoryTitle}
            </p>
            <h1 className="mt-3 text-3xl font-black uppercase leading-[0.96] tracking-[-0.05em] text-[#111111] md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex items-center gap-1 text-[#ffb000]">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <span key={starIndex} className="text-sm">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-[#6d655d]">4.8 Rating</span>
              <span className="text-sm text-[#6d655d]">146 Reviews</span>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold text-[#111111] md:text-4xl">
                {product.price}
              </span>
              {product.originalPrice ? (
                <>
                  <span className="text-lg text-[#a7a09a] line-through">
                    {product.originalPrice}
                  </span>
                  <span className="text-sm font-semibold text-[#ef6f63]">
                    {product.discountPercent}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg text-[#a7a09a] line-through">₹300</span>
                  <span className="text-sm font-semibold text-[#ef6f63]">40% OFF</span>
                </>
              )}
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6d655d] md:text-base">
              {product.subtitle} with clean finishing, premium fabric direction,
              and a women’s fashion fit built for elevated everyday wear and
              occasion styling.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {["Dress", "Slim", "Layer", "Curve"].map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    tag === "Layer"
                      ? "bg-[#111111] text-white"
                      : "bg-[#f4efe8] text-[#6d655d]"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <ProductOptionsClient product={product as any} />
          </section>
        </div>

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
            <h2 className="text-xl font-black uppercase tracking-[-0.04em] text-[#111111]">
              You Might Also Like
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${slugifyProductName(item.name)}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-[1rem] bg-[#f4efe8]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={260}
                      height={320}
                      className="h-[140px] w-full object-contain object-bottom p-4 transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-[#111111] md:text-sm">
                    {item.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111111]">
                      {item.price}
                    </span>
                    <span className="text-xs text-[#a7a09a] line-through">
                      ₹242
                    </span>
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
