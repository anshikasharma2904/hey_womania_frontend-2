import Link from "next/link";
import { FaArrowLeft, FaBoxOpen, FaCheckCircle, FaTruck } from "react-icons/fa";
import { getPartnerOrders } from "@/lib/server/partner-dashboard";

export default async function PartnerOrdersPage() {
  const rawOrders = await getPartnerOrders();
  const dbOrders = Array.isArray(rawOrders) ? rawOrders : (rawOrders as any)?.data ?? [];
  
  const totalOrders = dbOrders.length;
  const deliveredCount = dbOrders.filter((o: any) => o.status === "Delivered").length;
  const inTransitCount = dbOrders.filter((o: any) => o.status === "Shipped" || o.status === "Ongoing").length;

  const orders = dbOrders.map((o: any) => ({
    id: o.orderNumber || o.id || "N/A",
    customer: o.address?.fullName || o.address?.name || "Self",
    product: o.items?.[0]?.name || "Product Bundle",
    amount: o.total || "₹0",
    status: o.status || "Pending",
    date: o.date || "N/A"
  }));

  const stats = [
    { label: "Total Orders", value: `${totalOrders}`, icon: FaBoxOpen },
    { label: "Delivered", value: `${deliveredCount}`, icon: FaCheckCircle },
    { label: "In Transit", value: `${inTransitCount}`, icon: FaTruck }
  ];
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] pt-10 text-[#1c1c19] sm:pt-10 md:pt-10 lg:pt-10">
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-5 md:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-[#ead9d1] bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] shadow-[0_24px_70px_rgba(127,49,68,0.10)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#ead9d1] px-4 py-4 sm:px-5 md:px-6">
            <Link href="/earnings" className="inline-flex items-center gap-2 rounded-full border border-[#ead9d1] bg-white px-4 py-2 text-sm font-semibold text-[#61313d] transition-colors hover:bg-[#fff6f3]">
              <FaArrowLeft className="text-[0.9rem]" />
              Back
            </Link>
            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-[1.8rem] leading-[0.95] tracking-[-0.04em] text-[#5c2530] sm:text-[2.4rem] md:text-[3rem]">
                Partner Orders
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-[#9c4049]/80 sm:text-[0.72rem]">
                Order history and delivery status
              </p>
            </div>
            <div className="w-[82px] sm:w-[110px]" />
          </div>

          <section className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-[1.15rem] border border-[#f0ddd6] bg-white px-3 py-4 text-center shadow-[0_10px_24px_rgba(95,93,62,0.04)] md:px-4 md:py-5">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3ee] text-[#9c4044] md:h-11 md:w-11">
                      <Icon className="text-[1rem] md:text-[1.1rem]" />
                    </div>
                    <p className="mt-2 text-[1.1rem] font-bold tracking-[-0.04em] text-[#2a2430] md:text-[1.4rem]">{stat.value}</p>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-[#7b6f69] md:text-xs">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-[1.3rem] border border-[#f0ddd6] bg-white p-4 shadow-[0_12px_28px_rgba(95,93,62,0.04)] md:mt-5 md:rounded-[1.6rem] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-[family:var(--font-display)] text-[1.25rem] tracking-[-0.03em] text-[#382933] sm:text-[1.45rem] md:text-[1.7rem]">
                  Recent Sell Orders
                </h2>
                <Link href="/earnings/referrals" className="text-sm font-semibold text-[#9c4049]">
                  Referral Tree
                </Link>
              </div>
              <div className="mt-4 space-y-3 md:space-y-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="grid gap-3 rounded-[1rem] bg-[#fff9f7] p-3 md:grid-cols-[1.4fr_0.9fr] md:items-center md:gap-4 md:rounded-[1.2rem] md:p-4">
                      <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#9c4049]/70">{order.id}</p>
                        <p className="mt-1 text-sm font-semibold text-[#2a2430] md:text-base">{order.product}</p>
                        <p className="mt-1 text-xs leading-5 text-[#6d655d] md:text-sm">Customer: {order.customer}</p>
                      </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end md:text-right">
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#9c4049] bg-[#fff0f3]">{order.status}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#2a2430] md:text-base">{order.amount}</p>
                          <p className="text-[0.65rem] text-[#7b6f69]">{order.date}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs py-8 text-[#7c6e68] italic border border-dashed border-[#ead9d1] rounded-xl">
                    No active sell orders found.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
