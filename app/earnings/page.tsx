import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import CopyInviteButton from "@/components/CopyInviteButton";
import PartnerDocModal from "@/components/PartnerDocModal";
import {
  FaBell,
  FaBars,
  FaCalculator,
  FaCrown,
  FaHeadset,
  FaHome,
  FaShoppingBag,
  FaStore,
  FaUsers
} from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { MdLeaderboard, MdOutlineWallet } from "react-icons/md";
import { RiShoppingBag3Line, RiStore3Line } from "react-icons/ri";
import { MODEL_ASSETS } from "@/lib/fashion-assets";

type PartnerDashboardResponse = {
  user?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    rank?: string;
    teamIds?: string[];
    referralCode?: string;
  };
  dashboard?: {
    totalOrders?: number;
    totalReferrals?: number;
    walletBalance?: number;
    rank?: string;
    sellPointsTotal?: number;
    activeDirects?: number;
  };
  businessPlan?: {
    formula?: string;
    minimumPayoutSellPoints?: number;
    minimumActiveDirects?: number;
    selfSellIncome?: string;
    fastTrackIncome?: string[];
    scoreIncome?: Record<string, string>;
    dreamFunds?: Record<string, string>;
    partnershipBonus?: string;
    smartSellerPool?: string;
    annualClubs?: Record<string, string>;
    timelyRewards?: string;
  };
};

const buildPartnerStats = (stats: {
  totalOrders: number;
  totalReferrals: number;
  rank: string;
  activeDirects: number;
}) => [
  { value: `${stats.totalOrders}`, label: "My Orders", icon: FaShoppingBag },
  { value: `${stats.totalReferrals}`, label: "My Referrals", icon: FaUsers },
  { value: stats.rank || "Starter", label: "My Rank", icon: MdLeaderboard },
  { value: `${stats.activeDirects}`, label: "Active Directs", icon: FaUsers }
];

const quickActions = [
  { label: "Shop Now", icon: RiStore3Line, href: "/" },
  { label: "My Orders", icon: RiShoppingBag3Line, href: "/earnings/orders" },
  { label: "My Referrals", icon: FaUsers, href: "/earnings/referrals" },
  { label: "My Team", icon: FaUsers, href: "/earnings/team" },
  { label: "My Wallet", icon: MdOutlineWallet, href: "/earnings/wallet" },
  { label: "Rank & Rewards", icon: MdLeaderboard, href: "/earnings/rank-rewards" },
  { label: "Programs", icon: FaCrown, href: "/earnings/annual-club" },
  { label: "Smart Seller Pool", icon: FaStore, href: "/earnings/smart-seller-pool" },
  { label: "Score Income", icon: FaChartLine, href: "/earnings/score-income" },
  { label: "Help Center", icon: FaHeadset, href: "/customer-support" }
];

const mobileNavItems = [
  { label: "Home", icon: FaHome, href: "/" },
  { label: "Shop", icon: FaShoppingBag, href: "/category" },
  { label: "Community", icon: FaUsers, href: "/earnings" },
  { label: "Messages", icon: FaBell, href: "/contact" },
  { label: "Profile", icon: HiMiniShoppingBag, href: "/account" }
];

const incomeCards = [
  {
    title: "Level Income",
    copy: "Self Sell: 5%, Level 1: 2%, Level 2: 1%, Level 3: 0.5%."
  },
  {
    title: "Monthly Bonus",
    copy: "0.5% at ₹25k, 1% at ₹50k, and 2% at ₹1L+ self sell."
  },
  {
    title: "Womaniyaa Point",
    copy: "Maintain ₹5L team sell (incl. ₹10k self) for 3 months. Earns 1% turnover share for 1 year."
  },
  {
    title: "Super Womaniyaa Point",
    copy: "Maintain ₹2.5Cr team sell (incl. ₹25k self) for 6 months. Earns 1% turnover share for 3 years."
  }
];

const scoreRules: any[] = [];
const clubRules: any[] = [];

