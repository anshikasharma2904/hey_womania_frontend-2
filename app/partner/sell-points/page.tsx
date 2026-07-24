import { getPartnerDashboardData } from "@/lib/server/partner-dashboard";
import { FaCoins } from "react-icons/fa";

export default async function PartnerSellPointsPage() {
  const data = await getPartnerDashboardData();
  const totalSP = data?.dashboard?.sellPointsTotal ?? 0;

  // Dummy Sell Points ledger
  const spLedger = [
    { orderId: "#WMN-9081", date: "2026-06-20", reason: "Direct Purchase", spEarned: 199, status: "Approved" },
    { orderId: "#WMN-9074", date: "2026-06-18", reason: "Team Referral Order Anjali", spEarned: 50, status: "Approved" },
    { orderId: "#WMN-9065", date: "2026-06-15", reason: "Team Referral Order Sneha", spEarned: 25, status: "Approved" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#9c4049]">Earning Metrics</p>
        <h1 className="mt-1 font-[family:var(--font-display)] text-3xl tracking-tight text-[#1c1c19] md:text-4xl">
          Sell Points History
        </h1>
      </div>

      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)] flex items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6d655d]">Cumulative Sell Points (SP)</p>
          <h2 className="mt-2 text-3xl font-black text-[#1c1c19]">
            {totalSP} <span className="text-sm font-semibold text-[#9c4049]">SP</span>
          </h2>
        </div>
        <div className="rounded-full bg-[#fff0f1] p-4 text-[#9c4049]">
          <FaCoins className="text-[2rem]" />
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
        <h3 className="text-lg font-bold text-[#1c1c19] mb-6">SP Ledger Log</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#ece6df] pb-4 text-xs font-bold uppercase tracking-wider text-[#8b837b]">
                <th className="pb-3">Reference / Order ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Earning Source</th>
                <th className="pb-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece6df]">
              {spLedger.map((log, index) => (
                <tr key={index} className="text-[#48473d]">
                  <td className="py-4 font-semibold">{log.orderId}</td>
                  <td className="py-4">{log.date}</td>
                  <td className="py-4">{log.reason}</td>
                  <td className="py-4 text-right font-bold text-emerald-600">
                    +{log.spEarned} SP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
