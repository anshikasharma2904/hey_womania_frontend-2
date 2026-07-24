import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="mt-10 md:mt-16">
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

      <section className="mx-4 md:mx-8 xl:mx-auto mt-8 max-w-7xl px-4 pb-8 md:mt-10 md:px-8 md:pb-10">
        <div className="md:grid md:grid-cols-[1.2fr_1fr_1fr] md:gap-10">
          <div className="md:pr-4">
            <Link
              href="/"
              className="font-[family:var(--font-display)] text-2xl uppercase leading-[0.9] tracking-tight text-[#111111] md:text-[30px]"
            >
              HeyWomaniyaa
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#6d655d]">
              Fashion-first storefront for western, traditional, occasion, and
              everyday wardrobe edits.
            </p>
            <div className="mt-5 space-y-2 text-sm leading-6 text-[#6d655d]">
              <p>Address: Shop No. G-08, Central Plaza, Golf Course Road, Sector 53, Wazirabad, Gurugram, Gurgaon, Haryana, 122011</p>
              <p>Mobile: +91 63982 83789</p>
              <p>Email: Heywomaniyaa@gmail.com</p>
            </div>
          </div>
        

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 md:col-span-2 md:mt-0 md:grid-cols-2 md:gap-10">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111]">
                Information
              </h3>
              <div className="mt-4 space-y-2 text-sm text-[#6d655d]">
                <p>
                  <Link href="/about" className="transition-colors hover:text-[#111111]">
                    About
                  </Link>
                </p>
                <p>
                  <Link href="/customer-support" className="transition-colors hover:text-[#111111]">
                    Customer Support
                  </Link>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111]">
                Legal
              </h3>
              <div className="mt-4 space-y-2 text-sm text-[#6d655d]">
                <p>
                  <Link href="/terms-and-conditions" className="transition-colors hover:text-[#111111]">
                    Terms & Conditions
                  </Link>
                </p>
                <p>
                  <Link href="/privacy-policy" className="transition-colors hover:text-[#111111]">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>

  );
}
