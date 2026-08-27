"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { FaArrowLeft, FaMoneyBillWave, FaPiggyBank, FaRegCreditCard, FaLock, FaUpload, FaCrown, FaStar, FaUsers } from "react-icons/fa";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

export default function PartnerWalletPage() {
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  
  // Balances
  const [walletBalanceVal, setWalletBalanceVal] = useState(0);
  const [networkWalletBalanceVal, setNetworkWalletBalanceVal] = useState(0);
  const [affiliateIncome, setAffiliateIncome] = useState(0);
  const [wpIncome, setWpIncome] = useState(0);
  const [swpIncome, setSwpIncome] = useState(0);
  const [monthlySelfSales, setMonthlySelfSales] = useState(0);

  // Form states
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [kycStatus, setKycStatus] = useState<{ tone: "idle" | "error" | "success"; message: string }>({ tone: "idle", message: "" });
  const [isKycSubmitting, setIsKycSubmitting] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("upi");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState<{ tone: "idle" | "error" | "success"; message: string }>({ tone: "idle", message: "" });
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false);

  // Transactions list state
  const [txnList, setTxnList] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [txTypeFilter, setTxTypeFilter] = useState<"ALL" | "EARNINGS" | "WITHDRAWALS">("ALL");

  useEffect(() => {
    fetch("/api/partner/dashboard")
      .then(res => res.json())
      .then(dashData => {
        if (dashData && dashData.success) {
          const db = dashData.dashboard;
          setKycVerified(!!db.kycVerified);
          setWalletBalanceVal(db.walletBalance || 0);
          setNetworkWalletBalanceVal(db.networkWalletBalance || 0);
          setAffiliateIncome(db.affiliateIncome || 0);
          setWpIncome(db.wpIncome || 0);
          setSwpIncome(db.swpIncome || 0);
          setMonthlySelfSales(db.currentMonthSelfSales || 0);
          
          if (dashData.transactions && Array.isArray(dashData.transactions)) {
            const mapped = dashData.transactions.map((tx: any) => ({
              title: tx.source,
              meta: `${new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} • ${tx.description}`,
              amount: `${tx.type === "CREDIT" ? "+" : "-"}₹${tx.amount.toFixed(2)}`,
              tone: tx.type === "CREDIT" ? "text-[#4f9158]" : "text-[#7f3144]"
            }));
            setTxnList(mapped);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleWithdrawClick = () => {
    if (!kycVerified) {
      setKycModalOpen(true);
    } else {
      setWithdrawModalOpen(true);
    }
  };

  const handleKycSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (aadhaarNumber.length !== 12 || panNumber.length !== 10) {
      setKycStatus({ tone: "error", message: "Please provide valid 12-digit Aadhaar and 10-digit PAN numbers." });
      return;
    }
    try {
      setIsKycSubmitting(true);
      setKycStatus({ tone: "idle", message: "" });
      // Mock submit
      setTimeout(() => {
        setKycStatus({ tone: "success", message: "KYC Documents Verified Successfully via DigiLocker!" });
        setKycVerified(true);
        setTimeout(() => setKycModalOpen(false), 1500);
        setIsKycSubmitting(false);
      }, 1000);
    } catch {
      setKycStatus({ tone: "error", message: "Unable to verify KYC documents." });
      setIsKycSubmitting(false);
    }
  };

  const handleWithdrawSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(withdrawAmount);
    if (isNaN(amountVal) || amountVal < 100) {
      setWithdrawStatus({ tone: "error", message: "Minimum withdrawal amount is ₹100." });
      return;
    }
    if (amountVal > networkWalletBalanceVal) {
      setWithdrawStatus({ tone: "error", message: "Withdrawal amount exceeds your available network earnings balance." });
      return;
    }
    try {
      setIsWithdrawSubmitting(true);
      setWithdrawStatus({ tone: "idle", message: "" });
      setTimeout(() => {
        setWithdrawStatus({ tone: "success", message: `Successfully requested payout of ₹${amountVal}!` });
        setNetworkWalletBalanceVal(prev => prev - amountVal);
        setTxnList(prev => [
          {
            title: "Withdrawal",
            meta: `Today • ${withdrawMethod.toUpperCase()} payout request`,
            amount: `-₹${amountVal.toFixed(2)}`,
            tone: "text-[#7f3144]"
          },
          ...prev
        ]);
        setWithdrawAmount("");
        setWithdrawDetails("");
        setTimeout(() => {
          setWithdrawModalOpen(false);
          setWithdrawStatus({ tone: "idle", message: "" });
        }, 1500);
        setIsWithdrawSubmitting(false);
      }, 1000);
    } catch {
      setWithdrawStatus({ tone: "error", message: "Unable to complete payout request." });
      setIsWithdrawSubmitting(false);
    }
  };

  let monthlyBonusPercent = 0;
  if (monthlySelfSales >= 100000) monthlyBonusPercent = 2;
  else if (monthlySelfSales >= 50000) monthlyBonusPercent = 1;
  else if (monthlySelfSales >= 25000) monthlyBonusPercent = 0.5;

  const dynamicWalletStats = [
    { label: "Total Network Earnings", value: `₹${networkWalletBalanceVal.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`, icon: FaUsers, sub: "Available to withdraw", filterKey: null },
    { label: "Shopping Wallet", value: `₹${walletBalanceVal.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`, icon: MdOutlineAccountBalanceWallet, sub: "Use for personal purchases", filterKey: null },
    { label: "Affiliate Income", value: `₹${affiliateIncome.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`, icon: FaPiggyBank, sub: "From customer referrals", filterKey: "Affiliate Link" },
    { label: "Monthly Bonus Progress", value: `${monthlyBonusPercent}%`, icon: FaMoneyBillWave, sub: `₹${monthlySelfSales.toLocaleString("en-IN")} self sales`, filterKey: null },
    { label: "Womaniyaa Income", value: `₹${wpIncome.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`, icon: FaStar, sub: "From 1% turnover pool", filterKey: "Womaniyaa Point" },
    { label: "Super Womaniyaa Income", value: `₹${swpIncome.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`, icon: FaCrown, sub: "From 1% turnover pool", filterKey: "Super Womaniyaa Point" }
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#fbf1ec_34%,#f5e8e0_100%)] pt-10 text-[#1c1c19] sm:pt-10 md:pt-10 lg:pt-10">
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-5 md:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-[#ead9d1] bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] shadow-[0_24px_70px_rgba(127,49,68,0.10)] overflow-hidden">
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#ead9d1] px-4 py-6 sm:px-6 md:px-8 bg-white/60">
            <Link
              href="/earnings"
              className="inline-flex items-center gap-2 rounded-full border border-[#ead9d1] bg-white px-5 py-2.5 text-sm font-semibold text-[#61313d] transition-colors hover:bg-[#fff6f3] shadow-sm"
            >
              <FaArrowLeft className="text-[0.9rem]" />
              Dashboard
            </Link>
            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-[2.2rem] leading-[0.95] tracking-[-0.04em] text-[#5c2530] sm:text-[2.8rem] md:text-[3.2rem]">
                My Wallet
              </p>
              <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.24em] text-[#5f5d3e]/80 sm:text-[0.75rem] font-semibold">
                Earnings Breakdown & History
              </p>
            </div>
            <button
              onClick={handleWithdrawClick}
              className="flex items-center gap-2 rounded-full bg-[#7f3144] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
            >
              {!kycVerified && <FaLock className="text-[0.8rem]" />}
              Withdraw
            </button>
          </header>

          <section className="p-4 sm:p-6 md:p-8">
            <h2 className="mb-6 font-[family:var(--font-display)] text-[1.5rem] tracking-[-0.03em] text-[#382933] sm:text-[1.8rem]">
              Income Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-10">
              {dynamicWalletStats.map((stat, idx) => {
                const Icon = stat.icon;
                const isPrimary = idx === 0 || idx === 1;
                const isActive = activeFilter === stat.filterKey && stat.filterKey !== null;
                const baseClasses = `rounded-[1.5rem] border p-6 shadow-sm transition-all duration-200`;
                // Make all cards clickable. If it has a filterKey, it toggles it. If it doesn't (like Total Network Earnings), it clears the filter.
                const interactClasses = `cursor-pointer hover:scale-[1.02] hover:shadow-md`;
                
                // Color logic
                let colorClasses = '';
                if (isPrimary) {
                  colorClasses = `border-[#eddad3] bg-[linear-gradient(135deg,#7d2746_0%,#a64863_55%,#d0848d_100%)] text-white`;
                  // Optional: if it's primary and active filter is null, maybe give it a subtle ring to show "All" is active, but we'll leave it as is.
                  if (activeFilter === null) {
                    colorClasses += ` ring-2 ring-[#7d2746]/50 ring-offset-2 ring-offset-[#fcf9f4]`;
                  }
                } else {
                  colorClasses = isActive 
                    ? `border-[#7d2746] bg-[#fff6f3] text-[#2a2430] ring-1 ring-[#7d2746]` 
                    : `border-[#f0ddd6] bg-white text-[#2a2430] hover:border-[#7d2746]/50`;
                }

                return (
                  <div 
                    key={stat.label} 
                    className={`${baseClasses} ${interactClasses} ${colorClasses}`}
                    onClick={() => {
                      if (stat.filterKey) {
                        setActiveFilter(prev => prev === stat.filterKey ? null : stat.filterKey);
                      } else {
                        // Clicking Total Network Earnings or Shopping Wallet clears the filter
                        setActiveFilter(null);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isPrimary ? 'bg-white/20 text-white' : (isActive ? 'bg-[#7d2746] text-white' : 'bg-[#fff3ee] text-[#5f5d3e]')}`}>
                        <Icon className="text-xl" />
                      </div>
                      <p className={`text-[0.65rem] font-bold uppercase tracking-[0.18em] ${isPrimary ? 'text-white/80' : 'text-[#7b6f69]'}`}>
                        {stat.label}
                      </p>
                    </div>
                    <p className={`font-[family:var(--font-display)] text-[2.2rem] leading-none tracking-[-0.04em] ${isPrimary ? 'text-white' : 'text-[#2a2430]'}`}>
                      {stat.value}
                    </p>
                    <p className={`mt-2 text-xs font-medium ${isPrimary ? 'text-white/80' : 'text-[#8b837b]'}`}>
                      {stat.sub}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[1.5rem] border border-[#f0ddd6] bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#f0ddd6] p-5 md:p-6 bg-[#fcf9f4]">
                <div>
                  <h2 className="font-[family:var(--font-display)] text-[1.4rem] tracking-[-0.03em] text-[#382933] sm:text-[1.7rem]">
                    Transaction History
                  </h2>
                  <p className="text-xs text-[#6d655d] mt-1 font-medium">Detailed log of all credits and debits</p>
                </div>
                <div className="shrink-0">
                  <select
                    value={txTypeFilter}
                    onChange={(e) => setTxTypeFilter(e.target.value as any)}
                    className="rounded-xl border border-[#ead9d1] bg-white px-3 py-2 text-xs font-semibold text-[#5f5d3e] outline-none hover:border-[#7d2746] focus:border-[#7d2746]"
                  >
                    <option value="ALL">All Transactions</option>
                    <option value="EARNINGS">Earnings Only</option>
                    <option value="WITHDRAWALS">Withdrawals Only</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-[#f0ddd6]">
                {(() => {
                  let filteredTxns = txnList;

                  // Apply Card Filter
                  if (activeFilter) {
                    filteredTxns = filteredTxns.filter(t => t.title === activeFilter);
                  }

                  // Apply Type Dropdown Filter
                  if (txTypeFilter === "EARNINGS") {
                    filteredTxns = filteredTxns.filter(t => t.tone === "text-[#4f9158]"); // Credits are green
                  } else if (txTypeFilter === "WITHDRAWALS") {
                    filteredTxns = filteredTxns.filter(t => t.tone === "text-[#7f3144]"); // Debits are red
                  }

                  if (filteredTxns.length > 0) {
                    return filteredTxns.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 p-5 md:p-6 hover:bg-[#fff9f7] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.tone === 'text-[#4f9158]' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {item.tone === 'text-[#4f9158]' ? <FaArrowLeft className="rotate-[135deg] text-sm" /> : <FaArrowLeft className="rotate-[45deg] text-sm" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#2a2430] mb-0.5">{item.title}</p>
                            <p className="text-xs font-medium text-[#7c6e68]">{item.meta}</p>
                          </div>
                        </div>
                        <p className={`text-base font-black tracking-tight md:text-lg ${item.tone}`}>{item.amount}</p>
                      </div>
                    ));
                  } else {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fcf9f4] border border-[#ead9d1] text-[#d4c9bf]">
                          <FaMoneyBillWave className="text-2xl" />
                        </div>
                        <p className="text-base font-semibold text-[#2a2430]">No transactions found</p>
                        <p className="mt-1 text-sm text-[#7c6e68] text-center">
                          {activeFilter ? `No history for ${activeFilter}.` : "Earnings and withdrawals will appear here automatically."}
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* KYC Verification Modal */}
      {kycModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2d251f]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#ece6df] bg-white p-6 shadow-xl text-[#1c1c19]">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-lg font-black uppercase text-[#5f5d3e] tracking-wider">KYC Document Verification</h3>
              <button onClick={() => setKycModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">Aadhaar Number</span>
                  <input
                    required
                    type="text"
                    maxLength={12}
                    placeholder="12-digit Aadhaar"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-2.5 text-sm outline-none focus:border-[#5f5d3e]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">PAN Card Number</span>
                  <input
                    required
                    type="text"
                    maxLength={10}
                    placeholder="PAN e.g. ABCDE1234F"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-2.5 text-sm outline-none focus:border-[#5f5d3e]"
                  />
                </label>
              </div>

              <div className="grid gap-3 grid-cols-2 text-center text-xs text-[#6d655d] pt-2">
                <div className="border border-dashed rounded-lg p-2 bg-[#fcf9f4]/50"><FaUpload className="inline mb-1 mr-1" /> Aadhaar Front</div>
                <div className="border border-dashed rounded-lg p-2 bg-[#fcf9f4]/50"><FaUpload className="inline mb-1 mr-1" /> Aadhaar Back</div>
                <div className="border border-dashed rounded-lg p-2 bg-[#fcf9f4]/50"><FaUpload className="inline mb-1 mr-1" /> PAN Front</div>
                <div className="border border-dashed rounded-lg p-2 bg-[#fcf9f4]/50"><FaUpload className="inline mb-1 mr-1" /> PAN Back</div>
              </div>

              <button
                type="submit"
                disabled={isKycSubmitting}
                className="w-full rounded-xl bg-[#5f5d3e] py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow hover:opacity-90 disabled:opacity-50 transition"
              >
                {isKycSubmitting ? "Verifying..." : "Verify via DigiLocker"}
              </button>

              {kycStatus.message && (
                <p className={`rounded-xl px-4 py-2.5 text-xs font-semibold ${
                  kycStatus.tone === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                }`}>
                  {kycStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Form Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2d251f]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-[#ece6df] bg-white p-6 shadow-xl text-[#1c1c19]">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-lg font-black uppercase text-[#4f9158] tracking-wider">Request Withdrawal</h3>
              <button onClick={() => setWithdrawModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">Amount to Withdraw</span>
                <input
                  required
                  type="number"
                  min={100}
                  max={networkWalletBalanceVal}
                  placeholder={`Available: ₹${networkWalletBalanceVal}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-2.5 text-sm outline-none focus:border-[#5f5d3e]"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">Payout Method</span>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-2.5 text-sm outline-none focus:border-[#5f5d3e]"
                >
                  <option value="upi">UPI (GPay / PhonePe)</option>
                  <option value="bank">Bank Transfer (IMPS/NEFT)</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">
                  {withdrawMethod === "upi" ? "UPI Address" : "Bank A/C Details (A/C No, IFSC, Name)"}
                </span>
                <textarea
                  required
                  rows={3}
                  placeholder={withdrawMethod === "upi" ? "e.g. name@okhdfcbank" : "A/C: 123456789\nIFSC: HDFC0001234\nName: Priya Sharma"}
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-2.5 text-sm outline-none focus:border-[#5f5d3e]"
                />
              </label>

              <button
                type="submit"
                disabled={isWithdrawSubmitting}
                className="w-full rounded-xl bg-[#4f9158] py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow hover:opacity-90 disabled:opacity-50 transition"
              >
                {isWithdrawSubmitting ? "Processing..." : `Withdraw Payout`}
              </button>

              {withdrawStatus.message && (
                <p className={`rounded-xl px-4 py-2.5 text-xs font-semibold ${
                  withdrawStatus.tone === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                }`}>
                  {withdrawStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
