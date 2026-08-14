import Link from "next/link";
import { StoreFooter } from "@/components/StoreFooter";
import { MainNavbar } from "@/components/MainNavbar";

const SUPPORT_EMAIL = "support@heywomaniyaa.com";
const SUPPORT_PHONE_DISPLAY = "+91 8006637777";
const SUPPORT_PHONE_LINK = "+918006637777";
const WHATSAPP_LINK = "https://wa.me/918006637777";
const BUSINESS_ADDRESS = "490/42, Sector 43, Gurgaon, Basement";

const contactMethods = [
  {
    label: "WhatsApp",
    value: SUPPORT_PHONE_DISPLAY,
    href: WHATSAPP_LINK,
    note: "Quick help for orders, returns, refunds, and support",
  },
  {
    label: "Email",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    note: "Best for detailed queries and complaints",
  },
  {
    label: "Phone",
    value: SUPPORT_PHONE_DISPLAY,
    href: `tel:${SUPPORT_PHONE_LINK}`,
    note: "Monday to Saturday, 10:00 AM to 6:00 PM",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-8 md:px-10 md:pt-12 lg:px-16">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            Contact Us
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            We&apos;re here for every order, return, and support question.
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            Reach us for support and inquiries.
          </p>
        </section>

        <section className="mx-auto max-w-5xl rounded-[1.4rem] border border-[#ece6df] bg-white/95 p-5 shadow-[0_8px_30px_rgba(95,93,62,0.04)] md:p-8 mb-6">

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {contactMethods.map((method) => (
              <a
                key={method.label}
                href={method.href}
                target={method.label === "WhatsApp" ? "_blank" : undefined}
                rel={method.label === "WhatsApp" ? "noopener noreferrer" : undefined}
                className="group rounded-[1.2rem] border border-[#ece6df] bg-[#fcf9f4] p-4 shadow-[0_12px_28px_rgba(95,93,62,0.05)] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)] block"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#9c4049]/70">
                  {method.label}
                </p>
                <p className="mt-2 text-base font-bold text-[#111111] transition-colors duration-300 group-hover:text-[#9c4049]">
                  {method.value}
                </p>
                <p className="mt-2 text-[0.8rem] leading-snug text-[#6d655d]">
                  {method.note}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Support Details Grid */}
        <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[1.4rem] border border-[#ece6df] bg-[#fcf9f4] p-5 md:p-8 transition-all duration-300 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#9c4049]/70">
              Support Details
            </p>
            <div className="mt-4 space-y-4 text-[0.85rem] leading-relaxed text-[#6d655d]">
              <div>
                <h2 className="text-base font-bold text-[#111111]">
                  Email Support
                </h2>
                <div className="mt-2 space-y-1">
                  <p className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><span className="font-semibold text-[#111111] min-w-[120px]">Support:</span> <a href="mailto:support@heywomaniyaa.com" className="text-[#9c4049]">support@heywomaniyaa.com</a></p>
                  <p className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><span className="font-semibold text-[#111111] min-w-[120px]">Sales:</span> <a href="mailto:sales@heywomaniyaa.com" className="text-[#9c4049]">sales@heywomaniyaa.com</a></p>
                  <p className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><span className="font-semibold text-[#111111] min-w-[120px]">Admin:</span> <a href="mailto:admin@heywomaniyaa.com" className="text-[#9c4049]">admin@heywomaniyaa.com</a></p>
                  <p className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><span className="font-semibold text-[#111111] min-w-[120px]">Partner Program:</span> <a href="mailto:partnerprogram@heywomaniyaa.com" className="text-[#9c4049]">partnerprogram@heywomaniyaa.com</a></p>
                  <p className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><span className="font-semibold text-[#111111] min-w-[120px]">General Info:</span> <a href="mailto:info@heywomaniyaa.com" className="text-[#9c4049]">info@heywomaniyaa.com</a></p>
                </div>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111111]">
                  Phone / WhatsApp
                </h2>
                <a
                  href={`tel:${SUPPORT_PHONE_LINK}`}
                  className="mt-1 inline-block font-semibold text-[#9c4049]"
                >
                  {SUPPORT_PHONE_DISPLAY}
                </a>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111111]">
                  Support Hours
                </h2>
                <p>Monday to Saturday, 10:00 AM to 6:00 PM</p>
                <p>We usually respond within 24–48 business hours.</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111111]">
                  Business Address
                </h2>
                <p>{BUSINESS_ADDRESS}</p>
              </div>
            </div>
          </section>

          <aside className="rounded-[1.4rem] border border-[#ece6df] bg-white p-5 md:p-8 shadow-[0_8px_30px_rgba(95,93,62,0.04)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#9c4049]/70">
              We Can Help With
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[0.85rem] leading-relaxed text-[#6d655d]">
              <li>Order status and delivery updates</li>
              <li>Payment confirmation</li>
              <li>Cancellation requests</li>
              <li>Return and refund support</li>
              <li>Exchange guidance</li>
              <li>Product-related questions</li>
              <li>Account and login support</li>
              <li>Partner reward or payout-related queries, if applicable</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-4 py-2 text-sm font-semibold text-[#111111] transition-opacity hover:opacity-80"
              >
                Back Home
              </Link>
              <Link
                href="/terms-and-conditions"
                className="rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-4 py-2 text-sm font-semibold text-[#111111] transition-opacity hover:opacity-80"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy-policy"
                className="rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-4 py-2 text-sm font-semibold text-[#111111] transition-opacity hover:opacity-80"
              >
                Privacy Policy
              </Link>
            </div>
          </aside>
        </div>

      </main>

      <StoreFooter />
    </div>
  );
}