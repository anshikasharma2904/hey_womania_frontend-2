"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUserAlt } from "react-icons/fa";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { IoMdHeart } from "react-icons/io";
import { NAVBAR_CATEGORY_MENUS } from "../app/category/category-data";

type CategoryLink = {
  label: string;
  href: string;
};

type CategoryMenuColumn = {
  title: string;
  links: CategoryLink[];
};

type CategoryMenu = {
  label: string;
  href: string;
  columns: CategoryMenuColumn[];
};

type LiveCategory = {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  sortOrder?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatCategoryLabel = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const normalizeMainCategory = (value: string) => {
  const formatted = formatCategoryLabel(value);
  if (formatted.toLowerCase() === "cloths") return "Clothes";
  return formatted;
};

const getCategoryPathParts = (value: string) =>
  value
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part && part.toLowerCase() !== "categories");

const buildCategoryMenus = (categories: LiveCategory[]): CategoryMenu[] => {
  const activeCategories = categories
    .filter((category) => category.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const directMenus: CategoryMenu[] = [];
  const menuMap = new Map<
    string,
    {
      label: string;
      href: string;
      columns: Map<string, CategoryLink[]>;
    }
  >();

  for (const category of activeCategories) {
    const parts = getCategoryPathParts(category.name || "");
    const href = `/category/${slugify(category.slug || category.name)}`;

    if (parts.length === 1) {
      const label = normalizeMainCategory(parts[0]);
      if (!directMenus.some((menu) => menu.label === label)) {
        directMenus.push({
          label,
          href,
          columns: []
        });
      }
      continue;
    }

    if (parts.length === 2) {
      // The user requested to remove the "View All" links for 2-level categories from the main navbar.
      // We still want to ensure the column heading exists so that the 3-level categories have a place to go,
      // or if there are no 3-level categories, at least the heading is shown.
      const [mainRaw, linkRaw] = parts;
      const mainCategory = normalizeMainCategory(mainRaw);
      const heading = formatCategoryLabel(linkRaw);

      if (!menuMap.has(mainCategory)) {
        menuMap.set(mainCategory, {
          label: mainCategory,
          href: `/category/${slugify(mainCategory)}`,
          columns: new Map()
        });
      }
      const menu = menuMap.get(mainCategory)!;
      if (!menu.columns.has(heading)) {
        menu.columns.set(heading, []);
      }
      continue;
    }

    if (parts.length < 3) continue;

    const [mainRaw, headingRaw, linkRaw] = parts;
    const mainCategory = normalizeMainCategory(mainRaw);
    const heading = formatCategoryLabel(headingRaw);

    if (!menuMap.has(mainCategory)) {
      menuMap.set(mainCategory, {
        label: mainCategory,
        href: `/category/${slugify(mainCategory)}`,
        columns: new Map()
      });
    }

    const menu = menuMap.get(mainCategory)!;

    if (!menu.columns.has(heading)) {
      menu.columns.set(heading, []);
    }

    if (!linkRaw) {
      continue;
    }

    const linkLabel = formatCategoryLabel(linkRaw);
    const links = menu.columns.get(heading)!;
    const exists = links.some((item) => item.label === linkLabel);
    if (!exists) {
      links.push({
        label: linkLabel,
        href
      });
    }
  }

  return NAVBAR_CATEGORY_MENUS;
};

export function MainNavbar() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState<{ name: string; role: string; isPartner: boolean } | null>(null);
  const [navbarMenus, setNavbarMenus] = useState<CategoryMenu[]>(NAVBAR_CATEGORY_MENUS);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const submitSearch = () => {
    const trimmedValue = searchValue.trim();
    router.push(
      trimmedValue
        ? `/category/all?search=${encodeURIComponent(trimmedValue)}`
        : "/category/all"
    );
    setMobileMenuOpen(false);
  };

  const handleSearchKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  };

  useEffect(() => {
    // Fetch user state
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data && data.ok && data.user) {
          setUser({
            name: data.user.firstName || data.user.name || "User",
            role: data.user.role,
            isPartner: !!data.user.isPartner
          });
        }
      })
      .catch(() => {});
  }, []);


  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!profileRef.current) {
        return;
      }

      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="sticky top-0 z-50 bg-[#fcf9f4] shadow-sm">
      <div className="bg-[#5f5d3e] px-5 py-2 text-center text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white md:px-16">
        Free shipping on orders above ₹999 • New-season arrivals now live
      </div>

      <header className="border-b border-[#cac7b9]/40 bg-[#fcf9f4] px-5 py-3 md:px-12">
        <div className="flex items-center justify-between gap-3">
          {/* Left Side: Menu and Search */}
          <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 text-[#343434] transition-opacity duration-300 hover:opacity-70"
            >
              <span className="material-symbols-outlined text-[1.4rem]">menu</span>
            </button>
            <Link
              href="/category/all"
              className="hidden items-center gap-2 lg:flex text-[#343434] transition-opacity duration-200 hover:opacity-70"
            >
              <span className="material-symbols-outlined text-[1.2rem]">search</span>
              <span className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#343434] mr-2">Search</span>
            </Link>
            <Link
              href="/category/all"
              className="flex items-center text-[#343434] lg:hidden"
            >
              <span className="material-symbols-outlined text-[1.3rem]">search</span>
            </Link>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="flex items-center"
            >
              <img src="/logo.png" alt="HeyWomaniyaa" className="h-12 sm:h-16 w-auto object-contain md:h-[4.5rem]" />
            </Link>
          </div>

          {/* Right Side: Icons */}
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-5 lg:gap-6">

            <div
              ref={profileRef}
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
              className="relative shrink-0"
            >
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex flex-col items-center justify-center text-[#22253a]"
              >
                <FaUserAlt className="text-[1.15rem] text-[#c53b45]" />
              </button>

              <div
                className={`absolute left-1/2 top-[100%] z-50 w-[300px] -translate-x-1/2 pt-3 transition-all duration-200 ${
                  profileOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                <div className="overflow-hidden rounded-[0.95rem] border border-[#e7ddd2] bg-[linear-gradient(180deg,#fffdfb_0%,#f8f0e8_100%)] shadow-[0_18px_40px_rgba(58,45,35,0.12)]">
                  <div className="p-5">
                    {user ? (
                      <div className="flex flex-col gap-2">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#a98071]">
                          Hello, {user.name}
                        </p>
                        {!(user.role === "partner" || user.isPartner) ? (
                          <Link
                            href="/account"
                            onClick={() => setProfileOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm text-[#48473d] transition hover:bg-[#fbf4ec] hover:text-[#9c4049]"
                          >
                            My Account
                          </Link>
                        ) : null}
                        <Link
                          href="/account/orders"
                          onClick={() => setProfileOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm text-[#48473d] transition hover:bg-[#fbf4ec] hover:text-[#9c4049]"
                        >
                          My Orders
                        </Link>
                        {user.role === "partner" || user.isPartner ? (
                          <>
                            <Link
                              href="/earnings"
                              onClick={() => setProfileOpen(false)}
                              className="block rounded-lg px-3 py-2 text-sm text-[#48473d] transition hover:bg-[#fbf4ec] hover:text-[#9c4049]"
                            >
                              Partner Dashboard
                            </Link>
                            <Link
                              href="/earnings/wallet"
                              onClick={() => setProfileOpen(false)}
                              className="block rounded-lg px-3 py-2 text-sm text-[#48473d] transition hover:bg-[#fbf4ec] hover:text-[#9c4049]"
                            >
                              Wallet
                            </Link>
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={async () => {
                            setProfileOpen(false);
                            await fetch("/api/auth/logout", { method: "POST" });
                            setUser(null);
                            window.location.href = "/login";
                          }}
                          className="mt-3 block w-full rounded-lg bg-[#9c4049] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-[#81353f] hover:-translate-y-0.5"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Link
                          href="/login"
                          onClick={() => setProfileOpen(false)}
                          className="flex w-full items-center justify-center rounded-xl bg-[#5f5d3e] px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#48473d]"
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setProfileOpen(false)}
                          className="flex w-full items-center justify-center rounded-xl border border-[#d9cfc5] px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1c19] transition hover:bg-[#f7f0e9]"
                        >
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/wishbag"
              className="flex shrink-0 flex-col items-center justify-center text-[#22253a]"
            >
              <IoMdHeart className="text-[1.35rem] text-[#c53b45]" />
            </Link>

            <Link
              href="/cart"
              className="flex shrink-0 flex-col items-center justify-center text-[#22253a]"
            >
              <HiMiniShoppingBag className="text-[1.3rem] text-[#c53b45]" />
            </Link>
          </div>
        </div>


      </header>
{/* 
      <div
        className={`fixed inset-0 z-[60] bg-[#2d251f]/40 transition-opacity duration-300 ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      /> */}

      <aside
        className={`fixed left-0 top-0 z-[70] flex h-full w-[88vw] max-w-[360px] flex-col bg-[linear-gradient(180deg,#fffdfb_0%,#f8f0e8_100%)] shadow-[0_24px_60px_rgba(58,45,35,0.18)] transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#ece6df] px-5 py-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#a98071]">
              HeyWomaniyaa
            </p>
            <p className="mt-1 text-sm text-[#5d6177]">Shop fashion across every edit</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dacdc0] text-[#5f5d3e]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 pt-5">
          <div className="grid gap-3">
            {user ? (
              <Link
                href={user.role === "partner" || user.isPartner ? "/earnings" : "/account"}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-[1rem] border border-[#e7ddd2] bg-[linear-gradient(180deg,#fbf4ec_0%,#f2e5d7_100%)] p-4"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#a98071]">
                  Account
                </p>
                <h3 className="mt-2 text-base font-semibold text-[#35384b]">{user.name}</h3>
              </Link>
            ) : (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-[1rem] border border-[#e7ddd2] bg-[linear-gradient(180deg,#fbf4ec_0%,#f2e5d7_100%)] p-4"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#a98071]">
                  Account
                </p>
                <h3 className="mt-2 text-base font-semibold text-[#35384b]">Sign In / Sign Up</h3>
              </Link>
            )}
          </div>

          <div className="mt-6 space-y-5">
            {navbarMenus.map((menu) => (
              <div key={menu.label} className="rounded-[1.2rem] border border-[#ece6df] bg-white/70 p-4">
                <Link
                  href={menu.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.14em] text-[#9c4049]"
                >
                  <span>{menu.label}</span>
                  <span className="material-symbols-outlined text-[1.2rem]">expand_more</span>
                </Link>

                {menu.columns.length > 0 ? (
                  <div className="mt-3 grid gap-4">
                    {menu.columns.map((column) => (
                      <div key={`${menu.label}-${column.title}`}>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#6f5f56]">
                          {column.title}
                        </p>
                        <div className="mt-2 space-y-2">
                          {column.links.length > 0 ? (
                            column.links.map((item, linkIdx) => (
                              <Link
                                key={`${item.label}-${linkIdx}`}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-sm leading-6 text-[#2d3147]"
                              >
                                {item.label}
                              </Link>
                            ))
                          ) : column.title === "Coming Soon" ? (
                            <p className="text-sm text-[#8b837b]">Coming soon</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[1rem] border border-[#ece6df] bg-white px-3 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#35384b]"
            >
              Account
            </Link>
            <Link
              href="/wishbag"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[1rem] border border-[#ece6df] bg-white px-3 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#35384b]"
            >
              Wishbag
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-[1rem] border border-[#ece6df] bg-white px-3 py-4 text-center text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#35384b]"
            >
              Bag
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
