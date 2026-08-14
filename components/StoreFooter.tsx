import Link from "next/link";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export function StoreFooter() {
  return (
    <footer className="mt-10 md:mt-16">
      {/* Newsletter Banner */}
      <section className="mx-4 md:mx-8 xl:mx-auto max-w-7xl rounded-[1.5rem] bg-[#111111] px-4 py-5 text-white md:rounded-[1.8rem] md:px-8 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[1.55rem] font-black uppercase leading-[0.95] tracking-[-0.04em] md:text-4xl">
              Stay up to date about
              <br />
              our latest offers
            </p>
          </div>
          <div className="w-full max-w-md">
            <div className="rounded-full bg-white px-4 py-2.5 md:px-4 md:py-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-transparent text-sm text-[#1c1c19] outline-none placeholder:text-[#8b8b8b]"
              />
            </div>
            <button className="mt-2.5 w-full rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#111111] transition-opacity duration-300 hover:opacity-90 md:mt-3 md:py-3">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </section>

      {/* Main Footer Links */}
      <section className="mx-4 md:mx-8 xl:mx-auto mt-8 max-w-7xl px-4 pb-4 md:mt-10 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 md:pr-4">
            <Link
              href="/"
              className="font-[family:var(--font-display)] text-2xl uppercase leading-[0.9] tracking-tight text-[#111111] md:text-[30px]"
            >
              HeyWomaniyaa
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[#6d655d]">
              Fashion-first storefront for western, traditional, occasion, and everyday wardrobe edits.
            </p>
            <div className="mt-6 space-y-3.5 text-sm leading-relaxed text-[#6d655d]">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 shrink-0 text-lg text-[#9c4049]" />
                <p>490/42, Sector 43, Gurgaon, Basement</p>
              </div>
              <div className="flex items-center gap-3">
                <FaPhoneAlt className="shrink-0 text-[1.05rem] text-[#9c4049]" />
                <p>+91 8006637777</p>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="shrink-0 text-[1.1rem] text-[#9c4049]" />
                <p>info@heywomaniyaa.com</p>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="shrink-0 text-[1.1rem] text-[#9c4049]" />
                <p>support@heywomaniyaa.com</p>
              </div>
            </div>
            {/* Social Links */}
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.instagram.com/heywomaniyaa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d9d2] bg-[#fcf9f4] text-[#9c4049] transition hover:bg-[#9c4049] hover:text-white"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/heywomaniyaa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0d9d2] bg-[#fcf9f4] text-[#9c4049] transition hover:bg-[#9c4049] hover:text-white"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111]">Shop</h3>
            <div className="mt-4 space-y-2 text-sm text-[#6d655d]">
              <p><Link href="/category/all" className="transition-colors hover:text-[#111111]">All Products</Link></p>
              <p><Link href="/category/clothes" className="transition-colors hover:text-[#111111]">Clothes</Link></p>
              <p><Link href="/category/jewellery" className="transition-colors hover:text-[#111111]">Jewellery</Link></p>
              <p><Link href="/category/bags" className="transition-colors hover:text-[#111111]">Bags</Link></p>
              <p><Link href="/best-sellers" className="transition-colors hover:text-[#111111]">Best Sellers</Link></p>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111]">Information</h3>
            <div className="mt-4 space-y-2 text-sm text-[#6d655d]">
              <p><Link href="/about" className="transition-colors hover:text-[#111111]">About Us</Link></p>
              <p><Link href="/contact" className="transition-colors hover:text-[#111111]">Contact</Link></p>
              <p><Link href="/customer-support" className="transition-colors hover:text-[#111111]">Customer Support</Link></p>
              <p><Link href="/cancellation-refund" className="transition-colors hover:text-[#111111]">Cancellation & Refund</Link></p>
              <p><Link href="/shipping-policy" className="transition-colors hover:text-[#111111]">Shipping Policy</Link></p>
              <p><Link href="/return-policy" className="transition-colors hover:text-[#111111]">Return Policy</Link></p>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111]">Legal</h3>
            <div className="mt-4 space-y-2 text-sm text-[#6d655d]">
              <p><Link href="/terms-and-conditions" className="transition-colors hover:text-[#111111]">Terms &amp; Conditions</Link></p>
              <p><Link href="/privacy-policy" className="transition-colors hover:text-[#111111]">Privacy Policy</Link></p>
            </div>
          </div>
        </div>
      </section>


    </footer>
  );
}
