import Link from "next/link";
import { FaChevronRight, FaUsers, FaUserPlus, FaShareAlt } from "react-icons/fa";
import { MdLeaderboard, MdOutlineCurrencyRupee } from "react-icons/md";
import { getPartnerDashboardData, getPartnerReferralsList } from "@/lib/server/partner-dashboard";
import CopyInviteButton from "@/components/CopyInviteButton";

const filters = ["All", "Level 1", "Level 2", "Level 3"];

function buildOverviewCards(activeDirects: number, teamSp: number, score: string) {
  return [
    { label: "Active Direct", value: `${activeDirects}`, icon: FaUsers },
    { label: "Monthly Team SP", value: `${teamSp.toLocaleString("en-IN")}`, icon: MdOutlineCurrencyRupee },
    { label: "Unlocked Score", value: score, icon: MdLeaderboard }
  ];
}

export default async function TeamPage() {
  const partnerData = await getPartnerDashboardData();
  const dashboard = partnerData?.dashboard;
  const businessPlan = partnerData?.businessPlan;
  const referralCode = partnerData?.user?.referralCode || "";

  const referralsData = await getPartnerReferralsList();
  const dbL1 = referralsData?.level1 || [];
  const dbL2 = referralsData?.level2 || [];
  const dbL3 = referralsData?.level3 || [];

  const l1SP = dbL1.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const l2SP = dbL2.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const l3SP = dbL3.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const teamSp = l1SP + l2SP + l3SP;

  const overviewCards = buildOverviewCards(
    dbL1.length,
    teamSp,
    dashboard?.rank || "Starter"
  );

  const teamRows = [
    ...dbL1.map((u: any) => ({
      name: u.name,
      level: "Level 1",
      business: `${u.totalSP.toFixed(1)} SP`,
      status: u.ordersCount > 0 ? "Active" : "Inactive",
      joined: u.dateJoined
    })),
    ...dbL2.map((u: any) => ({
      name: u.name,
      level: "Level 2",
      business: `${u.totalSP.toFixed(1)} SP`,
      status: u.ordersCount > 0 ? "Active" : "Inactive",
      joined: u.dateJoined
    })),
    ...dbL3.map((u: any) => ({
      name: u.name,
      level: "Level 3",
      business: `${u.totalSP.toFixed(1)} SP`,
      status: u.ordersCount > 0 ? "Active" : "Inactive",
      joined: u.dateJoined
    }))
  ];

  const allTeamMembers = [...dbL1, ...dbL2, ...dbL3];
  const sortedPerformers = [...allTeamMembers].sort((a, b) => (b.totalSP || 0) - (a.totalSP || 0));
  const performers = sortedPerformers.slice(0, 3).map((u, idx) => ({
    name: u.name,
    amount: `${(u.totalSP || 0).toFixed(1)} SP`,
    tag: idx === 0 ? "Top performer" : idx === 1 ? "Fast growth" : "Steady growth"
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#fbf1ec_34%,#f5e8e0_100%)] px-4 pb-20 pt-44 text-[#1c1c19] sm:px-5 sm:pt-36 md:px-8 md:pt-40 lg:pt-44 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] border border-[#ead9d1] bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] shadow-[0_24px_70px_rgba(127,49,68,0.10)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#ead9d1] px-4 py-4 sm:px-5 md:px-6">
            <div>
              <p className="font-[family:var(--font-display)] text-[2rem] leading-[0.95] tracking-[-0.04em] text-[#5c2530] sm:text-[2.5rem] md:text-[3rem]">
                My Team
              </p>
              <p className="mt-1 text-sm text-[#7c6e68]">
                Direct partners, level depth, and team sell points
              </p>
            </div>
            <Link
              href="/earnings/referrals"
              className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd2] bg-white px-4 py-2 text-sm font-semibold text-[#5f5d3e] transition hover:bg-[#f7ece6]"
            >
              Referral Tree
              <FaChevronRight className="text-[0.8rem]" />
            </Link>
          </div>

          <section className="p-4 sm:p-5 md:p-6">
            <div className="grid gap-3 md:grid-cols-3">
              {overviewCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-[1.25rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_10px_24px_rgba(95,93,62,0.04)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#8b837b]">
                        {item.label}
                      </p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff3ee] text-[#9c4049]">
                        <Icon className="text-[0.95rem]" />
                      </span>
                    </div>
                    <p className="mt-3 text-[1.5rem] font-bold tracking-[-0.04em] text-[#2a2430]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <span
                  key={filter}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                    index === 0
                      ? "border-[#7f3144] bg-[#7f3144] text-white"
                      : "border-[#e7ddd2] bg-white text-[#5f5d3e]"
                  }`}
                >
                  {filter}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[1.5rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-[family:var(--font-display)] text-[1.35rem] tracking-[-0.03em] text-[#382933] md:text-[1.7rem]">
                    Team Level Members
                  </h2>
                  <span className="text-xs uppercase tracking-[0.14em] text-[#9c4049]">
                    Live
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {teamRows.map((row, index) => (
                    <div
                      key={`${row.name}-${row.level}`}
                      className="grid gap-3 rounded-[1rem] bg-[#fff9f7] p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7f3144] text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#2a2430]">{row.name}</p>
                          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-[#7b6f69]">
                            {row.joined}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#5e5a54]">
                        <span className="rounded-full border border-[#eddad3] bg-white px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#9c4049]">
                          {row.level}
                        </span>
                        <span>{row.status}</span>
                      </div>
                      <div className="md:text-right">
                        <p className="text-lg font-bold text-[#2a2430]">{row.business}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-[#f0ddd6] bg-[linear-gradient(120deg,#fff1f4_0%,#fff9f6_100%)] p-4">
                  <p className="font-[family:var(--font-display)] text-[1.2rem] tracking-[-0.02em] text-[#7a2e43] md:text-[1.5rem]">
                    Build with care, grow with style.
                  </p>
                  <p className="mt-1 text-sm text-[#b26a6d]">
                    Track Level 1, 2, and 3 teams for fast track income and score qualification.
                  </p>
                  <Link
                    href="/earnings/referrals"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#7f3144] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <FaShareAlt className="text-[0.85rem]" />
                    View Referrals
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 xl:sticky xl:top-6 xl:self-start">
                <div className="rounded-[1.5rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:p-5 lg:sticky lg:top-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-[family:var(--font-display)] text-[1.35rem] tracking-[-0.03em] text-[#382933] md:text-[1.7rem]">
                      Top Performers
                    </h2>
                    <Link href="/earnings/referrals" className="text-sm font-semibold text-[#9c4049]">
                      View All
                    </Link>
                  </div>

                  <div className="mt-4 space-y-3">
                    {performers.map((item, index) => (
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
                              {item.tag}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#2a2430]">{item.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#f0ddd6] bg-[linear-gradient(120deg,#7d2746_0%,#a64863_45%,#d0848d_100%)] p-5 text-white shadow-[0_14px_38px_rgba(125,39,70,0.18)]">
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#ffdce0]">
                    Team note
                  </p>
                  <p className="mt-2 font-[family:var(--font-display)] text-[1.45rem] leading-[1.08] tracking-[-0.03em] md:text-[1.8rem]">
                    {businessPlan?.fastTrackIncome
                      ? `${businessPlan.fastTrackIncome.join(", ")} fast track levels.`
                      : "5%, 3%, 2% fast track levels."}
                  </p>
                  <p className="mt-2 text-sm text-[#ffe5ea]">
                    Level 1, 2, and 3 sales build your fast track income. Strong direct partners help unlock partnership bonus.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[#f0ddd6] bg-[linear-gradient(120deg,#fff1f4_0%,#fff9f6_100%)] p-4 shadow-[0_10px_24px_rgba(95,93,62,0.04)]">
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#9c4049]">
                    Quick invite
                  </p>
                  <p className="mt-2 text-sm text-[#7c6e68]">
                    Share your referral link to add active direct partners and unlock payout qualification.
                  </p>
                  <CopyInviteButton referralCode={referralCode} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
