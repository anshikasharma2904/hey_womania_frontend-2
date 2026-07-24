"use client";

import { useState } from "react";
import { FaFileAlt, FaTimes, FaPrint, FaBookOpen } from "react-icons/fa";

export default function PartnerDocModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7d2746_0%,#a64863_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(125,39,70,0.2)] transition hover:opacity-90 active:scale-95"
      >
        <FaBookOpen className="text-base" />
        Read Partner Policy Doc
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1c1410]/55 p-4 backdrop-blur-md animate-fade-in">
          {/* Custom Print Style Rule to print ONLY the document */}
          <style>{`
            @media print {
              /* Hide all page content */
              body * {
                visibility: hidden;
              }
              /* Show only the wrap container and its children */
              #printable-partner-doc-wrap, #printable-partner-doc-wrap * {
                visibility: visible;
              }
              /* Position printable container at the top left */
              #printable-partner-doc-wrap {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
                color: #000;
                padding: 10px;
              }
            }
          `}</style>

          <div 
            id="printable-partner-doc-wrap"
            className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-[2rem] border border-[#ead9d1] bg-white shadow-2xl overflow-hidden text-[#1c1c19]"
          >
            {/* Modal Header (Hidden during print via standard Tailwind print:hidden or manual styles) */}
            <header className="flex items-center justify-between border-b border-[#ead9d1] bg-[#fffaf7] px-6 py-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0ea] text-[#9c4049]">
                  <FaFileAlt className="text-lg" />
                </div>
                <div>
                  <h3 className="font-[family:var(--font-display)] text-lg font-black tracking-tight text-[#5c2530] sm:text-xl">
                    HeyWomaniyaa Partner Guidelines
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-[#9c4049]/80 font-bold">
                    Official Business Plan & Policy Doc
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  title="Print / Save PDF"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead9d1] bg-white text-[#5f5d3e] transition hover:bg-[#fcf7f4]"
                >
                  <FaPrint />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7f3144] text-white transition hover:opacity-90"
                >
                  <FaTimes />
                </button>
              </div>
            </header>

            {/* Scrollable Document Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 print:overflow-visible print:h-auto">
              <article className="mx-auto max-w-3xl space-y-8 font-sans leading-relaxed text-[#4a423d]">
                <div className="text-center border-b border-[#ead9d1] pb-6">
                  <h1 className="font-[family:var(--font-display)] text-3xl font-black text-[#382933]">
                    HEY WOMANIA
                  </h1>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#9c4049] font-bold mt-1">
                    Empowered Women, Empower Women
                  </p>
                  <p className="text-xs text-[#7b6f69] mt-3">
                    Effective Date: June 2026 • Confidential Partner Material
                  </p>
                </div>

                {/* Section 1 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    1. Sell Points (SP) Calculation Formula
                  </h2>
                  <p>
                    All product commissions and rank calculations are based on Sell Points (SP). The formula is:
                  </p>
                  <div className="rounded-xl bg-[#fff9f6] border border-[#f0ddd6] p-4 text-center">
                    <p className="text-xl font-black text-[#7a2e43]">
                      Selling Price ÷ 5 = Sell Points (SP)
                    </p>
                    <p className="text-xs text-[#7b6f69] mt-1">
                      Example: A product bundle sold at ₹1,000 generates exactly 200 SP.
                    </p>
                  </div>
                </section>

                {/* Section 2 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    2. Payout Eligibility Criteria
                  </h2>
                  <p>
                    To activate monthly cash withdrawals and qualify for downline fast track payouts, partners must achieve:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Minimum personal target of <strong>500 Sell Points (SP)</strong>.</li>
                    <li>At least <strong>2 active direct partners</strong> enrolled under your referral code.</li>
                  </ul>
                </section>

                {/* Section 3 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    3. Core Income Streams
                  </h2>
                  
                  {/* Stream A */}
                  <div className="space-y-1 pt-2">
                    <h3 className="font-semibold text-[#5c2530]">A. Self Sell Income (10%)</h3>
                    <p className="text-sm">
                      Partners earn an instant <strong>10% cash commission</strong> of the SP generated on all personal purchases. E.g., placing a ₹1,000 (200 SP) order instantly credits ₹20 to your wallet.
                    </p>
                  </div>

                  {/* Stream B */}
                  <div className="space-y-2 pt-2">
                    <h3 className="font-semibold text-[#5c2530]">B. Fast Track Level Income</h3>
                    <p className="text-sm">
                      Earn direct overrides on sales made within your downline network up to three tiers deep:
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div className="rounded-lg bg-[#fff9f6] p-3 border border-[#ead9d1]">
                        <p className="font-bold text-[#9c4049]">Level 1</p>
                        <p className="text-base font-black">5%</p>
                        <p className="text-xs text-[#7b6f69]">Direct Referrals</p>
                      </div>
                      <div className="rounded-lg bg-[#fff9f6] p-3 border border-[#ead9d1]">
                        <p className="font-bold text-[#9c4049]">Level 2</p>
                        <p className="text-base font-black">3%</p>
                        <p className="text-xs text-[#7b6f69]">Indirect Referrals</p>
                      </div>
                      <div className="rounded-lg bg-[#fff9f6] p-3 border border-[#ead9d1]">
                        <p className="font-bold text-[#9c4049]">Level 3</p>
                        <p className="text-base font-black">2%</p>
                        <p className="text-xs text-[#7b6f69]">Deep Referrals</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    4. Monthly Score Income Pools
                  </h2>
                  <p className="text-sm">
                    A percentage of the company turnover is allocated monthly to qualification score pools:
                  </p>
                  <div className="space-y-2.5">
                    <div className="rounded-lg border border-[#f0ddd6] bg-white p-3 text-sm">
                      <p className="font-bold text-[#382933]">Glam Score (15% Pool)</p>
                      <p className="text-xs text-[#7b6f69]">Requires <strong>2,500 SP</strong> from total team. Shares in the monthly Glam Score pool.</p>
                    </div>
                    <div className="rounded-lg border border-[#f0ddd6] bg-white p-3 text-sm">
                      <p className="font-bold text-[#382933]">Style Score (12% Pool)</p>
                      <p className="text-xs text-[#7b6f69]">Requires <strong>25,000 SP</strong> from total team. Shares in the monthly Style Score pool.</p>
                    </div>
                    <div className="rounded-lg border border-[#f0ddd6] bg-white p-3 text-sm">
                      <p className="font-bold text-[#382933]">Gorgeous Score (10% Pool)</p>
                      <p className="text-xs text-[#7b6f69]">Requires <strong>100,000 SP</strong> from total team. Shares in the monthly Gorgeous Score pool.</p>
                    </div>
                    <div className="rounded-lg border border-[#f0ddd6] bg-white p-3 text-sm">
                      <p className="font-bold text-[#382933]">Super Womania Score (10% Pool)</p>
                      <p className="text-xs text-[#7b6f69]">Requires <strong>2 Gorgeous Score</strong> achievements in one month. Shares in the monthly Super Womania pool.</p>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    5. Dream Funds, Smart Pool & Clubs
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div className="rounded-xl border border-[#ead9d1] bg-[#fffcfb] p-4">
                      <h4 className="font-bold text-[#7a2e43]">Dream Funds (5% Pools)</h4>
                      <ul className="list-disc pl-4 mt-2 space-y-1.5 text-xs">
                        <li><strong>Dream Car Fund:</strong> Hitting Gorgeous Score (100k SP) for 3 continuous months.</li>
                        <li><strong>Dream House Fund:</strong> Hitting 200,000 team SP for 3 continuous months.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-[#ead9d1] bg-[#fffcfb] p-4">
                      <h4 className="font-bold text-[#7a2e43]">Smart Seller & Annual Clubs</h4>
                      <ul className="list-disc pl-4 mt-2 space-y-1.5 text-xs">
                        <li><strong>Smart Seller Pool:</strong> 3 continuous months of 10,000 team SP unlocks a 12-month pool sharing.</li>
                        <li><strong>Super Club (1% Pool):</strong> 50 lakh yearly team SP.</li>
                        <li><strong>Mega Club (1.5% Pool):</strong> 2 crore yearly team SP.</li>
                        <li><strong>Luxury Life (2.5% Pool):</strong> 5 crore yearly team SP.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 6 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    6. Partnership Bonus & Timely Rewards
                  </h2>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Partnership Bonus:</strong> Unlocks a 5-level downline override structure after qualifying for the Style Score.</li>
                    <li><strong>Timely Rewards:</strong> Access to weekly, monthly, and festival bonanzas.</li>
                  </ul>
                </section>

                {/* Disclaimer */}
                <footer className="border-t border-[#ead9d1] pt-6 text-center text-xs text-[#9c8e85]">
                  <p>© 2026 HeyWomaniyaa. All rights reserved. Calculations are subject to audit and verification.</p>
                </footer>
              </article>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
