import Link from "next/link";
import { FaCrown } from "react-icons/fa6";
import { getPartnerDashboardData } from "@/lib/server/partner-dashboard";

const annualClubs = [
  {
    title: "Super Club",
    target: "50 lakh sell points yearly",
    pool: "1% yearly turnover pool",
    tone: "from-[#fff3d4] to-[#fffaf0]"
  },
  {
    title: "Mega Club",
    target: "2 crore sell points yearly",
    pool: "1.5% yearly turnover pool",
    tone: "from-[#f4e8ff] to-[#fff8ff]"
  },
  {
    title: "Luxury Life Club",
    target: "5 crore sell points yearly",
    pool: "2.5% yearly turnover pool",
    tone: "from-[#ffe7ef] to-[#fff8fa]"
  }
];

export default async function AnnualClubPage() {
  const partnerData = await getPartnerDashboardData();
  const dashboard = partnerData?.dashboard;
  const businessPlan = partnerData?.businessPlan;
  const sellPoints = dashboard?.sellPointsTotal ?? 0;
  const currentClub =
    sellPoints >= 50000000
      ? "Luxury Life Club"
      : sellPoints >= 20000000
        ? "Mega Club"
        : sellPoints >= 5000000
          ? "Super Club"
          : "Not yet qualified";

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-44 text-[#1c1c19] md:pt-40 lg:pt-44">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-[#ead9d1] bg-white/90 p-5 shadow-[0_22px_60px_rgba(127,49,68,0.08)] md:p-8">
        <Link href="/earnings" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9c4049]">
          Back to Dashboard
        </Link>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/75">
              Annual Club
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-[2.4rem] leading-none tracking-[-0.04em] md:text-[4rem]">
              Yearly recognition for high-volume partners.
            </h1>
          </div>
          <div className="rounded-[1.3rem] bg-[#7f3144] px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Current</p>
            <p className="mt-1 text-xl font-bold">{currentClub}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-[#ead9d1] bg-[#fff9f6] p-4 text-sm leading-7 text-[#625852]">
          {businessPlan?.annualClubs ? (
            <>
              <p>
                Super Club: {businessPlan.annualClubs.superClub}
                <br />
                Mega Club: {businessPlan.annualClubs.megaClub}
                <br />
                Luxury Life Club: {businessPlan.annualClubs.luxuryLifeClub}
              </p>
            </>
          ) : (
            <p>
              Annual club rewards are based on financial year performance. Partners progress from Super Club to Mega Club and then to Luxury Life Club as yearly sell points rise.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {annualClubs.map((club) => (
            <article
              key={club.title}
              className={`rounded-[1.5rem] border border-[#ead9d1] bg-gradient-to-br ${club.tone} p-5`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#9c4049] shadow-sm">
                <FaCrown />
              </div>
              <h2 className="mt-4 text-xl font-bold text-[#352631]">{club.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#625852]">{club.target}</p>
              <p className="mt-4 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-[#7f3144]">
                {club.pool}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

