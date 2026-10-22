"use client";

import React from "react";
import { FaPrint, FaArrowDown, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

interface InvoicePrintBarProps {
  orderNumber: string;
}

export default function InvoicePrintBar({ orderNumber }: InvoicePrintBarProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#ece6df] bg-white p-4 shadow-sm print:hidden">
      <Link
        href="/account/orders"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6d655d] transition-colors hover:text-[#9c4049]"
      >
        <FaArrowLeft /> Back to Orders
      </Link>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-[#5f5d3e] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#48473d]"
        >
          <FaArrowDown /> Download PDF
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg border border-[#5f5d3e] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#5f5d3e] transition hover:bg-[#5f5d3e] hover:text-white"
        >
          <FaPrint /> Print Invoice
        </button>
      </div>
    </div>
  );
}
