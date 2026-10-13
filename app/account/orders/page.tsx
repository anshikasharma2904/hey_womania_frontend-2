import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { FaBoxOpen, FaShippingFast, FaCheckCircle } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


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
    <section className="flex flex-col gap-6 w-full">
      <div className="rounded-[1.5rem] md:rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-4 sm:p-6 md:p-8 shadow-[0_18px_40px_rgba(91,77,57,0.06)]">
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
                  <div className="flex-1">
                    <div className="flex items-center justify-between border-b border-[#f2ede7] pb-3 mb-3">
                      <div>
                        <p className="text-xs font-semibold text-[#8b837b]">
                          Order <span className="font-bold text-[#1c1c19]">#{order.orderNumber}</span> • {order.date}
                        </p>
                      </div>
                      <span className="rounded-md bg-[#f6f3ee] px-2.5 py-0.5 text-[11px] font-bold text-[#5f5d3e]">
                        {totalQuantity} {totalQuantity === 1 ? "Item" : "Items"}
                      </span>
                    </div>

                    {/* All Products in Order */}
                    <div className="flex flex-col gap-2.5">
                      {orderItems.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-[#f0ede8] overflow-hidden shrink-0 border border-[#e8e2d9]/60">
                            <img
                              src={item.img || item.image || "/products/product-traditional-1.png"}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-[#1c1c19] truncate group-hover:text-[#9c4049] transition-colors">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-[#6d655d]">
                              Qty: {item.qty || item.quantity || 1} • <span className="font-semibold text-[#1c1c19]">{typeof item.price === "number" ? `₹${item.price.toLocaleString("en-IN")}` : item.price}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-row-reverse items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-2">
                    <div className="flex flex-col items-end">
                      <p className="font-[family:var(--font-display)] text-xl text-[#1c1c19]">
                        {order.total}
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
