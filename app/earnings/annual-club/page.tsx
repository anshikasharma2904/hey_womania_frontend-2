import Link from "next/link";
import { FaCrown, FaStar, FaChartLine, FaGem } from "react-icons/fa";
import { getPartnerDashboardData } from "@/lib/server/partner-dashboard";

const partnerPrograms = [
  {
    title: "Level Income",
    target: "Self: 5%, Level 1: 2%, Level 2: 1%, Level 3: 0.5%",
    pool: "Direct Commission",
    tone: "from-[#fff3d4] to-[#fffaf0]",
    icon: FaChartLine
  },
  {
    title: "Monthly Bonus",
    target: "Self Sell: 25k (0.5%), 50k (1%), 1L (2%)",
    pool: "Monthly Bonus",
    tone: "from-[#e8f4ff] to-[#f5faff]",
    icon: FaStar
  },
  {
    title: "Womaniyaa Point",
    target: "₹5 Lakh team sell (incl. ₹10k self) for 3 months",
    pool: "1% turnover share for 1 year",
    tone: "from-[#f4e8ff] to-[#fff8ff]",
    icon: FaCrown
  },
  {
    title: "Super Womaniyaa Point",
    target: "₹2.5 Crore team sell (incl. ₹25k self) for 6 months",
    pool: "1% turnover share for 3 years",
    tone: "from-[#ffe7ef] to-[#fff8fa]",
    icon: FaGem
  }
];

export default async function PartnerProgramPage() {
  const partnerData = await getPartnerDashboardData();
  const dashboard = partnerData?.dashboard;
  const sellPoints = dashboard?.sellPointsTotal ?? 0;
  
  // Example current status
  const currentStatus = "Active Partner";

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-10 text-[#1c1c19] md:pt-10 lg:pt-10">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-[#ead9d1] bg-white/90 p-5 shadow-[0_22px_60px_rgba(127,49,68,0.08)] md:p-8">
        <Link href="/earnings" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5f5d3e]">
          Back to Dashboard
        </Link>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#5f5d3e]/75">
              Partner Programs
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-[2.4rem] leading-none tracking-[-0.04em] md:text-[3.5rem] text-[#1c1c19]">
              Growth and recognition for high-performing partners.
            </h1>
          </div>
          <div className="rounded-[1.3rem] bg-[#5f5d3e] px-5 py-4 text-white min-w-[150px] text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Status</p>
            <p className="mt-1 text-xl font-bold">{currentStatus}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-[#ead9d1] bg-[#fcf9f4] p-4 text-sm leading-7 text-[#625852]">
          <p>
            Our new Partner Program replaces the old SP system with direct commissions and powerful company turnover shares. Build your team, hit the milestones, and earn long-term rewards like Womaniyaa Points!
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {partnerPrograms.map((program) => {
            const Icon = program.icon;
            return (
              <article
                key={program.title}
                className={`rounded-[1.5rem] border border-[#ead9d1] bg-gradient-to-br ${program.tone} p-5 flex flex-col h-full`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#5f5d3e] shadow-sm">
                  <Icon />
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#1c1c19]">{program.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#625852] flex-grow">{program.target}</p>
                <p className="mt-4 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#5f5d3e] text-center">
                  {program.pool}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
