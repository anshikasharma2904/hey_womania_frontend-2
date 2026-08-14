import { StoreFooter } from "@/components/StoreFooter";

const summaryCards = [
  {
    title: "Fast Dispatch",
    description: "Orders are usually dispatched within 24-48 hours.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    title: "Secure Delivery",
    description: "We partner with top courier services for safe delivery.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Live Tracking",
    description: "Track your orders in real-time from dispatch to door.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const sections = [
  { id: "dispatch", title: "1. Dispatch Timelines" },
  { id: "shipping", title: "2. Shipping Charges" },
  { id: "delivery", title: "3. Delivery Times" },
  { id: "tracking", title: "4. Tracking Your Order" },
];

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-8 md:px-10 md:pt-12 lg:px-16">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            Legal Information
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            Shipping Policy
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            Delivery times, shipping costs, and dispatch details.
          </p>
        </section>

        {/* TL;DR Summary Cards */}
        <section className="mx-auto max-w-5xl rounded-[1.4rem] border border-[#ece6df] bg-white/95 p-5 shadow-[0_8px_30px_rgba(95,93,62,0.04)] md:p-8 mb-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/70">
            Quick Summary
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
            <div className="text-[#4a4a4a] text-base leading-relaxed">
              
              <div id="dispatch" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">1. Dispatch Timelines</h2>
                <p className="mb-4">Most orders are processed and dispatched within 24 to 48 hours of order confirmation. Delays may occur during sales, public holidays, or due to unforeseen logistical issues.</p>
              </div>

              <div id="shipping" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">2. Shipping Charges</h2>
                <p className="mb-4">Shipping charges will be calculated and displayed at checkout based on your delivery location. Free shipping may apply to orders exceeding a specific cart value, as announced during promotional events.</p>
              </div>

              <div id="delivery" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">3. Delivery Times</h2>
                <p className="mb-4">Standard delivery generally takes 3 to 7 business days depending on the pin code. Remote areas may take longer.</p>
              </div>

              <div id="tracking" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">4. Tracking Your Order</h2>
                <p className="mb-4">Once your order is shipped, you will receive a tracking link via SMS or email. You can also track your order status directly from the "My Orders" section of your account.</p>
              </div>

            </div>
          </section>

        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
