import { getPartnerDashboardData } from "@/lib/server/partner-dashboard";
import { WithdrawForm } from "@/components/WithdrawForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default async function EarningsWithdrawPage() {
  const data = await getPartnerDashboardData();
  const walletBalance = data?.dashboard?.walletBalance ?? 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f2_0%,#fbf1ec_34%,#f5e8e0_100%)] pt-44 text-[#1c1c19] sm:pt-36 md:pt-40 lg:pt-44">
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-5 md:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-[#ead9d1] bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] shadow-[0_24px_70px_rgba(127,49,68,0.10)]">
          <header className="flex items-center justify-between gap-3 border-b border-[#ead9d1] px-4 py-4 sm:px-5 md:px-6">
            <Link
              href="/earnings/wallet"
              className="inline-flex items-center gap-2 rounded-full border border-[#ead9d1] bg-white px-4 py-2 text-sm font-semibold text-[#61313d] transition-colors hover:bg-[#fff6f3]"
            >
              <FaArrowLeft className="text-[0.9rem]" />
              Back to Wallet
            </Link>
            <div className="text-center">
              <p className="font-[family:var(--font-display)] text-[1.8rem] leading-[0.95] tracking-[-0.04em] text-[#5c2530] sm:text-[2.4rem] md:text-[3rem]">
                Withdraw Funds
              </p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.24em] text-[#9c4049]/80 sm:text-[0.72rem]">
                Payout your wallet balance to UPI or bank
              </p>
            </div>
            <div className="w-[120px]" />
          </header>

          <section className="px-4 py-6 md:p-8 max-w-2xl mx-auto">
            <WithdrawForm walletBalance={walletBalance} />
          </section>
        </div>
      </div>
    </main>
  );
}
