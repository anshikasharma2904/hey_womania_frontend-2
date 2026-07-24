import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaUserCircle } from "react-icons/fa";


const parseAmount = (value: number | string | undefined | null) => {
  if (typeof value === "number") return value;

  const parsed = parseFloat(String(value || "0").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateSP = (amount: number | string | undefined | null) => {
  return Number((parseAmount(amount) / 5).toFixed(2));
};

const formatSP = (value: number) => {
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(2)}`;
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
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Fetch orders from Express API
async function fetchOrders() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");
  
  if (!sessionToken) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders`, {
      headers: {
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      cache: "no-store"
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ? data.data : Array.isArray(data) ? data : [];
  } catch {
    return null;
  }
}

export default async function AccountPage() {
  const user = await fetchUser();
  if (!user || !["member", "partner"].includes(user.role)) {
    redirect("/login");
  }

  const recentOrders = await fetchOrders() || [];
 // Take top 3

  return (
    <section className="flex flex-col gap-6">
      {/* Orders Overview */}
      <div className="rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-6 shadow-[0_18px_40px_rgba(91,77,57,0.06)] md:p-8">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-[#5f5d3e]">
            Order Details
          </p>
          <Link href="/account/orders" className="text-xs font-semibold text-[#9c4049] underline decoration-[#9c4049]/30 underline-offset-4">
            View All Orders
          </Link>
        </div>
        <h2 className="mt-3 font-[family:var(--font-display)] text-3xl">
          Recent Orders
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#6d655d]">No recent orders found.</p>
          ) : (
            recentOrders.map((order: any) => {
              // Map dynamic status to icons and colors
              const isDelivered = order.status === "Delivered";
              const isOngoing = order.status === "Ongoing";
              const StatusIcon = isDelivered ? FaCheckCircle : isOngoing ? FaShippingFast : FaBoxOpen;
              const colorClass = isDelivered ? "text-[#367743]" : isOngoing ? "text-[#3b82f6]" : "text-[#d97706]";
              const bgClass = isDelivered ? "bg-[#edf7ef]" : isOngoing ? "bg-[#eff6ff]" : "bg-[#fffbeb]";
              const productTitle = order.items.length > 0 ? order.items[0].name : "Multiple Items";

              return (
                <Link
                  href={`/account/orders/${order.orderNumber.replace('#', '')}`}
                  key={order.id}
                  className="group flex flex-col justify-between gap-4 rounded-[1.2rem] border border-[#e8e2d9] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#cfae9d] hover:shadow-md sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-sm font-bold text-[#1c1c19] transition-colors group-hover:text-[#9c4049]">{productTitle}</p>
                    <p className="mt-1 text-xs text-[#6d655d]">
                      Order {order.orderNumber} • {order.date}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between gap-6 sm:justify-end">
                    <div className="flex flex-col items-end">
                      <p className="font-[family:var(--font-display)] text-xl text-[#1c1c19]">
                        {order.total}
                      </p>
                      <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#9c4049]">
                        +{formatSP(
    order.sellPoints !== undefined && Number(order.sellPoints) > 0
      ? Number(order.sellPoints)
      : calculateSP(order.total || 0)
  )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] ${bgClass} ${colorClass}`}
                      >
                        <StatusIcon className="text-[0.8rem]" />
                        {order.status}
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fcf9f4] text-[#8b837b] transition-colors group-hover:bg-[#fff0f1] group-hover:text-[#9c4049]">
                        <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
