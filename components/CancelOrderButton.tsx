"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  // Hide the button if the order is already cancelled, shipped, or delivered
  const nonCancellableStatuses = ["Cancelled", "Returned", "Shipped", "Delivered", "Completed"];
  if (nonCancellableStatuses.includes(currentStatus)) {
    return null;
  }

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Order cancelled successfully.");
        router.refresh();
      } else {
        alert(data.error || "Failed to cancel order. It might have already been processed.");
      }
    } catch (err) {
      alert("An error occurred while cancelling the order.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isCancelling}
      className="mt-4 sm:mt-0 sm:ml-4 inline-flex items-center justify-center rounded-full border-2 border-[#ef6f63] bg-transparent px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] text-[#ef6f63] transition-all hover:bg-[#ef6f63] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isCancelling ? "Cancelling..." : "Cancel Order"}
    </button>
  );
}
