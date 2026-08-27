"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { label: "Central Wallet", href: "/admin/central-wallet" },
  { label: "Zoho Inventory", href: "/admin/zoho-inventory" }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full max-w-[280px] shrink-0 border-r border-[#ece6df] bg-white/80 p-6 backdrop-blur-md">
      <div className="sticky top-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9c4049]">
          Admin
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#1c1c19]">
          Control Panel
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#6d655d]">
          Manage finance operations and inventory tools from one place.
        </p>

        <nav className="mt-8 space-y-3">
          {adminLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#111111] bg-[#111111] text-white"
                    : "border-[#ece6df] bg-[#fcf9f4] text-[#48473d] hover:border-[#9c4049] hover:text-[#9c4049]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
