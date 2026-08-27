import { StoreFooter } from "@/components/StoreFooter";
import { MainNavbar } from "@/components/MainNavbar";

const summaryCards = [
  {
    title: "Secure Shopping",
    description: "Your data and payments are securely encrypted.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "7-Day Returns",
    description: "Hassle-free returns on eligible products.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "Fast Payouts",
    description: "Partner rewards distributed smoothly via KYC.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const sections = [
  { id: "about", title: "1. About Hey Womaniyaa" },
  { id: "account", title: "2. Account Registration" },
  { id: "products", title: "3. Products & Pricing" },
  { id: "orders", title: "4. Orders & Payments" },
  { id: "shipping", title: "5. Shipping & Delivery" },
  { id: "cancellation", title: "6. Cancellation Policy" },
  { id: "returns", title: "7. Return Policy" },
  { id: "non-returnable", title: "8. Non-Returnable" },
  { id: "refund", title: "9. Refund Policy" },
  { id: "rewards", title: "10. Rewards & Payouts" },
  { id: "kyc", title: "11. KYC & Withdrawals" },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-8 md:px-10 md:pt-12 lg:px-16">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            Legal Information
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            Terms & Conditions
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            Website rules and user guidelines.
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
              
              <div id="about" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">1. About Hey Womaniyaa</h2>
                <p className="mb-4">Hey Womaniyaa is an e-commerce platform that offers women&apos;s fashion, lifestyle products, jewellery, accessories, beauty products, and related items.</p>
                <p className="mb-4">Hey Womaniyaa may also provide a partner or reward program where eligible users can earn rewards or payouts based on valid product sales and delivered orders. Hey Womaniyaa does not guarantee any fixed income, salary, investment return, or assured earning.</p>
              </div>

              <div id="account" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">2. Account Registration</h2>
                <p className="mb-4">To use certain features of our website, users may need to create an account by providing their name, mobile number, email address, shipping address, and other required details.</p>
                <p className="mb-4">You are responsible for providing accurate information and keeping your account secure. Hey Womaniyaa reserves the right to suspend or terminate any account involved in fraud, fake orders, misuse, or policy violations.</p>
              </div>

              <div id="products" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">3. Products and Pricing</h2>
                <p className="mb-4">We try to display accurate product details, images, prices, descriptions, sizes, and availability. However, product color, design, or appearance may slightly vary due to screen display, lighting, photography, or stock variation.</p>
                <p className="mb-4">Hey Womaniyaa may update product prices, offers, discounts, availability, or product details at any time without prior notice.</p>
              </div>

              <div id="orders" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">4. Orders and Payments</h2>
                <p className="mb-4">Orders can be placed through available payment methods such as UPI, cards, wallets, net banking, Cash on Delivery, or any other payment method enabled on the website.</p>
                <p className="mb-4">An order is confirmed only after successful payment confirmation or COD verification, as applicable.</p>
                <p className="mb-4">Hey Womaniyaa may cancel or hold any order due to payment failure, stock issues, incorrect address, customer unavailability, COD verification failure, fraud suspicion, or policy violation.</p>
              </div>

              <div id="shipping" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">5. Shipping and Delivery</h2>
                <p className="mb-4">Hey Womaniyaa delivers products through third-party courier and logistics partners. Delivery time may vary depending on product availability, delivery location, courier serviceability, weather, holidays, and operational conditions.</p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Metro cities: 3–7 business days</li>
                  <li>Other locations: 5–10 business days</li>
                  <li>Remote areas: 7–14 business days</li>
                </ul>
                <p className="mb-4">Hey Womaniyaa is not responsible for delays caused by courier partners, incorrect address, customer unavailability, natural events, or circumstances beyond our control.</p>
              </div>

              <div id="cancellation" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">6. Cancellation Policy</h2>
                <p className="mb-4">Customers may cancel an order before it is packed, dispatched, or handed over to the courier partner.</p>
                <p className="mb-4">Once the order is shipped, cancellation may not be possible. In such cases, the customer may raise a return request if the product is eligible for return.</p>
                <p className="mb-4">Hey Womaniyaa may cancel an order due to product unavailability, payment failure, incorrect address, COD verification failure, customer unavailability, fraud suspicion, or policy violation.</p>
              </div>

              <div id="returns" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">7. Return Policy</h2>
                <p className="mb-4">Customers can raise a return request within 7 days from the date of delivery.</p>
                <h3 className="text-lg font-semibold text-[#111111] mt-6 mb-2">Return may be accepted if:</h3>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Wrong, damaged, or defective product is delivered</li>
                  <li>Product is different from the description</li>
                  <li>Product is unused and in original condition with tags</li>
                </ul>
                <h3 className="text-lg font-semibold text-[#111111] mt-6 mb-2">Return may be rejected if:</h3>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Product is used, washed, worn, altered, or damaged</li>
                  <li>Tags, invoice, packaging, or accessories are missing</li>
                  <li>Return request is raised after 7 days</li>
                </ul>
                <p className="mb-4">All returned products are subject to quality check. Refund or replacement will be processed only after approval.</p>
              </div>

              <div id="non-returnable" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">8. Non-Returnable Products</h2>
                <p className="mb-4">The following products may not be eligible for return:</p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Used or damaged products</li>
                  <li>Washed or altered products</li>
                  <li>Personal care, beauty, or hygiene products once opened</li>
                  <li>Customized or personalized products</li>
                  <li>Products marked as non-returnable on the product page</li>
                </ul>
              </div>

              <div id="refund" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">9. Refund Policy</h2>
                <p className="mb-4">Refund may be approved for eligible cancelled, returned, damaged, defective, wrong, unavailable, or failed payment orders.</p>
                <p className="mb-4">Refund will be processed only after verification and quality check. Approved refunds will usually be processed within 7–10 business days to the original payment method.</p>
                <p className="mb-4">Shipping charges, COD charges, convenience fees, or handling charges may be non-refundable unless the issue is from Hey Womaniyaa&apos;s side.</p>
              </div>

              <div id="rewards" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">10. Rewards and Payouts</h2>
                <p className="mb-4">Hey Womaniyaa may provide rewards or payouts to eligible users or partners based on valid delivered orders.</p>
                <p className="mb-4">Rewards are calculated only on eligible delivered orders. Cancelled, returned, refunded, rejected, fake, or unpaid orders will not be counted for final rewards, income, or payout.</p>
                <p className="mb-4">Hey Womaniyaa may update reward rules, payout eligibility, payout cycle, and qualification conditions at any time.</p>
              </div>

              <div id="kyc" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">11. KYC and Withdrawals</h2>
                <p className="mb-4">Withdrawals, rewards, or payouts may require successful KYC verification. Users may be required to provide PAN, Aadhaar, bank account, UPI, or other verification details as required by Hey Womaniyaa.</p>
                <p className="mb-4">Hey Womaniyaa reserves the right to hold, reject, reverse, or cancel any payout if KYC fails, bank details are incorrect, fraud is detected, or policy violation is found.</p>
              </div>

              <div className="mt-16 rounded-xl border border-[#ece6df] bg-[#fcf9f4] p-6 text-sm">
                <h3 className="font-bold text-[#111111] mb-2">Contact Us</h3>
                <p>For any policy-related queries, please email us at <strong className="text-[#9c4049]">admin@heywomaniyaa.com</strong>.</p>
              </div>

            </div>
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}