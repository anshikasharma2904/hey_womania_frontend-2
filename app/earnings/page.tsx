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
  { label: "Annual Club", icon: FaCrown, href: "/earnings/annual-club" },
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
    title: "Self Sell Income",
    copy: "10% of the partner’s own order value."
  },
  {
    title: "Fast Track Level Income",
    copy: "Level 1 = 5%, Level 2 = 3%, Level 3 = 2%."
  },
  {
    title: "Score Income",
    copy: "Monthly Glam, Style, Gorgeous, and Super Womania score pools."
  },
  {
    title: "Dream Funds",
    copy: "Dream Car Fund and Dream House Fund based on continuous performance."
  },
  {
    title: "Partnership Bonus",
    copy: "5-level bonus after Style Score qualification."
  },
  {
    title: "Smart Seller Pool",
    copy: "3-month achievement pool with 12-month sharing."
  },
  {
    title: "Annual Club",
    copy: "Super Club, Mega Club, and Luxury Life Club rewards."
  },
  {
    title: "Timely Rewards",
    copy: "Weekly, monthly, and festival bonanzas."
  }
];

const scoreRules = [
  {
    title: "Glam Score",
    rule: "2,500 team volume",
    pool: "15% of company turnover divided by Glam Score achievers"
  },
  {
    title: "Style Score",
    rule: "25,000 team volume",
    pool: "12% of company turnover divided by Style Score achievers"
  },
  {
    title: "Gorgeous Score",
    rule: "100,000 team volume",
    pool: "10% of company turnover divided by Gorgeous Score achievers"
  },
  {
    title: "Super Womania Score",
    rule: "2 Gorgeous Scores in a month",
    pool: "10% of company turnover divided by Super Womania achievers"
  }
];

