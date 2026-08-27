import { StoreFooter } from "@/components/StoreFooter";
import { MainNavbar } from "@/components/MainNavbar";

const summaryCards = [
  {
    title: "Data Protection",
    description: "Your personal data is encrypted and securely stored.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "No Data Selling",
    description: "We never sell your personal information to third parties.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    title: "Secure Payments",
    description: "Payments are processed via trusted, secure gateways.",
    icon: (
      <svg className="w-6 h-6 text-[#9c4049]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const sections = [
  { id: "collection", title: "1. Information We Collect" },
  { id: "usage", title: "2. How We Use Information" },
  { id: "payments", title: "3. Payment Information" },
  { id: "kyc", title: "4. KYC & Payouts" },
  { id: "sharing", title: "5. Sharing of Information" },
  { id: "cookies", title: "6. Cookies & Tracking" },
  { id: "security", title: "7. Data Security" },
  { id: "retention", title: "8. Data Retention" },
  { id: "marketing", title: "9. Marketing Communication" },
  { id: "rights", title: "10. User Rights" },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">

      <main className="px-4 pb-16 pt-8 md:px-10 md:pt-12 lg:px-16">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl mb-12 text-center md:px-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/80">
            Legal Information
          </p>
          <h1 className="mt-3 font-[family:var(--font-display)] text-4xl leading-[0.95] tracking-[-0.04em] md:text-6xl text-[#111111]">
            Privacy Policy
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-[0.9rem] leading-relaxed text-[#6d655d] md:text-base">
            How we protect your personal information.
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
              
              <div id="collection" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">1. Information We Collect</h2>
                <p className="mb-4">Hey Womaniyaa may collect the following information from users:</p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Name, Mobile number, Email address</li>
                  <li>Billing and Shipping addresses</li>
                  <li>Order details and Payment status</li>
                  <li>Refund, return, and cancellation details</li>
                  <li>Wallet, payout details, and KYC documents (PAN, Aadhaar) if applicable</li>
                  <li>Device information, IP address, and website usage details</li>
                </ul>
              </div>

              <div id="usage" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">2. How We Use Your Information</h2>
                <p className="mb-4">We use your information to:</p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li>Create and manage your account</li>
                  <li>Process orders, deliveries, returns, and refunds</li>
                  <li>Manage rewards and payouts</li>
                  <li>Verify KYC details</li>
                  <li>Prevent fraud and misuse of the platform</li>
                  <li>Send order updates and service-related messages</li>
                </ul>
              </div>

              <div id="payments" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">3. Payment Information</h2>
                <p className="mb-4">Online payments on Hey Womaniyaa are processed through secure third-party payment gateways. Hey Womaniyaa does not store full card numbers, CVV, UPI PIN, or net banking passwords.</p>
              </div>

              <div id="kyc" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">4. KYC and Payout Information</h2>
                <p className="mb-4">If you are eligible for rewards or wallet withdrawals, Hey Womaniyaa may collect KYC details. This is used strictly for identity verification, fraud prevention, and tax compliance.</p>
              </div>

              <div id="sharing" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">5. Sharing of Information</h2>
                <p className="mb-4">Hey Womaniyaa may share required information with trusted third parties only when necessary, such as courier partners, payment gateways, and KYC verification providers. We do not sell your personal information.</p>
              </div>

              <div id="cookies" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">6. Cookies and Tracking</h2>
                <p className="mb-4">We use cookies to improve website performance, remember user preferences, and analyze traffic. You may disable cookies in your browser settings, though some website features may not function optimally.</p>
              </div>

              <div id="security" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">7. Data Security</h2>
                <p className="mb-4">Hey Womaniyaa uses reasonable security measures to protect user data. However, users are responsible for keeping their login details and OTPs safe.</p>
              </div>

              <div id="retention" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">8. Data Retention</h2>
                <p className="mb-4">We keep user data only as long as required for order processing, support, legal compliance, fraud prevention, and business records.</p>
              </div>

              <div id="marketing" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">9. Marketing Communication</h2>
                <p className="mb-4">By using Hey Womaniyaa, you may receive promotional messages. You may opt out of promotional communication at any time.</p>
              </div>

              <div id="rights" className="scroll-mt-32 mb-10">
                <h2 className="text-2xl font-bold text-[#111111] mb-4">10. User Rights</h2>
                <p className="mb-4">Users may request to update, correct, or delete their personal information where applicable by contacting Hey Womaniyaa support.</p>
              </div>

              <div className="mt-16 rounded-xl border border-[#ece6df] bg-[#fcf9f4] p-6 text-sm">
                <h3 className="font-bold text-[#111111] mb-2">Contact Us</h3>
                <p>For privacy-related questions, data requests, or complaints, please email us at <strong className="text-[#9c4049]">admin@heywomaniyaa.com</strong>.</p>
              </div>

            </div>
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}