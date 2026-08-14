import { MainNavbar } from "@/components/MainNavbar";
import { StoreFooter } from "@/components/StoreFooter";

export default function CustomerSupportPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-10 md:px-10 md:pt-10 lg:px-16 lg:pt-10">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            Customer Support
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            We are here to help you.
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            Help for orders, returns, and account queries.
          </p>
        </section>

        <section className="mx-auto max-w-4xl rounded-[1.4rem] border border-[#ece6df] bg-white/95 p-5 shadow-[0_8px_30px_rgba(95,93,62,0.04)] md:p-8 mb-6">

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <a href="mailto:support@heywomaniyaa.com" className="group rounded-[1.2rem] border border-[#ece6df] bg-[#fcf9f4] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)] block">
              <h2 className="text-base font-bold text-[#111111] transition-colors duration-300 group-hover:text-[#9c4049]">
                Email Support
              </h2>
              <p className="mt-1 text-[0.8rem] leading-snug text-[#6d655d]">
                Send us your order ID and issue details.
              </p>
              <span className="mt-2 inline-block text-[0.8rem] font-semibold text-[#9c4049]">
                support@heywomaniyaa.com
              </span>
            </a>

            <a href="tel:+918006637777" className="group rounded-[1.2rem] border border-[#ece6df] bg-[#fcf9f4] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)] block">
              <h2 className="text-base font-bold text-[#111111] transition-colors duration-300 group-hover:text-[#9c4049]">
                Phone / WhatsApp
              </h2>
              <p className="mt-1 text-[0.8rem] leading-snug text-[#6d655d]">
                Contact us during support hours.
              </p>
              <span className="mt-2 inline-block text-[0.8rem] font-semibold text-[#9c4049]">
                +91 8006637777
              </span>
            </a>
          </div>

          <div className="mt-6 rounded-[1.2rem] border border-[#ece6df] bg-[#fcf9f4] p-4 transition-all duration-300 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)]">
            <h2 className="text-base font-bold text-[#111111]">
              Support Hours
            </h2>
            <p className="mt-2 text-[0.8rem] leading-snug text-[#6d655d]">
              Monday to Saturday: 10:00 AM - 6:00 PM <br />
              Sunday: Closed
            </p>
            <p className="mt-2 text-[0.8rem] leading-snug text-[#6d655d]">
              We usually respond within 24–48 business hours.
            </p>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}