const clubRules = [
  {
    title: "Super Club",
    rule: "50 lakh yearly volume",
    pool: "1% of yearly turnover"
  },
  {
    title: "Mega Club",
    rule: "2 crore yearly volume",
    pool: "1.5% of yearly turnover"
  },
  {
    title: "Luxury Life Club",
    rule: "5 crore yearly volume",
    pool: "2.5% of yearly turnover"
  }
];

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#fbf1ec_34%,#f5e8e0_100%)] pt-10 text-[#1c1c19] sm:pt-10 md:pt-10 lg:pt-10">
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-5 md:px-8 md:pb-20 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-[#ead9d1] bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] shadow-[0_24px_70px_rgba(127,49,68,0.10)]">
          <header className="flex items-center justify-between gap-3 border-b border-[#ead9d1] px-4 py-4 sm:px-5 md:px-6">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead9d1] bg-white text-[#61313d] shadow-[0_8px_20px_rgba(95,93,62,0.05)] md:h-12 md:w-12"
              aria-label="Open menu"
            >
              <FaBars className="text-[1rem] md:text-[1.1rem]" />
            </button>

            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-[2rem] leading-[0.95] tracking-[-0.04em] text-[#5c2530] sm:text-[2.5rem] md:text-[3.4rem]">
                HeyWomaniyaa
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-[#9c4049]/80 sm:text-[0.72rem]">
                Empowered Women, Empower Women
              </p>
            </div>

            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#ead9d1] bg-white text-[#61313d] shadow-[0_8px_20px_rgba(95,93,62,0.05)] md:h-12 md:w-12"
              aria-label="Notifications"
            >
              <FaBell className="text-[1rem] md:text-[1.1rem]" />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ea6b69] px-1 text-[0.65rem] font-semibold text-white">
                3
              </span>
            </button>
          </header>

          <section className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
            <div className="grid gap-4 rounded-[1.75rem] border border-[#ebdad2] bg-[linear-gradient(180deg,#fff7f5_0%,#fffdfb_100%)] p-4 shadow-[0_18px_44px_rgba(127,49,68,0.08)] md:grid-cols-[1.15fr_0.85fr] md:gap-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
                <div className="relative flex items-center gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-[4px] border-[#edc7b9] bg-[#fff1eb] shadow-[0_14px_28px_rgba(156,64,73,0.12)] sm:h-28 sm:w-28">
                    <Image
                      src={MODEL_ASSETS.traditional}
                      alt="Partner profile"
                      fill
                      sizes="(max-width: 640px) 96px, 112px"
                      className="object-contain object-bottom"
                      priority
                    />
                  </div>

                  <div className="absolute -bottom-1 left-16 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#fff7f3] bg-[#7f3144] text-white shadow-[0_10px_20px_rgba(127,49,68,0.18)]">
                    <span className="text-[0.95rem]">👑</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="font-[family:var(--font-display)] text-[1.75rem] leading-[1.05] tracking-[-0.04em] text-[#382933] sm:text-[2rem] md:text-[2.25rem]">
                    Hello, {displayName.split(" ")[0]}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 items-center">
                    <div className="inline-flex items-center rounded-full border border-[#f1c9d1] bg-[#fff2f5] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#9c4049]">
                      Womenia Star
                    </div>
                    <PartnerDocModal />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#695c56]">
                    ID: {referralCode}
                    <br />
                    Independent Partner
                  </p>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-[#eddad3] bg-[linear-gradient(180deg,#fff_0%,#fff7f3_100%)] p-4 md:p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9c4049]/78">
                  My Balance
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[1.9rem] font-bold tracking-[-0.04em] text-[#3a2630] sm:text-[2.2rem] md:text-[2.6rem]">
                    ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-[#7c6e68]">
                    <span className="material-symbols-outlined">visibility</span>
                  </span>
                </div>
                <Link
                  href="/earnings/wallet"
                  className="mt-4 inline-flex rounded-xl bg-[#7f3144] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
                    className="rounded-[1.15rem] border border-[#f0ddd6] bg-white px-3 py-4 text-center shadow-[0_10px_24px_rgba(95,93,62,0.04)] md:px-4 md:py-5"
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3ee] text-[#9c4044] md:h-11 md:w-11">
                      <Icon className="text-[1rem] md:text-[1.1rem]" />
                    </div>
                    <p className="mt-2 text-[1.1rem] font-bold tracking-[-0.04em] text-[#2a2430] md:text-[1.4rem]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-[#7b6f69] md:text-xs">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.35rem] bg-[linear-gradient(120deg,#7d2746_0%,#a64863_45%,#d0848d_100%)] px-4 py-5 text-white shadow-[0_14px_38px_rgba(125,39,70,0.22)] md:mt-5 md:rounded-[1.5rem] md:px-6 md:py-6">
              <p className="font-[family:var(--font-display)] text-[1.55rem] italic tracking-[-0.04em] sm:text-[1.8rem] md:text-[2.25rem]">
                You are Amazing,
              </p>
              <p className="mt-1 text-[1rem] italic text-[#ffd8df] sm:text-[1.15rem] md:text-[1.4rem]">
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
                    className="group rounded-[1.1rem] border border-[#f0ddd6] bg-white p-3 text-center shadow-[0_10px_22px_rgba(95,93,62,0.04)] transition-all hover:-translate-y-1 hover:border-[#d9b1a6] md:rounded-[1.35rem] md:p-4"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#f0ddd6] bg-[#fff7f3] text-[#b26a6d] transition-colors group-hover:bg-[#9c4049] group-hover:text-white md:h-14 md:w-14">
                      <Icon className="text-[1.05rem] md:text-[1.15rem]" />
                    </div>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1%em] text-[#564f49] md:mt-3 md:text-[0.72rem] md:tracking-[0.12em]">
                      {item.label}
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 rounded-[1.3rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:mt-5 md:rounded-[1.6rem] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-[family:var(--font-display)] text-[1.25rem] tracking-[-0.03em] text-[#382933] sm:text-[1.45rem] md:text-[1.7rem]">
                  My Recent Order
                </h2>
                <Link href="/earnings/orders" className="text-sm font-semibold text-[#9c4049]">
                  View All
                </Link>
              </div>

              {recentOrder ? (
                <div className="mt-4 flex items-center gap-3 rounded-[1rem] bg-[#fff9f7] p-3 md:gap-4 md:rounded-[1.2rem] md:p-4">
                  <div className="relative h-20 w-16 overflow-hidden rounded-[0.9rem] bg-[#f5ece4] md:h-24 md:w-20 md:rounded-[1rem]">
                    <Image
                      src={recentOrder.items?.[0]?.img || MODEL_ASSETS.traditional}
                      alt="Recent order"
                      fill
                      sizes="(max-width: 768px) 64px, 80px"
                      className="object-contain object-bottom"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2a2430] md:text-base">
                      {recentOrder.items?.[0]?.name || "Product Bundle"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#6d655d] md:text-sm md:leading-6">
                      Order ID: #{recentOrder.orderNumber || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#2a2430] md:text-xl">{recentOrder.total || "₹0"}</p>
                    <p className="mt-2 text-xs font-semibold text-[#4f9158] md:text-sm">
                      {recentOrder.status || "Pending"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs py-8 text-[#7c6e68] italic border border-dashed border-[#ead9d1] rounded-xl mt-4">
                  No orders placed yet.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-[1.3rem] border border-[#f0ddd6] bg-[linear-gradient(120deg,#fff1f4_0%,#fff9f6_100%)] px-4 py-4 md:mt-5 md:flex-row md:items-center md:rounded-[1.6rem] md:px-5 md:py-5">
              <div>
                <p className="font-[family:var(--font-display)] text-[1.4rem] tracking-[-0.03em] text-[#7a2e43] sm:text-[1.65rem] md:text-[2rem]">
                  Together We Rise,
                </p>
                <p className="mt-1 text-base italic text-[#b26a6d] md:text-lg">
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
