import Image from "next/image";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  FaChevronRight,
  FaCrown,
  FaEllipsisH,
  FaRegStar,
  FaShareAlt,
  FaUsers
} from "react-icons/fa";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { getPartnerDashboardData, getPartnerReferralsList } from "@/lib/server/partner-dashboard";
import { MODEL_ASSETS } from "@/lib/fashion-assets";
import CopyInviteButton from "@/components/CopyInviteButton";

function buildSummaryCards(totalTeam: number, teamSellPoints: number, score: string, status: string) {
  return [
    { label: "Total Team", value: `${totalTeam}`, sub: "Members", icon: FaUsers },
    { label: "Team Sales", value: `₹${teamSellPoints.toLocaleString("en-IN")}`, sub: "This Month", icon: MdOutlineCurrencyRupee },
    { label: "Rank", value: score, sub: "Unlocked", icon: FaRegStar },
    { label: "Payout Status", value: status, sub: "Qualified", icon: FaCrown }
  ];
}

const level1 = [
  { name: "Priya S.", amount: "₹9,000", avatar: MODEL_ASSETS.western, members: "3 Members", crown: true },
  { name: "Neha R.", amount: "₹7,700", avatar: MODEL_ASSETS.traditional, members: "3 Members" },
  { name: "Anjali K.", amount: "₹10,400", avatar: MODEL_ASSETS.couture, members: "3 Members" }
];

const level2Clusters = [
  {
    label: "Level 2",
    members: "9 Members",
    items: [
      { name: "Riya M.", amount: "₹3,600", avatar: MODEL_ASSETS.minimal },
      { name: "Mira P.", amount: "₹4,480", avatar: MODEL_ASSETS.formal },
      { name: "Aanya J.", amount: "₹3,300", avatar: MODEL_ASSETS.editorial }
    ],
    more: "+9 More"
  },
  {
    label: "Level 2",
    members: "9 Members",
    items: [
      { name: "Tara N.", amount: "₹4,800", avatar: MODEL_ASSETS.western },
      { name: "Isha D.", amount: "₹2,940", avatar: MODEL_ASSETS.traditional },
      { name: "Sana L.", amount: "₹4,060", avatar: MODEL_ASSETS.couture }
    ],
    more: "+8 More"
  },
  {
    label: "Level 2",
    members: "9 Members",
    items: [
      { name: "Ritu", amount: "₹1,560", avatar: MODEL_ASSETS.minimal },
      { name: "Meera", amount: "₹1,680", avatar: MODEL_ASSETS.formal },
      { name: "Pooja", amount: "₹1,240", avatar: MODEL_ASSETS.editorial }
    ],
    more: "+10 More"
  }
];

const level3Clusters = [
  [
    { name: "Kriti", amount: "₹1,900", avatar: MODEL_ASSETS.western },
    { name: "Anita", amount: "₹1,180", avatar: MODEL_ASSETS.traditional },
    { name: "Ira", amount: "₹1,420", avatar: MODEL_ASSETS.couture }
  ],
  [
    { name: "Nisha", amount: "₹1,360", avatar: MODEL_ASSETS.minimal },
    { name: "Rhea", amount: "₹1,640", avatar: MODEL_ASSETS.formal },
    { name: "Palak", amount: "₹1,300", avatar: MODEL_ASSETS.editorial }
  ],
  [
    { name: "Sara", amount: "₹1,780", avatar: MODEL_ASSETS.western },
    { name: "Meera", amount: "₹1,580", avatar: MODEL_ASSETS.traditional },
    { name: "Asha", amount: "₹1,340", avatar: MODEL_ASSETS.couture }
  ]
];

const teamSummary = [
  { label: "Level 1", members: "3 Members", amount: "₹27,100" },
  { label: "Level 2", members: "9 Members", amount: "₹14,460" },
  { label: "Level 3", members: "27 Members", amount: "₹7,440" },
  { label: "Total", members: "39 Members", amount: "₹49,000" }
];

