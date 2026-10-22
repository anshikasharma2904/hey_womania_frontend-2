import { MdAccountBalanceWallet } from "react-icons/md";
import type { ReactNode } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { cookies } from "next/headers";
import { AccountSidebar } from "./AccountSidebar";



async function fetchUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");
  
  if (!sessionToken) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`, {
      headers: {
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      cache: "no-store"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    return null;
  }
}

async function fetchUserOrders() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");
  
  if (!sessionToken) return [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`, {
      headers: {
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      cache: "no-store"
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ? data.data : Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await fetchUser();
  const isPartner = user?.role === "partner" || user?.isPartner;
  const displayName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || "Customer" : "Customer";
  
  const orders = await fetchUserOrders() || [];

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-3 pb-12 pt-4 sm:px-5 sm:pt-8 md:px-16 md:pt-10 lg:pt-10 text-[#1c1c19]">
      <div className="mx-auto max-w-6xl">
        {/* Welcome & Wallet Header Box */}
        <div className="mb-6 flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-center sm:justify-between rounded-[1.5rem] sm:rounded-[2rem] border border-[#eddad3] bg-[linear-gradient(180deg,#fff_0%,#fff7f3_100%)] p-5 sm:p-6 md:p-8 shadow-[0_18px_40px_rgba(91,77,57,0.08)]">
          <div>
            <p className="text-[0.68rem] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#5f5d3e]/80">
              Welcome,
            </p>
            <h2 className="mt-1 sm:mt-2 font-[family:var(--font-display)] text-[2rem] leading-tight tracking-[-0.04em] text-[#3a2630] sm:text-[2.5rem] md:text-[3.5rem]">
              {displayName}
            </h2>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#7c6e68]">
              Manage your orders, profile, and account details here.
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 pt-2 sm:pt-0 border-t border-[#eddad3]/60 sm:border-t-0">
            <div className="flex h-14 sm:h-16 md:h-20 min-w-full sm:min-w-20 px-4 items-center justify-between sm:justify-center sm:flex-col rounded-2xl sm:rounded-full bg-[#fcf9f4] border border-[#ece6df] sm:border-0 text-[#5f5d3e] shadow-xs sm:shadow-inner">
              <div className="flex items-center gap-2 sm:flex-col sm:gap-0">
                <MdAccountBalanceWallet aria-hidden="true" className="inline-block shrink-0 align-middle text-[1.2rem] text-[#9c4049] sm:hidden" />
                <span className="text-[0.7rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-[#9b948d]">My Wallet</span>
              </div>
              <span className="font-[family:var(--font-display)] text-xl sm:text-lg md:text-xl font-bold leading-none text-[#3a2630]">
                ₹{(user?.partnerProfile?.walletBalance || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar and Page Content Grid */}
        <div className="grid gap-8 md:grid-cols-[0.35fr_0.65fr]">
          <AccountSidebar />
          {children}
        </div>
      </div>
    </main>
  );
}
