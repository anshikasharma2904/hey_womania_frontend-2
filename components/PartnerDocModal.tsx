"use client";

import { useState } from "react";
import { FaFileAlt, FaTimes, FaPrint, FaBookOpen } from "react-icons/fa";

export default function PartnerDocModal({ variant = "button" }: { variant?: "button" | "link" }) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === "button" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7d2746_0%,#a64863_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(125,39,70,0.2)] transition hover:opacity-90 active:scale-95"
        >
          <FaBookOpen className="text-base" />
          Read Partner Policy Doc
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-[#9c4049] underline decoration-[#9c4049]/30 underline-offset-2 hover:text-[#7f3144] font-semibold"
        >
          Partner Policy Doc
        </button>
      )}

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
                    Hey Womaniyaa Partner Guidelines
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
                    1. Sales Calculation (INR)
                  </h2>
                  <p>
                    All product commissions and rank calculations are based on the final INR order value of the products sold (excluding shipping/taxes if applicable).
                  </p>
                </section>

                {/* Section 2 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    2. Payout Eligibility Criteria
                  </h2>
                  <p>
                    To activate monthly cash withdrawals and qualify for downline payouts, partners must achieve:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Valid KYC documentation submitted and approved via the Partner Dashboard.</li>
                    <li>Active partner status (at least one personal order in the past 6 months).</li>
                  </ul>
                </section>

                {/* Section 3 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    3. Level Income
                  </h2>
                  
                  <div className="space-y-1 pt-2">
                    <p className="text-sm">
                      Earn direct overrides on sales made by yourself and within your downline network up to three tiers deep. These are aggregated and paid out during the monthly closing cycle:
                    </p>
                    <div className="grid grid-cols-4 gap-3 text-center text-sm mt-3">
                      <div className="rounded-lg bg-[#fff9f6] p-3 border border-[#ead9d1]">
                        <p className="font-bold text-[#9c4049]">Self</p>
                        <p className="text-base font-black">5%</p>
                        <p className="text-xs text-[#7b6f69]">Personal Sales</p>
                      </div>
                      <div className="rounded-lg bg-[#fff9f6] p-3 border border-[#ead9d1]">
                        <p className="font-bold text-[#9c4049]">Level 1</p>
                        <p className="text-base font-black">2%</p>
                        <p className="text-xs text-[#7b6f69]">Direct Referrals</p>
                      </div>
                      <div className="rounded-lg bg-[#fff9f6] p-3 border border-[#ead9d1]">
                        <p className="font-bold text-[#9c4049]">Level 2</p>
                        <p className="text-base font-black">1%</p>
                        <p className="text-xs text-[#7b6f69]">Indirect Referrals</p>
                      </div>
                      <div className="rounded-lg bg-[#fff9f6] p-3 border border-[#ead9d1]">
                        <p className="font-bold text-[#9c4049]">Level 3</p>
                        <p className="text-base font-black">0.5%</p>
                        <p className="text-xs text-[#7b6f69]">Deep Referrals</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 4 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    4. Monthly Bonus
                  </h2>
                  <p className="text-sm">
                    Earn an extra bonus percentage based on your total personal sales for the month:
                  </p>
                  <div className="space-y-2.5">
                    <div className="rounded-lg border border-[#f0ddd6] bg-white p-3 text-sm">
                      <p className="font-bold text-[#382933]">₹25,000+ Personal Sales</p>
                      <p className="text-xs text-[#7b6f69]">Earns an additional <strong>0.5% bonus</strong> on your personal sales for that month.</p>
                    </div>
                    <div className="rounded-lg border border-[#f0ddd6] bg-white p-3 text-sm">
                      <p className="font-bold text-[#382933]">₹50,000+ Personal Sales</p>
                      <p className="text-xs text-[#7b6f69]">Earns an additional <strong>1% bonus</strong> on your personal sales for that month.</p>
                    </div>
                    <div className="rounded-lg border border-[#f0ddd6] bg-white p-3 text-sm">
                      <p className="font-bold text-[#382933]">₹1,00,000+ Personal Sales</p>
                      <p className="text-xs text-[#7b6f69]">Earns an additional <strong>2% bonus</strong> on your personal sales for that month.</p>
                    </div>
                  </div>
                </section>

                {/* Section 5 */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold text-[#382933] border-l-4 border-[#9c4049] pl-3">
                    5. Womaniyaa Points & Global Pools
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div className="rounded-xl border border-[#ead9d1] bg-[#fffcfb] p-4">
                      <h4 className="font-bold text-[#7a2e43]">Womaniyaa Point</h4>
                      <p className="text-xs mt-2 text-[#6a625b]">
                        Achieve <strong>₹5,00,000 Team Sales</strong> (including at least ₹10,000 self sales) consistently for <strong>3 consecutive months</strong>.
                      </p>
                      <p className="text-xs mt-2 text-[#6a625b] font-semibold">
                        Reward: 1 Point (Shares in 1% Global Partner Turnover Pool for 12 months).
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#ead9d1] bg-[#fffcfb] p-4">
                      <h4 className="font-bold text-[#7a2e43]">Super Womaniyaa Point</h4>
                      <p className="text-xs mt-2 text-[#6a625b]">
                        Achieve <strong>₹2,50,00,000 Team Sales</strong> (including at least ₹25,000 self sales) consistently for <strong>6 consecutive months</strong>.
                      </p>
                      <p className="text-xs mt-2 text-[#6a625b] font-semibold">
                        Reward: 1 Super Point (Shares in 1% Global Partner Turnover Pool for 36 months).
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#7b6f69] mt-2">
                    Note: You can qualify for an unlimited number of points. Each active point earns an equal share of the respective pool each month until it expires.
                  </p>
                </section>

                {/* Disclaimer */}
                <footer className="border-t border-[#ead9d1] pt-6 text-center text-xs text-[#9c8e85]">
                  <p>© 2026 Hey Womaniyaa. All rights reserved. Calculations are subject to audit and verification.</p>
                </footer>
              </article>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
