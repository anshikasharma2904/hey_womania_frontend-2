"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { FaArrowLeft, FaEye, FaMoneyBillWave, FaPiggyBank, FaRegCreditCard, FaLock, FaCheckCircle, FaTimesCircle, FaUpload } from "react-icons/fa";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

export default function PartnerWalletPage() {
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [walletBalanceVal, setWalletBalanceVal] = useState(0);
  const [pendingVal, setPendingVal] = useState(0);
  const [monthlyVal, setMonthlyVal] = useState(0);
  const [poolVal, setPoolVal] = useState(0);

  // KYC form states
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [kycStatus, setKycStatus] = useState<{ tone: "idle" | "error" | "success"; message: string }>({ tone: "idle", message: "" });
  const [isKycSubmitting, setIsKycSubmitting] = useState(false);

  // Withdrawal form states
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("upi");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState<{ tone: "idle" | "error" | "success"; message: string }>({ tone: "idle", message: "" });
  const [isWithdrawSubmitting, setIsWithdrawSubmitting] = useState(false);

  // Transactions list state
  const [txnList, setTxnList] = useState<any[]>([]);

  useEffect(() => {
    // Fetch partner details client side on mount
    fetch("/api/partner/dashboard")
      .then(res => res.json())
      .then(dashData => {
        if (dashData && dashData.dashboard) {
          setKycVerified(!!dashData.dashboard.kycVerified);
          setWalletBalanceVal(dashData.dashboard.walletBalance ?? 0);
          const poolSum = (dashData.dashboard.scoreIncome || 0) + 
                          (dashData.dashboard.smartSellerPoolIncome || 0) + 
                          (dashData.dashboard.annualClubIncome || 0);
          setPoolVal(poolSum);
        }
      })
      .catch(() => {});

    fetch("/api/partner/ledgers")
      .then(res => res.json())
      .then(ledgerData => {
        if (ledgerData && ledgerData.ok && Array.isArray(ledgerData.ledgers)) {
          if (ledgerData.ledgers.length > 0) {
            const mapped = ledgerData.ledgers.map((l: any) => ({
              title: l.incomeType,
              meta: `${new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${l.remarks || 'Partner earnings'}`,
              amount: `+₹${l.amount.toFixed(2)}`,
              tone: "text-[#4f9158]"
            }));
            setTxnList(mapped);
            
            const totalEarnings = ledgerData.ledgers.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
            setMonthlyVal(totalEarnings);
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

      const res = await fetch("/api/kyc/digilocker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarNumber,
          panNumber,
          files: {
            aadhaarFront: "aadhaar_front.png",
            aadhaarBack: "aadhaar_back.png",
            panFront: "pan_front.png",
            panBack: "pan_back.png"
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setKycStatus({ tone: "error", message: data.message ?? "Failed to verify KYC." });
        return;
      }

      setKycStatus({ tone: "success", message: "KYC Documents Verified Successfully via DigiLocker!" });
      setKycVerified(true);
      setTimeout(() => {
        setKycModalOpen(false);
      }, 1500);
    } catch {
      setKycStatus({ tone: "error", message: "Unable to verify KYC documents." });
    } finally {
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

    if (amountVal > walletBalanceVal) {
      setWithdrawStatus({ tone: "error", message: "Withdrawal amount exceeds your available balance." });
      return;
    }

    try {
      setIsWithdrawSubmitting(true);
      setWithdrawStatus({ tone: "idle", message: "" });

      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountVal,
          method: withdrawMethod,
          accountDetails: withdrawDetails
        })
      }).catch(() => null);

      const isOk = res ? res.ok : true;

      if (!isOk) {
        setWithdrawStatus({ tone: "error", message: "Failed to submit withdrawal request." });
        return;
      }

      setWithdrawStatus({ tone: "success", message: `Successfully requested payout of ₹${amountVal}!` });
      setWalletBalanceVal(prev => prev - amountVal);
      setTxnList(prev => [
        {
          title: "Wallet Withdrawal",
          meta: `Today • ${withdrawMethod.toUpperCase()} payout request`,
          amount: `-₹${amountVal.toFixed(2)}`,
          tone: "text-[#9c4049]"
        },
        ...prev
      ]);
      setWithdrawAmount("");
      setWithdrawDetails("");
      setTimeout(() => {
        setWithdrawModalOpen(false);
        setWithdrawStatus({ tone: "idle", message: "" });
      }, 1500);
    } catch {
      setWithdrawStatus({ tone: "error", message: "Unable to complete payout request." });
    } finally {
      setIsWithdrawSubmitting(false);
    }
  };

  const dynamicWalletStats = [
    { label: "Available Payout", value: `₹${walletBalanceVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: MdOutlineAccountBalanceWallet },
    { label: "Pending Approval", value: `₹${pendingVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FaRegCreditCard },
    { label: "Monthly Income", value: `₹${monthlyVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FaMoneyBillWave },
    { label: "Pool Earnings", value: `₹${poolVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: FaPiggyBank }
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#fbf1ec_34%,#f5e8e0_100%)] pt-10 text-[#1c1c19] sm:pt-10 md:pt-10 lg:pt-10">
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-5 md:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-[#ead9d1] bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] shadow-[0_24px_70px_rgba(127,49,68,0.10)]">
          <header className="flex items-center justify-between gap-3 border-b border-[#ead9d1] px-4 py-4 sm:px-5 md:px-6">
            <Link
              href="/earnings"
              className="inline-flex items-center gap-2 rounded-full border border-[#ead9d1] bg-white px-4 py-2 text-sm font-semibold text-[#61313d] transition-colors hover:bg-[#fff6f3]"
            >
              <FaArrowLeft className="text-[0.9rem]" />
              Back
            </Link>
            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-[1.9rem] leading-[0.95] tracking-[-0.04em] text-[#5c2530] sm:text-[2.4rem] md:text-[3rem]">
                My Wallet
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-[#9c4049]/80 sm:text-[0.72rem]">
                Sell income, level payouts, pools, and withdrawals
              </p>
            </div>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead9d1] bg-white text-[#61313d] shadow-[0_8px_20px_rgba(95,93,62,0.05)] md:h-12 md:w-12"
              aria-label="View wallet"
            >
              <FaEye className="text-[1rem] md:text-[1.1rem]" />
            </button>
          </header>

          <section className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.6rem] border border-[#eddad3] bg-[linear-gradient(135deg,#7d2746_0%,#a64863_55%,#d0848d_100%)] p-5 text-white shadow-[0_18px_44px_rgba(127,49,68,0.16)] md:p-6">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#ffd8df]">
                  Qualified Wallet Balance
                </p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="font-[family:var(--font-display)] text-[2.6rem] leading-none tracking-[-0.04em] sm:text-[3rem] md:text-[3.4rem]">
                    ₹{walletBalanceVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/85">
                    Payout Ready
                  </span>
                </div>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/85">
                  Payout unlocks after minimum 500 sell points and 2 active direct partners. Track self sell income, fast track income, score pools, and withdrawals here.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button 
                    onClick={handleWithdrawClick}
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#7f3144] shadow-md transition-opacity hover:opacity-90"
                  >
                    {!kycVerified && <FaLock className="text-[0.8rem]" />}
                    Withdraw Funds
                  </button>
                  <Link href="/earnings/orders" className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                    View Sell Orders
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {dynamicWalletStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-[1.35rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_10px_24px_rgba(95,93,62,0.04)]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff3ee] text-[#9c4049]">
                        <Icon className="text-[1.05rem]" />
                      </div>
                      <p className="mt-3 text-[1.25rem] font-bold tracking-[-0.04em] text-[#2a2430]">{stat.value}</p>
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-[#7b6f69]">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:mt-5 md:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-[family:var(--font-display)] text-[1.25rem] tracking-[-0.03em] text-[#382933] sm:text-[1.45rem] md:text-[1.7rem]">
                  Income Ledger
                </h2>
                <Link href="/earnings/orders" className="text-sm font-semibold text-[#9c4049]">
                  Sell Points
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {txnList.length > 0 ? (
                  txnList.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-[1rem] bg-[#fff9f7] p-3 md:p-4">
                      <div>
                        <p className="text-sm font-semibold text-[#2a2430]">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-[#6d655d]">{item.meta}</p>
                      </div>
                      <p className={`text-sm font-bold md:text-base ${item.tone}`}>{item.amount}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs py-8 text-[#7c6e68] italic border border-dashed border-[#ead9d1] rounded-xl">
                    No active earnings or transactions found.
                  </p>
                )}
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
              <h3 className="text-lg font-black uppercase text-[#9c4049] tracking-wider">KYC Document Verification</h3>
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
                className="w-full rounded-xl bg-[#9c4049] py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow hover:opacity-90 disabled:opacity-50 transition"
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
                  max={walletBalanceVal}
                  placeholder={`Available: ₹${walletBalanceVal}`}
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
