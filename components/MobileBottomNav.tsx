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
      className="fixed bottom-0 inset-x-0 z-50 w-full border-t border-[#e8dfd6] bg-white/95 px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      <div className="flex h-14 w-full items-center justify-around">
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
