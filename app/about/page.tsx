import Link from "next/link";
import { StoreFooter } from "@/components/StoreFooter";
import { MainNavbar } from "@/components/MainNavbar";

const values = [
  {
    title: "Quality Fashion",
    description:
      "We focus on stylish, comfortable, and carefully selected products for modern women.",
  },
  {
    title: "Customer First",
    description:
      "Our goal is to provide a smooth shopping experience with clear support for orders, returns, and refunds.",
  },
  {
    title: "Trusted Shopping",
    description:
      "We aim to keep pricing, delivery, policies, and customer support simple and transparent.",
  },
];

const categories = [
  "Western Wear",
  "Traditional Wear",
  "Jewellery",
  "Bags",
  "Accessories",
  "Beauty & Lifestyle",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-40 md:px-10 md:pt-44 lg:px-16">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            About HeyWomaniyaa
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            A women&apos;s fashion store built for modern style.
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            HeyWomaniyaa brings stylish, comfortable, and affordable fashion together in one smooth shopping experience. From western wear and traditional looks to jewellery, bags, accessories, beauty, and lifestyle products, we help women shop confidently for everyday and occasion wear.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-[#111111] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Back Home
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-[#d6cec4] bg-white px-6 py-2.5 text-sm font-semibold text-[#111111] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Contact Us
            </Link>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="mx-auto max-w-5xl rounded-[1.4rem] border border-[#ece6df] bg-white/95 p-5 shadow-[0_8px_30px_rgba(95,93,62,0.04)] md:p-8 mb-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="group rounded-[1.2rem] border border-[#ece6df] bg-[#fcf9f4] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)]">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#9c4049]/70">
                Our Mission
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#111111] md:text-2xl transition-colors duration-300 group-hover:text-[#9c4049]">
                To make women&apos;s fashion simple, stylish, and accessible.
              </h2>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-[#6d655d]">
                Our mission is to offer a curated collection of fashion and
                lifestyle products that help customers shop confidently for daily
                wear, festive looks, special occasions, and personal style needs.
              </p>
            </div>

            <div className="group rounded-[1.2rem] border border-[#ece6df] bg-[#fcf9f4] p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)]">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#9c4049]/70">
                Our Vision
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#111111] md:text-2xl transition-colors duration-300 group-hover:text-[#9c4049]">
                To become a trusted online fashion destination for women.
              </h2>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-[#6d655d]">
                We aim to build a reliable fashion platform where customers can
                discover new styles, shop quality products, receive timely
                support, and enjoy a better online shopping experience.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mx-auto max-w-5xl rounded-[1.4rem] border border-[#ece6df] bg-white/95 p-5 shadow-[0_8px_30px_rgba(95,93,62,0.04)] md:p-8 mb-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/70">
            What We Offer
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#111111] md:text-3xl">
            Fashion, accessories, and lifestyle products for everyday and occasion wear.
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category}
                className="rounded-xl border border-[#ece6df] bg-[#fcf9f4] px-4 py-3 text-[0.85rem] font-semibold text-[#111111] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(95,93,62,0.05)] cursor-default"
              >
                {category}
              </div>
            ))}
          </div>
        </section>

        {/* Our Values */}
        <section className="mx-auto max-w-5xl rounded-[1.4rem] border border-[#ece6df] bg-white/95 p-5 shadow-[0_8px_30px_rgba(95,93,62,0.04)] md:p-8 mb-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/70">
            Our Values
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {values.map((item) => (
              <div
                key={item.title}
                className="group rounded-[1.2rem] border border-[#ece6df] bg-[#fcf9f4] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)]"
              >
                <h3 className="text-base font-bold text-[#111111] transition-colors duration-300 group-hover:text-[#9c4049]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.8rem] leading-snug text-[#6d655d]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <StoreFooter />
    </div>
  );
}