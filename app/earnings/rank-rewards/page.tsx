import Link from "next/link";
import { FaArrowLeft, FaCrown, FaMedal, FaStar, FaTrophy } from "react-icons/fa";
import { MdLeaderboard, MdOutlineWorkspacePremium } from "react-icons/md";
import { getPartnerDashboardData, getPartnerReferralsList } from "@/lib/server/partner-dashboard";

export default async function RankRewardsPage() {
  const partnerData = await getPartnerDashboardData();
  const dashboard = partnerData?.dashboard;
  const businessPlan = partnerData?.businessPlan;

  const referralsData = await getPartnerReferralsList();
  const dbL1 = referralsData?.level1 || [];
  const dbL2 = referralsData?.level2 || [];
  const dbL3 = referralsData?.level3 || [];

  const l1SP = dbL1.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const l2SP = dbL2.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const l3SP = dbL3.reduce((sum: number, u: any) => sum + (u.totalSP || 0), 0);
  const teamSellPoints = l1SP + l2SP + l3SP;
  const totalTeamSp = dashboard?.sellPointsTotal ?? 0;

  const minSp = businessPlan?.minimumPayoutSellPoints ?? 500;
  const minDirects = businessPlan?.minimumActiveDirects ?? 2;

  const isQualified = 
    (dashboard?.sellPointsTotal ?? 0) >= minSp && 
    (dashboard?.activeDirects ?? 0) >= minDirects;

  const payoutStatusText = isQualified ? "Qualified" : "Not Qualified";

  const poolEarnings = 
    (dashboard?.scoreIncome ?? 0) +
    (dashboard?.dreamCarFundIncome ?? 0) +
    (dashboard?.dreamHouseFundIncome ?? 0) +
    (dashboard?.partnershipBonusIncome ?? 0) +
    (dashboard?.smartSellerPoolIncome ?? 0) +
    (dashboard?.annualClubIncome ?? 0) +
    (dashboard?.timelyRewardsIncome ?? 0);

  const rankCards = [
    { label: "Payout Status", value: payoutStatusText, icon: FaCrown },
    { label: "Monthly Team SP", value: totalTeamSp.toLocaleString("en-IN", { maximumFractionDigits: 1 }), icon: FaStar },
    { label: "Active Direct", value: `${dashboard?.activeDirects ?? 0}`, icon: MdLeaderboard },
    { label: "Pool Earnings", value: `₹${poolEarnings.toLocaleString("en-IN")}`, icon: MdOutlineWorkspacePremium }
  ];

  const milestones = [
    { 
      title: "Payout Qualification", 
      target: `${minSp} SP + ${minDirects} active direct`, 
      status: isQualified ? "Completed" : "In Progress" 
    },
    { 
      title: "Glam Score", 
      target: "2,500 team SP", 
      status: totalTeamSp >= 2500 ? "Completed" : (isQualified ? "In Progress" : "Locked") 
    },
    { 
      title: "Style Score", 
      target: "25,000 team SP", 
      status: totalTeamSp >= 25000 ? "Completed" : (totalTeamSp >= 2500 ? "In Progress" : "Locked") 
    },
    { 
      title: "Gorgeous Score", 
      target: "100,000 team SP", 
      status: totalTeamSp >= 100000 ? "Completed" : (totalTeamSp >= 25000 ? "In Progress" : "Locked") 
    }
  ];

  const rewards = [
    { title: "Dream Car Fund", meta: "3 months continuous 1 Gorgeous Score", amount: "5% Pool" },
    { title: "Dream House Fund", meta: "3 months 200,000 SP + Super Womania Score", amount: "5% Pool" },
    { title: "Annual Club Access", meta: "Super, Mega, and Luxury Life Club eligibility", amount: "Premium" }
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#fbf1ec_34%,#f5e8e0_100%)] pt-44 text-[#1c1c19] sm:pt-36 md:pt-40 lg:pt-44">
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
                Rank & Rewards
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-[#9c4049]/80 sm:text-[0.72rem]">
                Payout qualification, score progress, and premium fund unlocks
              </p>
            </div>
            <div className="w-[82px] sm:w-[110px]" />
          </header>

          <section className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {rankCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-[1.15rem] border border-[#f0ddd6] bg-white px-3 py-4 text-center shadow-[0_10px_24px_rgba(95,93,62,0.04)] md:px-4 md:py-5">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3ee] text-[#9c4049] md:h-11 md:w-11">
                      <Icon className="text-[1rem] md:text-[1.1rem]" />
                    </div>
                    <p className="mt-2 text-[1rem] font-bold tracking-[-0.04em] text-[#2a2430] md:text-[1.3rem]">
                      {card.value}
                    </p>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-[#7b6f69] md:text-xs">
                      {card.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.4rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-[family:var(--font-display)] text-[1.25rem] tracking-[-0.03em] text-[#382933] sm:text-[1.45rem] md:text-[1.7rem]">
                    Score Ladder
                  </h2>
                  <Link href="/earnings/referrals" className="text-sm font-semibold text-[#9c4044]">
                    Team Tree
                  </Link>
                </div>

                <div className="mt-4 space-y-3">
                  {milestones.map((item, index) => (
                    <div key={item.title} className="flex items-center justify-between gap-3 rounded-[1rem] bg-[#fff9f7] p-3 md:p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f3] text-[#9c4049]">
                          <FaMedal />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#2a2430]">{item.title}</p>
                          <p className="mt-1 text-xs text-[#6d655d]">Target: {item.target}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                        item.status === "Completed" ? "bg-[#fff0f3] text-[#9c4044]" : item.status === "In Progress" ? "bg-[#fff5e8] text-[#9f6a2f]" : "bg-[#f1efed] text-[#71655d]"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:p-5">
                <h2 className="font-[family:var(--font-display)] text-[1.25rem] tracking-[-0.03em] text-[#382933] sm:text-[1.45rem] md:text-[1.7rem]">
                  Fund & Club Highlights
                </h2>

                <div className="mt-4 space-y-3">
                  {rewards.map((reward) => (
                    <div key={reward.title} className="rounded-[1rem] bg-[linear-gradient(180deg,#fff9f7_0%,#fffdfb_100%)] p-3 md:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#2a2430]">{reward.title}</p>
                          <p className="mt-1 text-xs leading-5 text-[#6d655d]">{reward.meta}</p>
                        </div>
                        <p className="text-sm font-bold text-[#9c4044] md:text-base">{reward.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.2rem] bg-[linear-gradient(120deg,#7d2746_0%,#a64863_45%,#d0848d_100%)] px-4 py-5 text-white shadow-[0_14px_38px_rgba(125,39,70,0.22)] md:px-5 md:py-6">
                  <p className="font-[family:var(--font-display)] text-[1.45rem] italic tracking-[-0.04em] md:text-[1.8rem]">
                    Keep climbing.
                  </p>
                  <p className="mt-1 text-sm text-[#ffd8df]">
                    Build sell points and team scores to unlock funds, annual clubs, and higher partner pools.
                  </p>
                  <Link
                    href="/earnings/score-income"
                    className="mt-4 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#7f3144] transition-opacity hover:opacity-90"
                  >
                    View Business Plan
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
