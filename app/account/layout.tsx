import type { ReactNode } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { cookies } from "next/headers";
import { AccountSidebar } from "./AccountSidebar";


const parseAmount = (value: number | string | undefined | null) => {
  if (typeof value === "number") return value;

  const parsed = parseFloat(String(value || "0").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateSP = (amount: number | string | undefined | null) => {
  return Number((parseAmount(amount) / 5).toFixed(2));
};

const formatSP = (value: number) => {
  return Number.isInteger(value) ? `${value} SP` : `${value.toFixed(2)} SP`;
};

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
  const sellPointsDisplay = orders
  .filter((o: any) => String(o.status).toLowerCase() === "delivered")
  .reduce((sum: number, o: any) => {
    const savedSP = parseAmount(o.sellPoints);

    const orderSP =
      savedSP > 0
        ? savedSP
        : calculateSP(o.total || 0);

    return Number((sum + orderSP).toFixed(2));
  }, 0);

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-5 pb-16 pt-10 text-[#1c1c19] md:px-16 md:pt-10 lg:pt-10">
      <div className="mx-auto max-w-6xl">
        {/* Total Sell Points Box at the very top */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between rounded-[2rem] border border-[#eddad3] bg-[linear-gradient(180deg,#fff_0%,#fff7f3_100%)] p-6 shadow-[0_18px_40px_rgba(91,77,57,0.08)] md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5f5d3e]/80">
              Welcome Back,
            </p>
            <h2 className="mt-2 font-[family:var(--font-display)] text-[2.5rem] leading-none tracking-[-0.04em] text-[#3a2630] md:text-[3.5rem]">
              {displayName}
            </h2>
            <p className="mt-2 text-sm text-[#7c6e68]">
              Manage your orders, profile, and account details here.
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {isPartner && (
              <Link
                href="/earnings"
                className="flex items-center justify-center rounded-xl bg-[#5f5d3e] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-[#48473d] hover:-translate-y-0.5"
              >
                Enter Earning Panel
              </Link>
            )}
            <div className="hidden h-16 min-w-16 px-4 flex-col items-center justify-center rounded-full bg-[#fcf9f4] text-[#5f5d3e] shadow-inner sm:flex md:h-20 md:min-w-20">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#9b948d]">Wallet</span>
              <span className="font-[family:var(--font-display)] text-lg leading-none md:text-xl text-[#3a2630]">
                ₹{user?.partnerProfile?.walletBalance || 0}
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