const topPerformers = [
  { name: "Neha R.", amount: "₹10,400", badge: "Crown Seller" },
  { name: "Anjali K.", amount: "₹9,060", badge: "Growth Lead" },
  { name: "Priya S.", amount: "₹7,700", badge: "Style Mentor" }
];

function StatCard({
  label,
  value,
  sub,
  icon: Icon
}: {
  label: string;
  value: string;
  sub: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.2rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_10px_24px_rgba(95,93,62,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8b837b]">
          {label}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff3ee] text-[#9c4049]">
          <Icon className="text-[0.95rem]" />
        </span>
      </div>
      <p className="mt-3 text-[1.2rem] font-bold tracking-[-0.04em] text-[#2a2430] md:text-[1.35rem]">
        {value}
      </p>
      <p className="mt-1 text-[0.72rem] uppercase tracking-[0.12em] text-[#7b6f69]">
        {sub}
      </p>
    </div>
  );
}

function AvatarNode({
  name,
  amount,
  avatar,
  crown = false,
  size = "md"
}: {
  name: string;
  amount: string;
  avatar: string;
  crown?: boolean;
  size?: "root" | "md" | "sm";
}) {
  const ring =
    size === "root"
      ? "h-28 w-28 md:h-32 md:w-32 border-[5px] shadow-[0_0_0_10px_rgba(239,209,193,0.55),0_20px_44px_rgba(127,49,68,0.18)]"
      : size === "md"
        ? "h-20 w-20 md:h-24 md:w-24 border-[4px] shadow-[0_0_0_8px_rgba(239,209,193,0.42),0_16px_32px_rgba(127,49,68,0.12)]"
        : "h-12 w-12 md:h-14 md:w-14 border-[2px] shadow-[0_0_0_6px_rgba(239,209,193,0.30),0_12px_24px_rgba(127,49,68,0.08)]";

  const labelSize = size === "root" ? "px-5 py-2 text-sm" : size === "md" ? "px-4 py-1.5 text-xs" : "px-3 py-1 text-[0.65rem]";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`relative overflow-hidden rounded-full border-[#edc7b9] bg-[#fff1eb] flex items-center justify-center ${ring}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),rgba(255,255,255,0)_58%)]" />
          <span className="text-[2rem] font-bold text-[#9c4049] uppercase">
            {name.charAt(0)}
          </span>
        </div>

        <div className="absolute -inset-3 -z-10 rounded-full bg-[radial-gradient(circle,rgba(215,162,77,0.30)_0%,rgba(215,162,77,0.12)_44%,rgba(215,162,77,0)_70%)] blur-md" />

        {crown ? (
          <div className="absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#fff7f3] bg-[#7f3144] text-white shadow-[0_10px_20px_rgba(127,49,68,0.18)]">
            <FaCrown className="text-[0.75rem]" />
          </div>
        ) : null}
      </div>

      <div className={`mt-3 rounded-full bg-[#d89c4c] font-semibold text-white shadow-[0_8px_18px_rgba(127,49,68,0.12)] ${labelSize}`}>
        {name}
      </div>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#7b6f69]">
        {amount}
      </p>
    </div>
  );
}

