import Link from "next/link";
import { FaChartLine } from "react-icons/fa6";
import { getPartnerDashboardData } from "@/lib/server/partner-dashboard";

const programCards = [
  {
    title: "Level Income",
    target: "Direct network sales (Self & up to 3 levels deep)",
    pool: "Instant & Monthly",
    note: "Self Sell: 5%, Level 1: 2%, Level 2: 1%, Level 3: 0.5% on INR order total."
  },
  {
    title: "Monthly Bonus",
    target: "Personal sales performance",
    pool: "Monthly Bonus",
    note: "0.5% at ₹25k, 1% at ₹50k, and 2% at ₹1L+ personal sales in a month."
  },
  {
    title: "Womaniyaa Point",
    target: "Maintain ₹5L team sales (incl. ₹10k self) for 3 months",
    pool: "1% total partner turnover pool",
    note: "Earns an equal share of the pool for 1 year (12 months)."
  },
  {
    title: "Super Womaniyaa Point",
    target: "Maintain ₹2.5Cr team sales (incl. ₹25k self) for 6 months",
    pool: "1% total partner turnover pool",
    note: "Earns an equal share of the pool for 3 years (36 months)."
  }
];

export default async function PartnerProgramPage() {
  const partnerData = await getPartnerDashboardData();
  const dashboard = partnerData?.dashboard;
  const businessPlan = partnerData?.businessPlan;

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-10 text-[#1c1c19] md:pt-10 lg:pt-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-[#ead9d1] bg-white/90 p-5 shadow-[0_22px_60px_rgba(127,49,68,0.08)] md:p-8">
        <Link href="/earnings" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9c4049]">
          Back to Dashboard
        </Link>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/75">
              Partner Program
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-[2.4rem] leading-none tracking-[-0.04em] md:text-[4rem]">
              New Earnings & Rewards.
            </h1>
          </div>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-[#ead9d1] bg-[#fff9f6] p-4 text-sm leading-7 text-[#625852]">
          <p>
            The New Partner Program replaces the old score-based system and gives you more direct rewards on your personal and team sales. Hit milestones to earn Womaniyaa and Super Womaniyaa points, granting you shares in the global company turnover pool.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {programCards.map((card) => (
            <article key={card.title} className="rounded-[1.45rem] border border-[#ead9d1] bg-[#fff9f6] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#352631]">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#625852]">{card.target}</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff1eb] text-[#9c4049]">
                  <FaChartLine />
                </div>
              </div>
              <p className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#7f3144] inline-block">
                {card.pool}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#6a625b]">{card.note}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
