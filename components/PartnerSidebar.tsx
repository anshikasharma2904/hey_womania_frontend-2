"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaChartLine, 
  FaWallet, 
  FaUsers, 
  FaCoins, 
  FaIdCard, 
  FaMoneyBillWave, 
  FaArrowLeft,
  FaUser,
  FaBoxOpen,
  FaHome,
  FaCreditCard
} from "react-icons/fa";

const partnerLinks = [
  { label: "Dashboard", href: "/partner/dashboard", icon: FaChartLine },
  { label: "Wallet", href: "/partner/wallet", icon: FaWallet },
  { label: "Referral Team", href: "/partner/team", icon: FaUsers },
  { label: "KYC Documents", href: "/partner/kyc", icon: FaIdCard },
  { label: "Withdraw Request", href: "/partner/withdraw", icon: FaMoneyBillWave },
];

const customerLinks = [
  { label: "My Profile", href: "/account/profile", icon: FaUser },
  { label: "My Orders", href: "/account/orders", icon: FaBoxOpen },
  { label: "Saved Addresses", href: "/account/addresses", icon: FaHome },
  { label: "Payment Methods", href: "/account/payments", icon: FaCreditCard },
];

export function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      <div className="rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-6 shadow-[0_18px_40px_rgba(91,77,57,0.06)] backdrop-blur-md">
        {/* Earnings Section */}
        <div className="mb-4 pb-4 border-b border-[#ece6df]">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#5f5d3e]">
            Partner Panel
          </p>
          <h2 className="mt-1.5 text-lg font-bold uppercase tracking-tight text-[#1c1c19]">
            Earning Hub
          </h2>
        </div>

        <nav className="space-y-1.5">
          {partnerLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition duration-300 ${
                  isActive
                    ? "bg-[#5f5d3e] text-white shadow-md shadow-[#5f5d3e]/20"
                    : "text-[#48473d] hover:bg-[#fcf9f4] hover:text-[#5f5d3e]"
                }`}
              >
                <Icon className={`text-[1rem] ${isActive ? "text-white" : "text-[#8b837b]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Customer Options Section */}
        <div className="mt-6 mb-4 pb-4 border-b border-[#ece6df] pt-4 border-t">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#5f5d3e]">
            Shopping & Settings
          </p>
          <h2 className="mt-1.5 text-lg font-bold uppercase tracking-tight text-[#1c1c19]">
            Account details
          </h2>
        </div>

        <nav className="space-y-1.5">
          {customerLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition duration-300 ${
                  isActive
                    ? "bg-[#5f5d3e] text-white shadow-md shadow-[#5f5d3e]/20"
                    : "text-[#48473d] hover:bg-[#fcf9f4] hover:text-[#5f5d3e]"
                }`}
              >
                <Icon className={`text-[1rem] ${isActive ? "text-white" : "text-[#8b837b]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