function SmallNode({
  name,
  amount,
  avatar,
  moreLabel
}: {
  name: string;
  amount: string;
  avatar: string;
  moreLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#f0d9cf] bg-[#fff1eb] shadow-[0_10px_22px_rgba(95,93,62,0.08)] md:h-14 md:w-14 flex items-center justify-center">
        <span className="text-xl font-bold text-[#9c4049] uppercase">
          {name.charAt(0)}
        </span>
      </div>
      <div className="text-center">
        <p className="text-[0.72rem] font-semibold text-[#2a2430]">{name}</p>
        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-[#7b6f69]">
          {amount}
        </p>
        {moreLabel ? (
          <span className="mt-2 inline-flex rounded-full border border-[#e8d5c8] bg-[#fff7f3] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#9c4049]">
            {moreLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function LevelBadge({
  title,
  members,
  tone = "muted"
}: {
  title: string;
  members: string;
  tone?: "muted" | "accent";
}) {
  return (
    <div
      className={`rounded-full border px-4 py-3 text-center shadow-[0_10px_22px_rgba(95,93,62,0.05)] ${
        tone === "accent"
          ? "border-[#d8a18c] bg-[#fff6f0] text-[#7a2e43]"
          : "border-[#e8d9cf] bg-white text-[#6c635e]"
      }`}
    >
      <p className="text-[0.72rem] uppercase tracking-[0.16em]">{title}</p>
      <p className="mt-1 text-sm font-semibold">{members}</p>
    </div>
  );
}

function TreeNode({
  name,
  amount,
  avatar,
  crown,
  isOpenSlot,
  isRoot,
  moreLabel
}: {
  name: string;
  amount: string;
  avatar: string;
  crown?: boolean;
  isOpenSlot?: boolean;
  isRoot?: boolean;
  moreLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center w-[120px]">
      <div className="relative">
        <div className={`relative overflow-hidden rounded-full border-2 bg-white flex items-center justify-center transition-all duration-300 ${
          isRoot 
            ? "h-16 w-16 border-[#d89c4c] shadow-[0_0_15px_rgba(216,156,76,0.3)] hover:scale-105" 
            : isOpenSlot
              ? "h-12 w-12 border-dashed border-[#d8c5be] bg-[#fffcfb] hover:bg-[#fff6f2]"
              : "h-12 w-12 border-[#9c4049] shadow-[0_0_10px_rgba(156,64,73,0.15)] hover:scale-105"
        }`}>
          {isOpenSlot ? (
            <div className="text-[#cbb3aa] font-medium text-lg">+</div>
          ) : (
            <span className="text-xl font-bold text-[#9c4049] uppercase">
              {name.charAt(0)}
            </span>
          )}
        </div>
        {crown && !isOpenSlot && (
          <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#7f3144] text-white border border-white text-[8px]">
            👑
          </div>
        )}
      </div>
      <div className="mt-1.5 w-full text-center px-1">
        <p className={`text-[11px] font-bold truncate leading-tight ${isOpenSlot ? "text-[#b0a299]" : "text-[#2a2430]"}`}>
          {name}
        </p>
        <p className="text-[9px] uppercase tracking-wider text-[#9c8e85] font-medium">
          {amount}
        </p>
        {moreLabel && (
          <span className="mt-1 inline-flex rounded-full bg-[#fff0f3] border border-[#e8d5c8] px-2 py-0.5 text-[8px] font-bold text-[#9c4049] uppercase tracking-wider">
            {moreLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default async function ReferralsPage() {
  const partnerData = await getPartnerDashboardData();
  const dashboard = partnerData?.dashboard;
  const businessPlan = partnerData?.businessPlan;
  const referralCode = partnerData?.user?.referralCode || "";
  const partnerReferralCode = partnerData?.user?.partnerReferralCode || referralCode;

  const referralsData = await getPartnerReferralsList();
  const dbL1 = referralsData?.level1 || [];
  const dbL2 = referralsData?.level2 || [];
  const dbL3 = referralsData?.level3 || [];

  const totalTeam = dbL1.length + dbL2.length + dbL3.length;
  const l1SP = dbL1.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const l2SP = dbL2.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const l3SP = dbL3.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const teamSellPoints = l1SP + l2SP + l3SP;

  const score = dashboard?.rank || "Starter";
  const status =
    (dashboard?.sellPointsTotal ?? 0) >= (businessPlan?.minimumPayoutSellPoints ?? 500) &&
    (dashboard?.activeDirects ?? 0) >= (businessPlan?.minimumActiveDirects ?? 2)
      ? "Qualified"
      : "Not ready";
  const summaryCards = buildSummaryCards(totalTeam, dashboard?.sellPointsTotal ?? 0, score, status);

  const level1 = dbL1.slice(0, 3).map((r: any, idx: number) => ({
    id: r.id,
    name: r.name,
    amount: `₹${(r.totalSP || 0).toLocaleString('en-IN')}`,
    avatar: [MODEL_ASSETS.western, MODEL_ASSETS.traditional, MODEL_ASSETS.couture][idx % 3],
    members: `${r.ordersCount || 0} Order${r.ordersCount !== 1 ? 's' : ''}`,
    crown: (r.ordersCount || 0) > 0
  }));
  while (level1.length < 3) {
    level1.push({ id: "", name: "Open Slot", amount: "₹0", avatar: MODEL_ASSETS.western, members: "No referrals", crown: false });
  }

  const level2 = [...dbL2].sort((a: any, b: any) => (b.totalSP || 0) - (a.totalSP || 0)).slice(0, 3).map((r: any, idx: number) => ({
    id: r.id,
    name: r.name,
    amount: `₹${(r.totalSP || 0).toLocaleString('en-IN')}`,
    avatar: [MODEL_ASSETS.minimal, MODEL_ASSETS.formal, MODEL_ASSETS.editorial][idx % 3],
    members: `${r.ordersCount || 0} Order${r.ordersCount !== 1 ? 's' : ''}`,
    crown: false
  }));
  while (level2.length < 3) {
    level2.push({ id: "", name: "Open Slot", amount: "₹0", avatar: MODEL_ASSETS.minimal, members: "No referrals", crown: false });
  }

  const level3 = [...dbL3].sort((a: any, b: any) => (b.totalSP || 0) - (a.totalSP || 0)).slice(0, 3).map((r: any, idx: number) => ({
    id: r.id,
    name: r.name,
    amount: `₹${(r.totalSP || 0).toLocaleString('en-IN')}`,
    avatar: [MODEL_ASSETS.traditional, MODEL_ASSETS.couture, MODEL_ASSETS.western][idx % 3],
    members: `${r.ordersCount || 0} Order${r.ordersCount !== 1 ? 's' : ''}`,
    crown: false
  }));
  while (level3.length < 3) {
    level3.push({ id: "", name: "Open Slot", amount: "₹0", avatar: MODEL_ASSETS.traditional, members: "No referrals", crown: false });
  }

  const teamSummary = [
    { label: "Level 1", members: `${dbL1.length} Member${dbL1.length !== 1 ? 's' : ''}`, amount: `₹${l1SP.toLocaleString('en-IN')}` },
    { label: "Level 2", members: `${dbL2.length} Member${dbL2.length !== 1 ? 's' : ''}`, amount: `₹${l2SP.toLocaleString('en-IN')}` },
    { label: "Level 3", members: `${dbL3.length} Member${dbL3.length !== 1 ? 's' : ''}`, amount: `₹${l3SP.toLocaleString('en-IN')}` },
    { label: "Total", members: `${totalTeam} Member${totalTeam !== 1 ? 's' : ''}`, amount: `₹${teamSellPoints.toLocaleString('en-IN')}` }
  ];

  const allTeamMembers = [...dbL1, ...dbL2, ...dbL3];
  const sortedPerformers = [...allTeamMembers].sort((a, b) => (b.totalSP || 0) - (a.totalSP || 0));
  const topPerformers = sortedPerformers.length > 0
    ? sortedPerformers.slice(0, 3).map((u, idx) => ({
        name: u.name,
        amount: `₹${(u.totalSP || 0).toLocaleString('en-IN')}`,
        badge: idx === 0 ? "Crown Seller" : idx === 1 ? "Growth Lead" : "Style Mentor"
      }))
    : [
        { name: "No active leaders", amount: "₹0", badge: "None" }
      ];

  const getX = (index: number, total: number) => {
    return (1200 / (total + 1)) * (index + 1);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] px-4 pb-20 pt-10 text-[#1c1c19] sm:px-5 sm:pt-10 md:px-8 md:pt-10 lg:pt-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-[#ead9d1] bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] shadow-[0_24px_70px_rgba(127,49,68,0.10)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#ead9d1] px-4 py-4 sm:px-5 md:px-6">
            <div>
              <p className="font-[family:var(--font-display)] text-[2rem] leading-[0.95] tracking-[-0.04em] text-[#5c2530] sm:text-[2.5rem] md:text-[3rem]">
                Referral Tree
              </p>
              <p className="mt-1 text-sm text-[#7c6e68]">
                Your network, your strength
              </p>
            </div>
            <Link
              href="/earnings"
              className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd2] bg-white px-4 py-2 text-sm font-semibold text-[#5f5d3e] transition hover:bg-[#f7ece6]"
            >
              Dashboard
              <FaChevronRight className="text-[0.8rem]" />
            </Link>
          </div>

          <section className="p-4 sm:p-5 md:p-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {summaryCards.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="rounded-[1.6rem] border border-[#efdcd3] bg-white p-4 shadow-[0_12px_30px_rgba(95,93,62,0.05)] md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9c4049]">
                      Referral network
                    </p>
                    <h2 className="mt-2 font-[family:var(--font-display)] text-[1.55rem] leading-[1.05] tracking-[-0.04em] text-[#382933] md:text-[2rem]">
                      Build your tree and watch your community rise.
                    </h2>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-[#efd9d1] bg-[#fff7f3] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7a2e43]">
                    All Levels
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <LevelBadge title="You" members="Level 0" tone="accent" />
                  <LevelBadge title="Level 1" members={`${dbL1.length} Node${dbL1.length !== 1 ? "s" : ""}`} />
                  <LevelBadge title="Level 2" members={`${dbL2.length} Node${dbL2.length !== 1 ? "s" : ""}`} />
                  <LevelBadge title="Level 3" members={`${dbL3.length} Node${dbL3.length !== 1 ? "s" : ""}`} />
                </div>

                <div className="mt-5 rounded-[1.8rem] border border-[#f2e2db] bg-[linear-gradient(180deg,#fffaf7_0%,#fff5ef_100%)] px-4 py-6 md:px-6 md:py-8 overflow-x-auto">
                  <div className="relative mx-auto flex min-w-[800px] max-w-5xl flex-col items-center">
                    <div className="relative z-10 mx-auto flex w-full flex-col items-center">
                      <div className="relative pb-4">
                        <AvatarNode
                          name="You"
                          amount="Level 0"
                          avatar={MODEL_ASSETS.traditional}
                          crown
                          size="root"
                        />
                      </div>

                      <div className="w-full flex justify-center h-20 w-full relative">
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
                           <path d="M600 0 C600 50, 200 50, 200 100" stroke="#e7c5c0" strokeWidth="4" fill="none" strokeLinecap="round" />
                           <path d="M600 0 C600 50, 600 50, 600 100" stroke="#e7c5c0" strokeWidth="4" fill="none" strokeLinecap="round" />
                           <path d="M600 0 C600 50, 1000 50, 1000 100" stroke="#e7c5c0" strokeWidth="4" fill="none" strokeLinecap="round" />
                        </svg>
                      </div>

                      <div className="relative w-full">
                        <div className="grid pt-0" style={{ gridTemplateColumns: `repeat(${level1.length}, minmax(0, 1fr))` }}>
                          {level1.map((member, index) => (
                            <div key={`${member.name}-${index}`} className="relative flex flex-col items-center px-4">
                              <div className="w-[4px] h-6 bg-[#e7c5c0] mb-2 rounded-full relative">
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#d7a24d]"></div>
                              </div>
                              <AvatarNode name={member.name} amount={member.amount} avatar={member.avatar} crown={member.crown} size="md" />
                              <div className="mt-3 rounded-full border border-[#eed8ce] bg-white px-4 py-2 text-center shadow-[0_8px_18px_rgba(95,93,62,0.05)] whitespace-nowrap">
                                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[#9c4049]">Level 1</p>
                                <p className="mt-1 text-[0.72rem] text-[#7b6f69]">{member.members || "Referral partner"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="relative mt-2 w-full">
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${level2.length}, minmax(0, 1fr))` }}>
                          {level2.map((member, index) => (
                            <div key={`${member.name}-${index}`} className="relative flex flex-col items-center px-4">
                              <div className="w-[4px] h-14 bg-[#d28da3]/60 mb-2 rounded-full relative">
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#d28da3]"></div>
                              </div>
                              <AvatarNode name={member.name} amount={member.amount} avatar={member.avatar} crown={false} size="md" />
                              <div className="mt-3 rounded-full border border-[#eed8ce] bg-white px-4 py-2 text-center shadow-[0_8px_18px_rgba(95,93,62,0.05)] whitespace-nowrap">
                                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[#9c4049]">Level 2</p>
                                <p className="mt-1 text-[0.72rem] text-[#7b6f69]">{member.name === "Open Slot" ? "No referrals" : "Active"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="relative mt-2 w-full">
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${level3.length}, minmax(0, 1fr))` }}>
                          {level3.map((member, index) => (
                            <div key={`${member.name}-${index}`} className="relative flex flex-col items-center px-4">
                              <div className="w-[4px] h-14 bg-[#c8b7f0]/60 mb-2 rounded-full relative">
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#c8b7f0]"></div>
                              </div>
                              <AvatarNode name={member.name} amount={member.amount} avatar={member.avatar} crown={false} size="md" />
                              <div className="mt-3 rounded-full border border-[#eed8ce] bg-white px-4 py-2 text-center shadow-[0_8px_18px_rgba(95,93,62,0.05)] whitespace-nowrap">
                                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[#9c4049]">Level 3</p>
                                <p className="mt-1 text-[0.72rem] text-[#7b6f69]">{member.name === "Open Slot" ? "No referrals" : "Active"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 xl:sticky xl:top-6 xl:self-start">
                <div className="rounded-[1.4rem] border border-[#f0ddd6] bg-[#fff9f7] p-4 shadow-[0_10px_24px_rgba(95,93,62,0.04)]">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9c4049]">
                    Leader legend
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      ["You", "#e5b75f"],
                      ["Level 1", "#d28da3"],
                      ["Level 2", "#c8b7f0"],
                      ["Level 3", "#86a4ea"]
                    ].map(([label, color]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm text-[#5e5a54]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_10px_24px_rgba(95,93,62,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#9c4049]">
                        Top performers
                      </p>
                      <h3 className="mt-2 font-[family:var(--font-display)] text-[1.4rem] tracking-[-0.03em] text-[#382933]">
                        Growth leaders
                      </h3>
                    </div>
                    <Link href="/earnings/team" className="text-sm font-semibold text-[#9c4049]">
                      View Team
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {topPerformers.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-[1rem] bg-[#fff9f7] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7f3144] text-[0.72rem] font-bold text-white">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#2a2430]">{item.name}</p>
                            <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-[#7b6f69]">
                              {item.badge}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#2a2430]">{item.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-[#f0ddd6] bg-[linear-gradient(120deg,#fff1f4_0%,#fff9f6_100%)] p-4 shadow-[0_10px_24px_rgba(95,93,62,0.04)]">
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#9c4049]">
                    Invite & earn
                  </p>
                  <p className="mt-2 font-[family:var(--font-display)] text-[1.4rem] leading-[1.08] tracking-[-0.03em] text-[#7a2e43] mb-4">
                    The more you empower, the more you earn.
                  </p>
                  <CopyInviteButton referralCode={referralCode} partnerReferralCode={partnerReferralCode} variant="secondary" />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {teamSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_10px_24px_rgba(95,93,62,0.04)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#382933]">{item.label}</p>
                    <span className="text-xs uppercase tracking-[0.12em] text-[#9c4044]">
                      {item.members}
                    </span>
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-[1.6rem] font-bold tracking-[-0.04em] text-[#2a2430]">
                      {item.amount}
                    </p>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#7b6f69]">
                      This month
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
