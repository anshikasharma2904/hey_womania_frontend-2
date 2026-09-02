"use client";

import { useState } from "react";
import Link from "next/link";
import { FaBoxOpen, FaCheckCircle, FaTruck } from "react-icons/fa";

export default function NetworkOrdersView({ initialOrders }: { initialOrders: any[] }) {
  const [activeTab, setActiveTab] = useState<"partner" | "customer">("partner");

  const orders = activeTab === "partner" 
    ? initialOrders.filter(o => o.role === "partner")
    : initialOrders.filter(o => o.role === "user" || o.role === "member");

  const totalOrders = orders.length;
  const deliveredCount = orders.filter((o: any) => o.status === "Delivered").length;
  const inTransitCount = orders.filter((o: any) => o.status === "Shipped" || o.status === "Ongoing").length;

  const stats = [
    { label: "Total Orders", value: `${totalOrders}`, icon: FaBoxOpen },
    { label: "Delivered", value: `${deliveredCount}`, icon: FaCheckCircle },
    { label: "In Transit", value: `${inTransitCount}`, icon: FaTruck }
  ];

  return (
    <section className="px-3 py-4 sm:px-4 md:px-6 md:py-6">
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-[#ead9d1] bg-white p-1">
          <button
            onClick={() => setActiveTab("partner")}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
              activeTab === "partner"
                ? "bg-[#9c4049] text-white"
                : "text-[#6d655d] hover:text-[#9c4049]"
            }`}
          >
            Partner Orders
          </button>
          <button
            onClick={() => setActiveTab("customer")}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
              activeTab === "customer"
                ? "bg-[#9c4049] text-white"
                : "text-[#6d655d] hover:text-[#9c4049]"
            }`}
          >
            Customer Orders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 justify-center md:justify-start">
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
            Downline Orders
          </h2>
          <Link href="/earnings/referrals" className="text-sm font-semibold text-[#9c4049]">
            Referral Tree
          </Link>
        </div>
        <div className="mt-4 space-y-3 md:space-y-4">
          {orders.length > 0 ? (
            orders.map((order: any) => (
              <div key={order.id} className="grid gap-3 rounded-[1rem] bg-[#fff9f7] p-3 md:grid-cols-[1.4fr_0.9fr] md:items-center md:gap-4 md:rounded-[1.2rem] md:p-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#9c4049]/70">{order.id}</p>
                  <p className="mt-1 text-sm font-semibold text-[#2a2430] md:text-base">Customer: {order.customer}</p>
                  <p className="mt-1 text-xs leading-5 text-[#6d655d] md:text-sm">
                    Level {order.level} <span className="mx-1">•</span> {order.email} <span className="mx-1">•</span> <span className="uppercase text-[#d89c4c]">{order.role}</span>
                  </p>
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
              No orders found for this category.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
