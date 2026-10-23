import { StoreFooter } from "@/components/StoreFooter";

const summaryCards = [
  {
    title: "Store Credit Refund",
    description: "Refunds are provided as store credit / gift card only. No monetary bank refund.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Quality Check",
    description: "All returned products undergo a mandatory inspection before credit is issued.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Return Shipping",
    description: "Return shipping of ₹100 is borne by customer and deducted from store credit.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
];

const sections = [
  { id: "eligibility", title: "1. Return Eligibility" },
  { id: "refund-mode", title: "2. Store Credit & Refund Policy" },
  { id: "shipping-charges", title: "3. Return Shipping & Pickup" },
  { id: "quality-check", title: "4. Quality Check & Timeline" },
  { id: "non-returnable", title: "5. Non-returnable Items" },
  { id: "how-to-return", title: "6. How to Initiate a Return" },
];

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-8 md:px-10 md:pt-12 lg:px-16">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            Legal & Customer Support
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            Return & Refund Policy
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            Understand our return conditions, store credit guidelines, reverse pickup, and quality inspection process.
          </p>
        </section>

        {/* TL;DR Summary Cards */}
        <section className="mx-auto max-w-5xl rounded-[1.4rem] border border-[#ece6df] bg-white/95 p-5 shadow-[0_8px_30px_rgba(95,93,62,0.04)] md:p-8 mb-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/70">
            Policy Highlights
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {summaryCards.map((card) => (
              <div key={card.title} className="group rounded-[1.2rem] border border-[#ece6df] bg-[#fcf9f4] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_30px_rgba(95,93,62,0.06)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-[#111111] transition-colors duration-300 group-hover:text-[#9c4049]">{card.title}</h3>
                  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                    {card.icon}
                  </div>
                </div>
                <p className="text-[0.8rem] leading-snug text-[#6d655d]">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content Layout */}
        <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-[250px_1fr] items-start">
          
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block sticky top-32 rounded-[1.8rem] border border-[#ece6df] bg-white/95 p-6 shadow-[0_18px_48px_rgba(95,93,62,0.06)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#111111] mb-6">Contents</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block px-3 py-2 text-sm font-medium text-[#6d655d] transition-all duration-200 hover:text-[#9c4049] hover:bg-[#fcf9f4] rounded-lg"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Document Content */}
          <section className="rounded-[1.8rem] border border-[#ece6df] bg-white/95 p-8 md:p-12 shadow-[0_18px_48px_rgba(95,93,62,0.06)]">
            <div className="text-[#4a4a4a] text-base leading-relaxed space-y-10">
              
              {/* Section 1 */}
              <div id="eligibility" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">1. Return Eligibility</h2>
                <p className="mb-3">
                  At Hey Womaniyaa, customer satisfaction and quality are at the heart of our curation. You may request a return within <strong>7 days from the date of delivery</strong>.
                </p>
                <p className="mb-3">To be eligible for a return:</p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>The product must be completely unused, unwashed, unaltered, and unworn.</li>
                  <li>All original brand tags, security ribbons, product labels, and original protective packaging must remain intact and undamaged.</li>
                  <li>The product must be handed over in its original condition alongside any original accessories or complimentary gifts included.</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div id="refund-mode" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">2. Store Credit & Refund Policy</h2>
                <div className="p-4 rounded-xl border border-[#9c4049]/20 bg-[#9c4049]/5 mb-4">
                  <p className="text-sm font-semibold text-[#9c4049]">
                    Important Notice: We do not offer direct monetary / cash or bank account refunds for returned merchandise.
                  </p>
                </div>
                <p className="mb-3">
                  All refunds are issued exclusively in the form of <strong>Store Credit</strong> (delivered as an official Gift Card / voucher directly to your registered email address).
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li><strong>Product Value Only:</strong> The store credit value is calculated solely on the purchased product amount. Original outbound shipping charges paid at checkout are non-refundable.</li>
                  <li><strong>Return Shipping Adjustment:</strong> Return shipping and handling charges of <strong>₹100/-</strong> will be adjusted/deducted directly from the final store credit issued.</li>
                  <li><strong>Non-Transferable:</strong> Store credit is issued to your specific registered account and cannot be en-cashed, refunded back to bank/cards, or transferred to another user.</li>
                  <li><strong>Flexible Usage:</strong> You can apply your store credit anytime at checkout toward your next purchase across the entire Hey Womaniyaa collection.</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div id="shipping-charges" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">3. Return Shipping & Pickup</h2>
                <p className="mb-3">
                  The cost of return shipping is to be borne by the customer (<strong>₹100/-</strong> per return shipment). This cost is conveniently deducted from your store credit so you do not need to pay cash upfront during courier handover.
                </p>
                <h3 className="text-lg font-semibold text-[#111111] mt-5 mb-2">Doorstep Reverse Pickup:</h3>
                <p className="mb-3">
                  Where courier serviceability allows, our logistics partner will arrange a doorstep reverse pickup within 2–4 business days following approval of your return request.
                </p>
                <h3 className="text-lg font-semibold text-[#111111] mt-5 mb-2">Self-Shipment by Customer (If Pickup is Unavailable):</h3>
                <p className="mb-3">
                  In case reverse pickup service is not operational at your pincode or location, you will be requested to self-ship the product to our warehouse facility.
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>When self-shipping, you are responsible for paying the shipping costs directly to your chosen courier service. Self-shipping costs are non-refundable.</li>
                  <li>Hey Womaniyaa cannot be held liable or responsible for any packages lost, damaged, or delayed in transit by third-party courier services during self-shipment. We strongly recommend using a reputable courier service with tracking.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div id="quality-check" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">4. Quality Check & Timeline</h2>
                <p className="mb-3">
                  Once your return arrives at our fulfillment center, our dedicated quality assurance team conducts a thorough examination of the garment.
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li><strong>Quality Inspection:</strong> The item is verified for unworn condition, absence of stains, perfume or body odors, fabric pulls, and confirmed tag attachments. Items failing quality checks will be returned to the customer at their expense.</li>
                  <li><strong>Issuance of Store Credit:</strong> Once the product successfully passes quality inspection, your store credit will be generated and emailed to your registered address within <strong>2 to 3 working days</strong>.</li>
                  <li><strong>Overall Processing Window:</strong> The complete return cycle—from initial pickup, transit, quality check, to store credit issuance—typically takes between <strong>10 to 15 business days</strong>.</li>
                  <li><strong>Carrier Delays:</strong> Please note that Hey Womaniyaa is not responsible for unexpected transit delays caused by third-party shipping partners, regional courier hub congestion, or extreme weather conditions.</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div id="non-returnable" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">5. Non-returnable Items</h2>
                <p className="mb-3">For hygiene, safety, and operational standards, the following items cannot be accepted for return or exchange:</p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>Intimate apparel, lingerie, shapewear, innerwear, and bodysuits.</li>
                  <li>Jewelry items, hair accessories, and cosmetics/beauty products once unsealed.</li>
                  <li>Customized, altered, made-to-order, or personalized designs.</li>
                  <li>Products specifically highlighted as &ldquo;Final Sale&rdquo; or non-returnable on their respective product details page.</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div id="how-to-return" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">6. How to Initiate a Return</h2>
                <p className="mb-3">
                  To start a return, log in to your account and visit the <strong>Orders</strong> dashboard, or reach out to our customer care team:
                </p>
                <div className="mt-4 rounded-xl border border-[#ece6df] bg-[#fcf9f4] p-5 text-sm">
                  <p className="font-semibold text-[#111111] mb-1">Customer Support & Queries</p>
                  <p className="text-[#6d655d] mb-3">
                    Please provide your Order ID, product details, and the reason for return along with photos if applicable.
                  </p>
                  <p className="text-sm">
                    Email: <a href="mailto:admin@heywomaniyaa.com" className="font-semibold text-[#9c4049] underline hover:text-[#7f343c]">admin@heywomaniyaa.com</a>
                  </p>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
