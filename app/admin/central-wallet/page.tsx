"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function CentralWalletPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard/central-wallet")
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch central wallet stats:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen bg-[#fcf9f4]">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-[#1c1c19]">Central Wallet System</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9c4049]"></div>
          </div>
        ) : !data ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#ece6df]">
            <p className="text-[#8b837b]">Failed to load data.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#ece6df] shadow-sm">
                <h3 className="text-sm font-semibold text-[#8b837b] mb-2 uppercase tracking-wide">Total Platform Sales</h3>
                <p className="text-3xl font-bold text-[#111111]">₹{data.totalPlatformSales.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#ece6df] shadow-sm">
                <h3 className="text-sm font-semibold text-[#8b837b] mb-2 uppercase tracking-wide">Total Network Balances</h3>
                <p className="text-3xl font-bold text-[#9c4049]">₹{data.totalNetworkBalances.toLocaleString("en-IN")}</p>
                <p className="text-xs text-[#8b837b] mt-1">Outstanding commissions</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#ece6df] shadow-sm">
                <h3 className="text-sm font-semibold text-[#8b837b] mb-2 uppercase tracking-wide">Active Partners</h3>
                <p className="text-3xl font-bold text-[#367743]">{data.activePartnersCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#ece6df] overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-[#ece6df]">
                <h2 className="text-xl font-bold text-[#111111]">Partner Balances</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#fcf9f4] text-xs uppercase tracking-wider text-[#8b837b] border-b border-[#ece6df]">
                      <th className="py-4 px-6 font-semibold">Partner</th>
                      <th className="py-4 px-6 font-semibold">Team Size</th>
                      <th className="py-4 px-6 font-semibold text-right">Network Wallet</th>
                      <th className="py-4 px-6 font-semibold text-right">Shopping Wallet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ece6df] text-sm">
                    {data.partners.map((partner: any) => (
                      <tr key={partner.id} className="hover:bg-[#fcf9f4] transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-[#111111]">{partner.name}</div>
                          <div className="text-xs text-[#8b837b]">{partner.email}</div>
                        </td>
                        <td className="py-4 px-6 font-medium text-[#6d655d]">
                          {partner.teamSize} members
                        </td>
                        <td className="py-4 px-6 font-bold text-[#9c4049] text-right">
                          ₹{partner.networkWalletBalance.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6 font-medium text-[#8b837b] text-right">
                          ₹{partner.shoppingWalletBalance.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    {data.partners.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[#8b837b]">No active partners found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
