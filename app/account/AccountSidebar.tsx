"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const accountLinks = [
  { label: "Dashboard", href: "/account" },
  { label: "Profile Details", href: "/account/profile" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Payment Methods", href: "/account/payments" }
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-6 shadow-[0_18px_40px_rgba(91,77,57,0.06)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[#5f5d3e]">
          My Account
        </p>
        <h1 className="mt-3 font-[family:var(--font-display)] text-4xl">
          Welcome
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#6d655d]">
          Manage your profile, track your orders, and see your earnings progress.
        </p>

        <nav className="mt-8 space-y-3">
          {accountLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block w-full rounded-full border px-4 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "border-[#5f5d3e] bg-[#5f5d3e] text-white"
                    : "border-[#e2ddd6] text-[#48473d] hover:border-[#5f5d3e]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