async function loadPartnerDashboard(): Promise<PartnerDashboardResponse | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("hey_womania_session");

    if (!session) {
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/partner/dashboard`,
      {
        headers: {
          Cookie: `hey_womania_session=${session.value}`
        },
        cache: "no-store"
      }
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

export default async function EarningsPage() {
  const partnerData = await loadPartnerDashboard();
  const user = partnerData?.user;
  const dashboard = partnerData?.dashboard;
  const businessPlan = partnerData?.businessPlan;
  const displayName =
    user?.name?.trim() || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Partner";
  const displayRank = dashboard?.rank || user?.rank || "Starter";
  const totalOrders = dashboard?.totalOrders ?? 0;
  const totalReferrals = dashboard?.totalReferrals ?? user?.teamIds?.length ?? 0;
  const walletBalance = dashboard?.walletBalance ?? 0;
  const activeDirects = dashboard?.activeDirects ?? 0;
  const referralCode = user?.referralCode || "N/A";
  const partnerStats = buildPartnerStats({
    totalOrders,
    totalReferrals,
    rank: displayRank,
    activeDirects
  });

  const recentOrder = (partnerData as any)?.recentOrder;

  return (
    <main className="min-h-screen bg-[#fcf9f4] pt-10 text-[#1c1c19] sm:pt-10 md:pt-10 lg:pt-10">
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-5 md:px-8 md:pb-20 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-[#e6dcd4] bg-white shadow-[0_24px_70px_rgba(95,93,62,0.06)]">
          <header className="flex items-center justify-between gap-3 border-b border-[#e6dcd4] px-4 py-4 sm:px-5 md:px-6">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6dcd4] bg-[#fcf9f4] text-[#5f5d3e] shadow-[0_8px_20px_rgba(95,93,62,0.05)] md:h-12 md:w-12"
              aria-label="Open menu"
            >
              <FaBars className="text-[1rem] md:text-[1.1rem]" />
            </button>

            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-[2rem] leading-[0.95] tracking-[-0.04em] text-[#5f5d3e] sm:text-[2.5rem] md:text-[3.4rem]">
                HeyWomaniyaa
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-[#5f5d3e]/80 sm:text-[0.72rem]">
                Empowered Women, Empower Women
              </p>
            </div>

            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e6dcd4] bg-[#fcf9f4] text-[#5f5d3e] shadow-[0_8px_20px_rgba(95,93,62,0.05)] md:h-12 md:w-12"
              aria-label="Notifications"
            >
              <FaBell className="text-[1rem] md:text-[1.1rem]" />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9c4049] px-1 text-[0.65rem] font-semibold text-white">
                3
              </span>
            </button>
          </header>

          <section className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
            <div className="grid gap-4 rounded-[1.75rem] border border-[#e6dcd4] bg-[#fcf9f4] p-4 shadow-[0_18px_44px_rgba(95,93,62,0.05)] md:grid-cols-[1.15fr_0.85fr] md:gap-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
                <div className="relative flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-[4px] border-[#e6dcd4] bg-white shadow-[0_14px_28px_rgba(95,93,62,0.08)] sm:h-28 sm:w-28">
                    <Image
                      src={MODEL_ASSETS.traditional}
                      alt="Partner profile"
                      fill
                      sizes="(max-width: 640px) 96px, 112px"
                      className="object-contain object-bottom"
                      priority
                    />
                  </div>

                  <div className="absolute -bottom-1 left-16 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#5f5d3e] text-white shadow-[0_10px_20px_rgba(95,93,62,0.15)]">
                    <span className="text-[0.95rem]">👑</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="font-[family:var(--font-display)] text-[1.75rem] leading-[1.05] tracking-[-0.04em] text-[#1c1c19] sm:text-[2rem] md:text-[2.25rem]">
                    Hello, {displayName.split(" ")[0]}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 items-center">
                    <div className="inline-flex items-center rounded-full border border-[#e6dcd4] bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#5f5d3e]">
                      Womenia Star
                    </div>
                    <PartnerDocModal />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#6d655d]">
                    ID: {referralCode}
                    <br />
                    Independent Partner
                  </p>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-[#e6dcd4] bg-white p-4 md:p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#5f5d3e]/78">
                  My Balance
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[1.9rem] font-bold tracking-[-0.04em] text-[#1c1c19] sm:text-[2.2rem] md:text-[2.6rem]">
                    ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[#6d655d]">
                    <span className="material-symbols-outlined">visibility</span>
                  </span>
                </div>
                <Link
                  href="/earnings/wallet"
                  className="mt-4 inline-flex rounded-xl bg-[#5f5d3e] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  My Wallet
                </Link>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:grid-cols-4">
              {partnerStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-[1.15rem] border border-[#e6dcd4] bg-white px-3 py-4 text-center shadow-[0_10px_24px_rgba(95,93,62,0.04)] md:px-4 md:py-5"
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f4efe8] text-[#5f5d3e] md:h-11 md:w-11">
                      <Icon className="text-[1rem] md:text-[1.1rem]" />
                    </div>
                    <p className="mt-2 text-[1.1rem] font-bold tracking-[-0.04em] text-[#1c1c19] md:text-[1.4rem]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-[#6d655d] md:text-xs">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.35rem] bg-[linear-gradient(120deg,#4a4933_0%,#5f5d3e_45%,#8b8865_100%)] px-4 py-5 text-white shadow-[0_14px_38px_rgba(95,93,62,0.15)] md:mt-5 md:rounded-[1.5rem] md:px-6 md:py-6">
              <p className="font-[family:var(--font-display)] text-[1.55rem] italic tracking-[-0.04em] sm:text-[1.8rem] md:text-[2.25rem]">
                You are Amazing,
              </p>
              <p className="mt-1 text-[1rem] italic text-[#e8e6d9] sm:text-[1.15rem] md:text-[1.4rem]">
                Keep shining.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:grid-cols-5 md:gap-4">
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-[1.1rem] border border-[#e6dcd4] bg-white p-3 text-center shadow-[0_10px_22px_rgba(95,93,62,0.04)] transition-all hover:-translate-y-1 hover:border-[#cac7b9] md:rounded-[1.35rem] md:p-4"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#e6dcd4] bg-[#fcf9f4] text-[#5f5d3e] transition-colors group-hover:bg-[#5f5d3e] group-hover:text-white md:h-14 md:w-14">
                      <Icon className="text-[1.05rem] md:text-[1.15rem]" />
                    </div>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1%em] text-[#6d655d] md:mt-3 md:text-[0.72rem] md:tracking-[0.12em]">
                      {item.label}
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 rounded-[1.3rem] border border-[#e6dcd4] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:mt-5 md:rounded-[1.6rem] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-[family:var(--font-display)] text-[1.25rem] tracking-[-0.03em] text-[#1c1c19] sm:text-[1.45rem] md:text-[1.7rem]">
                  My Recent Order
                </h2>
                <Link href="/earnings/orders" className="text-sm font-semibold text-[#5f5d3e]">
                  View All
                </Link>
              </div>

              {recentOrder ? (
                <div className="mt-4 flex items-center gap-3 rounded-[1rem] bg-[#fcf9f4] p-3 md:gap-4 md:rounded-[1.2rem] md:p-4">
                  <div className="relative h-20 w-16 overflow-hidden rounded-[0.9rem] bg-[#f4efe8] md:h-24 md:w-20 md:rounded-[1rem]">
                    <Image
                      src={recentOrder.items?.[0]?.img || MODEL_ASSETS.traditional}
                      alt="Recent order"
                      fill
                      sizes="(max-width: 768px) 64px, 80px"
                      className="object-contain object-bottom"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1c1c19] md:text-base">
                      {recentOrder.items?.[0]?.name || "Product Bundle"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#6d655d] md:text-sm md:leading-6">
                      Order ID: #{recentOrder.orderNumber || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#1c1c19] md:text-xl">{recentOrder.total || "₹0"}</p>
                    <p className="mt-2 text-xs font-semibold text-[#5f5d3e] md:text-sm">
                      {recentOrder.status || "Pending"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs py-8 text-[#6d655d] italic border border-dashed border-[#e6dcd4] rounded-xl mt-4">
                  No orders placed yet.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-[1.3rem] border border-[#e6dcd4] bg-[#fcf9f4] px-4 py-4 md:mt-5 md:flex-row md:items-center md:rounded-[1.6rem] md:px-5 md:py-5">
              <div>
                <p className="font-[family:var(--font-display)] text-[1.4rem] tracking-[-0.03em] text-[#1c1c19] sm:text-[1.65rem] md:text-[2rem]">
                  Together We Rise,
                </p>
                <p className="mt-1 text-base italic text-[#5f5d3e] md:text-lg">
                  Together We Shine!
                </p>
              </div>
              <div className="w-full md:w-auto">
                <CopyInviteButton referralCode={referralCode} variant="secondary" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
