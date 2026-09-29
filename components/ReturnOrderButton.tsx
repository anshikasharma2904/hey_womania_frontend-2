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
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (deliveredDate < sevenDaysAgo) {
    return null;
  }

  const handleReturn = async () => {
    if (!window.confirm("Are you sure you want to request a return for this order?")) {
      return;
    }

    setIsReturning(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Return requested successfully.");
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
    <button
      onClick={handleReturn}
      disabled={isReturning}
      className="mt-4 sm:mt-0 sm:ml-4 inline-flex items-center justify-center rounded-full border-2 border-[#5c2530] bg-transparent px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#5c2530] transition-all hover:bg-[#5c2530] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isReturning ? "Requesting..." : "Return Order"}
    </button>
  );
}
