import Link from "next/link";
import { FaChartLine } from "react-icons/fa6";
import { getPartnerDashboardData } from "@/lib/server/partner-dashboard";

const scoreCards = [
  {
    title: "Glam Score",
    target: "2,500 team sell points",
    pool: "15% company turnover pool",
    note: "Monthly pool divided by total Glam Scores."
  },
  {
    title: "Style Score",
    target: "25,000 team sell points",
    pool: "12% company turnover pool",
    note: "Unlocks higher partner growth tracking."
  },
  {
    title: "Gorgeous Score",
    target: "100,000 team sell points",
    pool: "10% company turnover pool",
    note: "Used for Dream Car Fund qualification."
  },
  {
    title: "Super Womania Score",
    target: "2 Gorgeous Scores in a month",
    pool: "10% company turnover pool",
    note: "Used for Dream House Fund qualification."
  }
];

export default async function ScoreIncomePage() {
  const partnerData = await getPartnerDashboardData();
  const dashboard = partnerData?.dashboard;
  const businessPlan = partnerData?.businessPlan;
  const sellPoints = dashboard?.sellPointsTotal ?? 0;
  const currentScore =
    sellPoints >= 100000
      ? "Gorgeous"
      : sellPoints >= 25000
        ? "Style"
        : sellPoints >= 2500
          ? "Glam"
          : "Starting";

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-10 text-[#1c1c19] md:pt-10 lg:pt-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-[#ead9d1] bg-white/90 p-5 shadow-[0_22px_60px_rgba(127,49,68,0.08)] md:p-8">
        <Link href="/earnings" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9c4049]">
          Back to Dashboard
        </Link>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/75">
              Score Income
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-[2.4rem] leading-none tracking-[-0.04em] md:text-[4rem]">
              Monthly team score income.
            </h1>
          </div>
          <div className="rounded-[1.3rem] bg-[#5f5d3e] px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Unlocked</p>
            <p className="mt-1 text-xl font-bold">{currentScore}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-[#ead9d1] bg-[#fff9f6] p-4 text-sm leading-7 text-[#625852]">
          {businessPlan?.scoreIncome ? (
            <p>
              Glam Score: {businessPlan.scoreIncome.glam}
              <br />
              Style Score: {businessPlan.scoreIncome.style}
              <br />
              Gorgeous Score: {businessPlan.scoreIncome.gorgeous}
              <br />
              Super Womania Score: {businessPlan.scoreIncome.superWomenia}
            </p>
          ) : (
            <p>
              Monthly score income is driven by Glam, Style, Gorgeous, and Super Womania score achievements from total team sell points.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {scoreCards.map((score) => (
            <article key={score.title} className="rounded-[1.45rem] border border-[#ead9d1] bg-[#fff9f6] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#352631]">{score.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#625852]">{score.target}</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff1eb] text-[#9c4049]">
                  <FaChartLine />
                </div>
              </div>
              <p className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#7f3144]">
                {score.pool}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#6a625b]">{score.note}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

