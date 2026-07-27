import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { FaBoxOpen, FaShippingFast, FaCheckCircle } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
async function fetchOrders() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");
  
  if (!sessionToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/orders`, {
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

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("hey_womania_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const allOrders = await fetchOrders() || [];

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-6 shadow-[0_18px_40px_rgba(91,77,57,0.06)] md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#5f5d3e]">
          Order History
        </p>
        <h2 className="mt-3 font-[family:var(--font-display)] text-3xl">
          All Orders
        </h2>

        <div className="mt-8 flex flex-col gap-5">
          {allOrders.length === 0 ? (
            <p className="text-sm text-[#6d655d]">No orders found in your history.</p>
          ) : (
            allOrders.map((order: any) => {
              const isDelivered = order.status === "Delivered";
              const isOngoing = order.status === "Ongoing";
              const StatusIcon = isDelivered ? FaCheckCircle : isOngoing ? FaShippingFast : FaBoxOpen;
              const colorClass = isDelivered ? "text-[#367743]" : isOngoing ? "text-[#3b82f6]" : "text-[#d97706]";
              const bgClass = isDelivered ? "bg-[#edf7ef]" : isOngoing ? "bg-[#eff6ff]" : "bg-[#fffbeb]";
              const orderItems = Array.isArray(order.items) ? order.items : [];
              const productTitle = orderItems.length > 0 ? orderItems[0].name : "Multiple Items";
              const totalQuantity = orderItems.reduce((acc: number, item: any) => acc + (item.qty || item.quantity || 0), 0);
              const orderNumber = String(order.orderNumber || order.id || "").replace(/^#/, "");

              return (
                <Link
                  href={`/account/orders/${orderNumber}`}
                  key={order.id}
                  className="group flex flex-col gap-4 rounded-[1.5rem] border border-[#e8e2d9] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#cfae9d] hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-[#1c1c19] transition-colors group-hover:text-[#9c4049]">{productTitle}</p>
                      <span className="rounded-md bg-[#f6f3ee] px-2 py-0.5 text-[10px] font-semibold text-[#8b837b]">
                        Qty: {totalQuantity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6d655d]">
                      Order {order.orderNumber} • Placed on {order.date}
                    </p>
                  </div>
                  
                  <div className="flex flex-row-reverse items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-2">
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
                      <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#fcf9f4] text-[#8b837b] transition-colors group-hover:bg-[#fff0f1] group-hover:text-[#9c4049] sm:flex">
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
