import { StoreFooter } from "@/components/StoreFooter";

const summaryCards = [
  {
    title: "Easy Cancellations",
    description: "Cancel your order easily before dispatch.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Quick Refunds",
    description: "Refunds processed within 5-7 business days.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Original Source",
    description: "Refunds are credited back to original payment mode.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
];

const sections = [
  { id: "cancellation", title: "1. Order Cancellation" },
  { id: "process", title: "2. Refund Process" },
  { id: "timeline", title: "3. Refund Timelines" },
  { id: "exceptions", title: "4. Exceptions" },
];

export default function CancellationRefundPolicy() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-40 md:px-10 md:pt-44 lg:px-16">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            Legal Information
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            Cancellation & Refund
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            How to cancel an order and our refund timelines.
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
              
              <div id="cancellation" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">1. Order Cancellation</h2>
                <p className="mb-4">Orders can only be cancelled before they are marked as "Dispatched". Once an order has been shipped, it cannot be cancelled, but you may refuse delivery or request a return later.</p>
              </div>

              <div id="process" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">2. Refund Process</h2>
                <p className="mb-4">If an order is cancelled or a return is successfully accepted, the refund will be initiated automatically. The amount will be credited to the original payment method used during checkout.</p>
              </div>

              <div id="timeline" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">3. Refund Timelines</h2>
                <p className="mb-4">Once initiated, it generally takes 5-7 business days for the amount to reflect in your bank account, credit card, or wallet. In some cases, depending on your bank, it may take up to 10 days.</p>
              </div>

              <div id="exceptions" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">4. Exceptions</h2>
                <p className="mb-4">Refunds for Cash on Delivery (COD) orders will be credited to your store wallet or bank account provided during the return request. We do not provide cash refunds under any circumstances.</p>
              </div>

            </div>
          </section>

        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
