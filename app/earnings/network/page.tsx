"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaUsers, FaCrown, FaStar } from "react-icons/fa";

export default function NetworkTreePage() {
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState<any>(null);

  useEffect(() => {
    fetch("/api/partner/network")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNetwork(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch network:", err);
        setLoading(false);
      });
  }, []);

  const renderLevel = (levelName: string, users: any[], percentage: string, icon: any, colorClass: string, bgClass: string) => {
    const Icon = icon;
    return (
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-[#e6dcd4] bg-white shadow-[0_14px_38px_rgba(95,93,62,0.06)]">
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 sm:px-8 sm:py-6 border-b border-[#e6dcd4] ${bgClass}`}>
          <div className="flex items-center gap-4 mb-3 sm:mb-0">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ${colorClass}`}>
              <Icon className="text-xl" />
            </div>
            <div>
              <h2 className="font-[family:var(--font-display)] text-2xl tracking-tight text-[#1c1c19]">
                {levelName}
              </h2>
              <p className="text-sm font-medium text-[#6d655d]">{users.length} Active Partners</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-sm font-semibold backdrop-blur-md">
            <span className={colorClass}>{percentage}</span>
            <span className="text-[#48473d]">Commission</span>
          </div>
        </div>
        
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-4 h-16 w-16 rounded-full bg-[#fcf9f4] border border-[#e6dcd4] flex items-center justify-center text-[#d4c9bf]">
              <FaUsers className="text-2xl" />
            </div>
            <p className="text-base font-semibold text-[#1c1c19]">No partners yet</p>
            <p className="mt-1 text-sm text-[#6d655d]">Your network at this level is currently empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#e6dcd4] bg-[#fcf9f4] text-[0.7rem] uppercase tracking-[0.2em] text-[#6d655d]">
                  <th className="py-4 px-8 font-semibold">Partner</th>
                  <th className="py-4 px-6 font-semibold">Rank</th>
                  <th className="py-4 px-6 font-semibold text-right">Total Sales</th>
                  <th className="py-4 px-8 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dcd4]">
                {users.map((user: any) => (
                  <tr key={user.id} className="group hover:bg-[#fcf9f4]/50 transition-colors duration-200">
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ece6df] to-[#d4c9bf] text-sm font-bold text-[#5f5d3e]">
                          {user.name?.charAt(0).toUpperCase() || user.firstName?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <div className="font-bold text-[#1c1c19] group-hover:text-[#9c4049] transition-colors">{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}</div>
                          <div className="text-[0.75rem] text-[#8b837b]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6dcd4] bg-white px-3 py-1 text-xs font-semibold text-[#5f5d3e] shadow-sm">
                        {user.rank === 'Starter' ? <FaStar className="text-[0.6rem] text-[#d4c9bf]" /> : <FaCrown className="text-[0.6rem] text-[#9c4049]" />}
                        {user.rank || 'Starter'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-[#1c1c19]">
                        ₹{(user.totalSales || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </td>
                    <td className="py-4 px-8 text-right text-sm text-[#6d655d] font-medium">
                      {new Date(user.joinedAt || user.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#fcf9f4] font-sans pt-10 pb-24 text-[#1c1c19]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link 
              href="/earnings" 
              className="inline-flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#9c4049] hover:text-[#7a3138] transition-colors mb-4"
            >
              <FaChevronLeft className="text-[0.7rem]" /> Back to Dashboard
            </Link>
            <h1 className="font-[family:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#1c1c19] leading-none">
              Network Tree
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#6d655d] max-w-xl">
              Track your downline structure, monitor team sales performance, and view your commission breakdown across all three network levels.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#5f5d3e] shadow-sm border border-[#e6dcd4]">
              Active Status
            </span>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64 rounded-[2rem] border border-[#e6dcd4] bg-white shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e6dcd4] border-t-[#9c4049]"></div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b837b]">Loading Network...</p>
            </div>
          </div>
        ) : !network ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-[#e6dcd4] shadow-sm">
            <div className="mb-4 h-16 w-16 rounded-full bg-[#fcf9f4] border border-[#e6dcd4] flex items-center justify-center text-[#9c4049]">
              <FaUsers className="text-2xl" />
            </div>
            <p className="text-lg font-bold text-[#1c1c19]">Network Unavailable</p>
            <p className="text-[#6d655d] mt-1 text-sm">We couldn't load your network data at this time.</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {renderLevel("Level 1 (Directs)", network.level1 || [], "2%", FaCrown, "text-[#9c4049]", "bg-[#fff4f6]")}
            {renderLevel("Level 2", network.level2 || [], "1%", FaStar, "text-[#5f5d3e]", "bg-[#f4efe8]")}
            {renderLevel("Level 3", network.level3 || [], "0.5%", FaUsers, "text-[#6d655d]", "bg-[#f5f5f5]")}
          </div>
        )}
      </div>
    </main>
  );
}
