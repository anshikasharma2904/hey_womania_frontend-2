"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiHome,
  HiOutlineShoppingBag,
  HiShoppingBag,
  HiOutlineHeart,
  HiHeart,
  HiOutlineChatBubbleLeftRight,
  HiChatBubbleLeftRight
} from "react-icons/hi2";
import { useWishbag } from "@/contexts/WishbagContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useWishbag();
  const wishbagCount = items?.length || 0;

  // Do not show on admin or login/checkout full-screen modals if unwanted, or show universally
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      iconOutline: HiOutlineHome,
      iconFilled: HiHome,
      isActive: pathname === "/"
    },
    {
      label: "Shop",
      href: "/category/all",
      iconOutline: HiOutlineShoppingBag,
      iconFilled: HiShoppingBag,
      isActive: pathname.startsWith("/category")
    },
    {
      label: "Wishlist",
      href: "/wishbag",
      iconOutline: HiOutlineHeart,
      iconFilled: HiHeart,
      badge: wishbagCount,
      isActive: pathname === "/wishbag"
    },
    {
      label: "Support",
      href: "https://wa.me/918006637777",
      iconOutline: HiOutlineChatBubbleLeftRight,
      iconFilled: HiChatBubbleLeftRight,
      isExternal: true,
      isActive: false
    }
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-3 inset-x-3 z-50 md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around rounded-3xl border border-[#e8dfd6] bg-white/95 px-2 py-1 shadow-[0_12px_36px_rgba(28,24,22,0.14)] backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.isActive ? item.iconFilled : item.iconOutline;
          const linkProps = item.isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};

          return (
            <Link
              key={item.label}
              href={item.href}
              {...linkProps}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
                item.isActive ? "text-[#c53b45]" : "text-[#4a4540] hover:text-[#111111]"
              }`}
            >
              <div className="relative">
                {/* Diwali Diya festive touch on Home icon (matching reference design) */}
                {item.label === "Home" && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-1 -left-2 text-[0.95rem] drop-shadow-[0_0_8px_rgba(255,165,0,0.8)] filter select-none animate-pulse"
                  >
                    🪔
                  </span>
                )}
                <Icon className={`text-[1.45rem] ${item.isActive ? "scale-105" : ""}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c53b45] px-1 text-[0.62rem] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 text-[0.68rem] tracking-tight ${
                  item.isActive ? "font-bold text-[#c53b45]" : "font-medium text-[#5a544e]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
