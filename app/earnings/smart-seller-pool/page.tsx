import Link from "next/link";
import { FaStore } from "react-icons/fa6";
import { getPartnerDashboardData } from "@/lib/server/partner-dashboard";

export default async function SmartSellerPoolPage() {
  const partnerData = await getPartnerDashboardData();
  const dashboard = partnerData?.dashboard;
  const businessPlan = partnerData?.businessPlan;
  const sellPoints = dashboard?.sellPointsTotal ?? 0;
  const streak = sellPoints >= 10000 ? "Qualified" : "In progress";

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-10 text-[#1c1c19] md:pt-10 lg:pt-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-[#ead9d1] bg-white/90 p-5 shadow-[0_22px_60px_rgba(127,49,68,0.08)] md:p-8">
        <Link href="/earnings" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9c4049]">
          Back to Dashboard
        </Link>

        <div className="mt-5 grid gap-5 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/75">
              Smart Seller Pool
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-[2.4rem] leading-none tracking-[-0.04em] md:text-[4rem]">
              Reward for consistent sellers.
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#625852] md:text-base">
              This pool rewards partners who maintain consistent monthly selling performance and keep building stable business volume.
            </p>
          </div>

          <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#7f3144,#d0848d)] p-5 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <FaStore className="text-2xl" />
            </div>
            <p className="mt-6 text-[0.7rem] uppercase tracking-[0.2em] text-white/70">
              Status
            </p>
            <p className="mt-2 text-3xl font-bold">10,000 SP x 3 Months</p>
            <p className="mt-2 text-sm text-white/75">{streak}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-[#ead9d1] bg-[#fff9f6] p-4 text-sm leading-7 text-[#625852]">
          {businessPlan?.smartSellerPool ? (
            <p>{businessPlan.smartSellerPool}</p>
          ) : (
            <p>
              Complete 10,000 sell points continuously for 3 months to enter the Smart Seller Pool. Company turnover is shared across achievers for the next 12 months.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            "Complete 10,000 sell points continuously for 3 months.",
            "Earn 1 Smart Seller Point and enter the pool.",
            "Company turnover pool of 5% is divided among achievers.",
            "Pool benefit continues for the next 12 months."
          ].map((rule, index) => (
            <div key={rule} className="rounded-[1.2rem] border border-[#ead9d1] bg-[#fff9f6] p-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#9c4049]">
                Step {index + 1}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#4f4945]">{rule}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

