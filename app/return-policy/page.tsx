import { StoreFooter } from "@/components/StoreFooter";

const summaryCards = [
  {
    title: "Return Window",
    description: "Returns are accepted within 7 days of delivery.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Item Condition",
    description: "Tags must be intact and product unwashed.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    title: "Easy Pickup",
    description: "We offer reverse pickup from your doorstep.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];

const sections = [
  { id: "eligibility", title: "1. Return Eligibility" },
  { id: "non-returnable", title: "2. Non-returnable Items" },
  { id: "process", title: "3. Return Process" },
  { id: "quality", title: "4. Quality Check" },
];

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-40 md:px-10 md:pt-44 lg:px-16">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            Legal Information
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            Return Policy
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            Guidelines and timelines for product returns.
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
              
              <div id="eligibility" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">1. Return Eligibility</h2>
                <p className="mb-4">Products can be returned within 7 days of delivery. The item must be unused, unwashed, and have all original tags and packaging intact.</p>
              </div>

              <div id="non-returnable" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">2. Non-returnable Items</h2>
                <p className="mb-4">Certain items are non-returnable for hygiene reasons, including lingerie, innerwear, swimwear, beauty products, and specific jewelry pieces.</p>
              </div>

              <div id="process" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">3. Return Process</h2>
                <p className="mb-4">You can easily place a return request from your account dashboard. Once approved, our courier partner will pick up the item from your doorstep within 2-3 business days.</p>
              </div>

              <div id="quality" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">4. Quality Check</h2>
                <p className="mb-4">Upon reaching our warehouse, the returned item will undergo a quality check. If the product passes the check, the refund will be initiated.</p>
              </div>

            </div>
          </section>

        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
