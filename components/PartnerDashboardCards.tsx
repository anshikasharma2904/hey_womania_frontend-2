"use client";

import { FaCoins, FaWallet, FaUserPlus, FaAward, FaHourglassHalf, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

interface PartnerDashboardCardsProps {
  totalSP: number;
  currentMonthSP: number;
  walletBalance: number;
  pendingIncome: number;
  approvedIncome: number;
  referralCode: string;
  directTeamCount: number;
  kycStatus: string;
}

export function PartnerDashboardCards({
  totalSP,
  currentMonthSP,
  walletBalance,
  pendingIncome,
  approvedIncome,
  referralCode,
  directTeamCount,
  kycStatus
}: PartnerDashboardCardsProps) {
  // Format currency helper
  const formatINR = (amount: number) => {
    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const getKycBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

      {/* Wallet Balance */}
      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6d655d]">
            Wallet Balance
          </p>
          <div className="rounded-full bg-[#fcf9f4] p-3 text-[#5f5d3e]">
            <FaWallet className="text-[1.2rem]" />
          </div>
        </div>
        <h3 className="mt-4 text-3xl font-black tracking-tight text-[#1c1c19]">
          {formatINR(walletBalance)}
        </h3>
        <p className="mt-2 text-xs text-[#8b837b]">Available for withdrawal</p>
      </div>

      {/* Approved Income */}
      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6d655d]">
            Approved Income
          </p>
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
            <FaCheckCircle className="text-[1.2rem]" />
          </div>
        </div>
        <h3 className="mt-4 text-3xl font-black tracking-tight text-emerald-600">
          {formatINR(approvedIncome)}
        </h3>
        <p className="mt-2 text-xs text-[#8b837b]">Cleared and paid out</p>
      </div>

      {/* Pending Income */}
      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6d655d]">
            Pending Income
          </p>
          <div className="rounded-full bg-amber-50 p-3 text-amber-600">
            <FaHourglassHalf className="text-[1.2rem]" />
          </div>
        </div>
        <h3 className="mt-4 text-3xl font-black tracking-tight text-amber-600">
          {formatINR(pendingIncome)}
        </h3>
        <p className="mt-2 text-xs text-[#8b837b]">Awaiting order validation</p>
      </div>

      {/* Referral Team */}
      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6d655d]">
            Referral Code / Team
          </p>
          <div className="rounded-full bg-[#fcf9f4] p-3 text-[#5f5d3e]">
            <FaUserPlus className="text-[1.2rem]" />
          </div>
        </div>
        <h3 className="mt-4 text-2xl font-black tracking-tight text-[#1c1c19] select-all">
          {referralCode}
        </h3>
        <p className="mt-2 text-xs text-[#8b837b]">
          {directTeamCount} direct {directTeamCount === 1 ? "referral" : "referrals"}
        </p>
      </div>

      {/* KYC Status Card */}
      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)] sm:col-span-2 lg:col-span-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#1c1c19]">KYC Verification Status</h4>
            <p className="mt-1 text-xs text-[#6d655d]">
              KYC documents are required to approve withdrawal requests.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${getKycBadgeColor(
              kycStatus
            )}`}
          >
            {kycStatus.toLowerCase() === "approved" ? (
              <FaCheckCircle />
            ) : kycStatus.toLowerCase() === "pending" ? (
              <FaHourglassHalf />
            ) : (
              <FaExclamationCircle />
            )}
            {kycStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
