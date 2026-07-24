import { getPartnerDashboardData } from "@/lib/server/partner-dashboard";
import { FaUserPlus, FaEnvelope, FaPhone } from "react-icons/fa";

export default async function PartnerTeamPage() {
  const data = await getPartnerDashboardData();
  const referralCode = data?.user?.referralCode ?? "WMN-PARTNER";
  const activeDirects = data?.dashboard?.activeDirects ?? 0;

  // Dummy team list based on dashboard data
  const teamList = [
    { name: "Anjali Mehta", dateJoined: "2026-06-15", ordersCount: 5, status: "Active" },
    { name: "Sneha Nair", dateJoined: "2026-06-12", ordersCount: 2, status: "Active" },
    { name: "Kirti Patel", dateJoined: "2026-06-08", ordersCount: 0, status: "Inactive" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#9c4049]">Network</p>
        <h1 className="mt-1 font-[family:var(--font-display)] text-3xl tracking-tight text-[#1c1c19] md:text-4xl">
          My Referral Team
        </h1>
      </div>

      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#8b837b] mb-2">My Referral Link & Code</h3>
        <p className="text-xs text-[#6d655d] mb-4">Share this link or code to invite friends and earn commissions from their purchases.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1 bg-[#fcf9f4] border border-[#e8e2d9] rounded-xl px-4 py-3 text-sm font-mono text-[#48473d] select-all flex items-center justify-between">
            <span>{referralCode}</span>
            <span className="text-[10px] uppercase font-bold text-[#9c4049] tracking-wider cursor-pointer">Copy Code</span>
          </div>
          <button className="rounded-xl bg-[#5f5d3e] hover:bg-[#48473d] text-white text-xs uppercase font-bold tracking-wider px-6 py-4 shadow transition">
            Copy Link
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b837b]">Active Directs</p>
          <h3 className="mt-2 text-3xl font-black text-[#1c1c19]">{activeDirects}</h3>
          <p className="mt-1 text-xs text-[#8b837b]">Direct referrals who placed at least one order.</p>
        </div>

        <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b837b]">Total Referrals</p>
          <h3 className="mt-2 text-3xl font-black text-[#1c1c19]">{teamList.length}</h3>
          <p className="mt-1 text-xs text-[#8b837b]">Total users registered with your code.</p>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
        <h3 className="text-lg font-bold text-[#1c1c19] mb-6">Team Members</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#ece6df] pb-4 text-xs font-bold uppercase tracking-wider text-[#8b837b]">
                <th className="pb-3">Name</th>
                <th className="pb-3">Date Joined</th>
                <th className="pb-3">Orders</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece6df]">
              {teamList.map((member, index) => (
                <tr key={index} className="text-[#48473d]">
                  <td className="py-4 font-semibold">{member.name}</td>
                  <td className="py-4">{member.dateJoined}</td>
                  <td className="py-4">{member.ordersCount} orders</td>
                  <td className="py-4 text-right">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      member.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"
                    }`}>
                      {member.status}
                    </span>
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
