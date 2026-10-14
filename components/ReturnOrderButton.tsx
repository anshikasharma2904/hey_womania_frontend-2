"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function ReturnOrderButton({ orderId, currentStatus, deliveredAt }: { orderId: string, currentStatus: string, deliveredAt?: string }) {
  const [isReturning, setIsReturning] = useState(false);
  const router = useRouter();

  if (currentStatus !== "Delivered" || !deliveredAt) {
    return null;
  }

  const deliveredDate = new Date(deliveredAt);
  const now = Date.now();
  const msElapsed = now - deliveredDate.getTime();
  const daysElapsed = Math.floor(msElapsed / (24 * 60 * 60 * 1000));
  const daysRemaining = Math.max(0, 7 - daysElapsed);

  if (daysElapsed >= 7) {
    return null;
  }

  const handleReturn = async () => {
    const reason = window.prompt("Please enter the reason for your return (e.g. Size didn't fit, Defective, Wrong item):");
    if (reason === null) {
      return; // cancelled prompt
    }

    setIsReturning(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || "Customer requested return" })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Return requested successfully! We have scheduled a reverse pickup via Shiprocket.");
        router.refresh();
      } else {
        alert(data.error || "Failed to request return.");
      }
    } catch (err) {
      alert("An error occurred while requesting the return.");
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleReturn}
        disabled={isReturning}
        className="inline-flex items-center justify-center rounded-full border-2 border-[#5c2530] bg-transparent px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-[#5c2530] transition-all hover:bg-[#5c2530] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
      >
        {isReturning ? "Requesting..." : "Return Order"}
      </button>
      <span className="text-[11px] text-[#8b837b] hidden sm:inline">
        ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left to return)
      </span>
    </div>
  );
}
