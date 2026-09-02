import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { getNetworkOrders } from "@/lib/server/network-orders";
import NetworkOrdersView from "@/components/NetworkOrdersView";

export default async function NetworkOrdersPage() {
  const rawOrders = await getNetworkOrders();
  const dbOrders = Array.isArray(rawOrders) ? rawOrders : (rawOrders as any)?.orders ?? (rawOrders as any)?.data ?? [];

  const orders = dbOrders.map((o: any) => {
    const totalNum = parseFloat((o.total || "").replace(/[^0-9.]/g, ""));
    const commRate = o.level === 1 ? 0.02 : o.level === 2 ? 0.01 : o.level === 3 ? 0.005 : 0.05;
    const commissionStr = !isNaN(totalNum) ? `₹${(totalNum * commRate).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : "₹0";

    return {
      id: o.orderNumber || o.id || "N/A",
      customer: o.customerName || "Unknown",
      email: o.customerEmail || "",
      level: o.level || 0,
      role: o.role || 'user',
      product: o.items?.[0]?.name || "Product Bundle",
      amount: commissionStr,
      status: o.status || "Pending",
      date: o.date || "N/A"
    };
  });

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
                Orders placed by your downline team
              </p>
            </div>
            <div className="w-[82px] sm:w-[110px]" />
          </div>

          <NetworkOrdersView initialOrders={orders} />
        </div>
      </div>
    </main>
  );
}
