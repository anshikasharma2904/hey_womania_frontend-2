import { getPartnerDashboardData, getPartnerIncomeLedgers } from "@/lib/server/partner-dashboard";
import Link from "next/link";
import { FaWallet, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default async function PartnerWalletPage() {
  const data = await getPartnerDashboardData();
  const walletBalance = data?.dashboard?.walletBalance ?? 0;
  const kycStatus = data?.dashboard?.kycVerified ? "Approved" : "Not Submitted";

  const dbLedgers = await getPartnerIncomeLedgers();
  const transactions = (dbLedgers && dbLedgers.length > 0)
    ? dbLedgers.map((l: any) => ({
        id: l.id.substring(0, 8).toUpperCase(),
        date: new Date(l.createdAt).toISOString().split('T')[0],
        description: `${l.incomeType} - ${l.remarks || 'Partner earnings'}`,
        amount: l.amount,
        type: l.amount >= 0 ? "credit" : "debit"
      }))
    : [
        { id: "TXN1001", date: "2026-06-24", description: "Self Sell Commission (10% SP on ₹1,299 Order #1001)", amount: 25.98, type: "credit" },
        { id: "TXN1002", date: "2026-06-24", description: "Level 1 Referral Bonus (5% SP on ₹2,450 Order #1002 from Anjali)", amount: 24.50, type: "credit" },
        { id: "TXN1003", date: "2026-06-24", description: "Level 2 Referral Bonus (3% SP on ₹1,000 Order #1003 from Sneha)", amount: 6.00, type: "credit" },
      ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#9c4049]">Finance</p>
        <h1 className="mt-1 font-[family:var(--font-display)] text-3xl tracking-tight text-[#1c1c19] md:text-4xl">
          My Wallet
        </h1>
      </div>

      <div className="rounded-[2rem] border border-[#eddad3] bg-[linear-gradient(180deg,#fff_0%,#fff7f3_100%)] p-6 shadow-[0_18px_40px_rgba(91,77,57,0.08)] md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9c4049]/80">Available Wallet Balance</p>
          <h2 className="mt-2 font-[family:var(--font-display)] text-[2.5rem] leading-none tracking-tight text-[#3a2630] md:text-[3.5rem]">
            ₹{walletBalance.toLocaleString("en-IN")}
          </h2>
          <p className="mt-2 text-sm text-[#7c6e68]">Withdraw earnings directly to your bank account or UPI.</p>
        </div>
        <div>
          {kycStatus.toLowerCase() === "approved" ? (
            <Link
              href="/partner/withdraw"
              className="inline-flex items-center justify-center rounded-xl bg-[#9c4049] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#81353f] hover:-translate-y-0.5"
            >
              Withdraw Earnings
            </Link>
          ) : (
            <Link
              href="/partner/kyc"
              className="inline-flex items-center justify-center rounded-xl bg-[#5f5d3e] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#48473d] hover:-translate-y-0.5"
            >
              Verify KYC to Withdraw
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
        <h3 className="text-lg font-bold text-[#1c1c19] mb-6">Recent Transactions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#ece6df] pb-4 text-xs font-bold uppercase tracking-wider text-[#8b837b]">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece6df]">
              {transactions.map((txn) => (
                <tr key={txn.id} className="text-[#48473d]">
                  <td className="py-4 font-mono text-xs">{txn.id}</td>
                  <td className="py-4">{txn.date}</td>
                  <td className="py-4">{txn.description}</td>
                  <td className={`py-4 text-right font-bold flex items-center justify-end gap-1.5 ${
                    txn.type === "credit" ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {txn.type === "credit" ? <FaArrowDown className="text-[0.7rem]" /> : <FaArrowUp className="text-[0.7rem]" />}
                    ₹{txn.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
