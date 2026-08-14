"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUserAlt } from "react-icons/fa";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { IoMdHeart } from "react-icons/io";

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

  const parsedMenus = Array.from(menuMap.values()).map((menu) => ({
    label: menu.label,
    href: menu.href,
    columns: Array.from(menu.columns.entries()).map(([title, links]) => ({
      title,
      links: links.sort((a, b) => a.label.localeCompare(b.label))
    }))
  }));

  const MENU_PRIORITY: Record<string, number> = {
    clothes: 1,
    cloths: 1,
    jewellery: 2,
    jewelry: 2,
    bag: 3,
    bags: 3,
    combo: 4
  };

  const getPriority = (label: string) => {
    const key = String(label || "").toLowerCase();
    return MENU_PRIORITY[key] ?? 99;
  };

  const DEFAULT_FALLBACK_MENUS: CategoryMenu[] = [
    {
      label: "Clothes",
      href: "/category/clothes",
      columns: [
        {
          title: "Traditional Wear",
          links: [
            { label: "Kurta Sets", href: "/category/clothes-traditional-wear-kurta-set-for-women" },
            { label: "Kurta Sets with Dupatta", href: "/category/clothes-traditional-wear-kurta-set-for-women-with-dupatta" },
            { label: "Suit Sets", href: "/category/suit-set" },
            { label: "Lawn Suits", href: "/category/lawn-suit" }
          ]
        },
        {
          title: "Western Wear",
          links: [
            { label: "Co-Ord Sets", href: "/category/clothes-western-wear-co-ordset" }
          ]
        }
      ]
    },
    {
      label: "Jewellery",
      href: "/category/jewellery",
      columns: [
        {
          title: "Categories",
          links: [
            { label: "Necklace", href: "/category/jewellery-necklace" }
          ]
        }
      ]
    },
    {
      label: "Bags",
      href: "/category/bag",
      columns: [
        {
          title: "Categories",
          links: [
            { label: "Mini Bags", href: "/category/bag-mini-bags" },
            { label: "Quilted Handbags", href: "/category/bag-mini-bags-quilted-handbag" }
          ]
        }
      ]
    }
  ];

  const allMenus = [...parsedMenus, ...directMenus];
  const finalMenus = allMenus.length > 0 ? allMenus : DEFAULT_FALLBACK_MENUS;

  return finalMenus.sort((a, b) => {
    const pA = getPriority(a.label);
    const pB = getPriority(b.label);
    if (pA !== pB) return pA - pB;
    return a.label.localeCompare(b.label);
  });
};

export function MainNavbar() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState<{ name: string; role: string; isPartner: boolean } | null>(null);
  const [navbarMenus, setNavbarMenus] = useState<CategoryMenu[]>(() => buildCategoryMenus([]));
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
    fetch(`${API_URL}/api/categories?limit=500`, { cache: "no-store" as RequestCache })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        const categories = data?.data
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        setNavbarMenus(buildCategoryMenus(categories));
      })
      .catch(() => {
        setNavbarMenus(buildCategoryMenus([]));
      });
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
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cac7b9]/60 text-[#5f5d3e] transition-opacity duration-300 hover:opacity-70 md:hidden"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <Link
              href="/"
              className="flex items-center"
            >
              <img src="/logo.png" alt="HeyWomaniyaa" className="h-16 w-auto object-contain md:h-18" />
            </Link>

            <nav className="hidden min-w-0 items-center gap-3 lg:flex 2xl:gap-5">
              {navbarMenus.map((menu) => (
                <div key={menu.label} className="group relative">
                  <Link
                    href={menu.href}
                    className="relative whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#343434] transition-colors duration-200 hover:text-[#9c4049] 2xl:text-[0.75rem]"
                  >
                    {menu.label}
                  </Link>

                  {menu.columns.length > 0 ? (
                    <div
                      className={`pointer-events-none absolute top-full z-40 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 ${
                        ["Clothes", "Jewellery", "Jewelry", "Bag", "Bags"].includes(menu.label)
                          ? "left-0 translate-x-0"
                          : "left-0 xl:left-1/2 xl:-translate-x-1/2"
                      }`}
                    >
                      <div
                        className={`border border-[#efe4d8] bg-[#fcf9f4] shadow-[0_24px_60px_rgba(58,45,35,0.14)] ${
                          menu.columns.length >= 4
                            ? "w-[min(92vw,1080px)]"
                            : menu.columns.length === 2
                              ? "w-[min(92vw,620px)]"
                              : "w-[min(92vw,340px)]"
                        }`}
                      >
                        <div
                          className={`grid gap-0 ${
                            menu.columns.length >= 4
                              ? "xl:grid-cols-4"
                              : menu.columns.length === 2
                                ? "xl:grid-cols-2"
                                : "xl:grid-cols-1"
                          }`}
                        >
                          {menu.columns.map((column, columnIndex) => (
                            <div
                              key={`${menu.label}-${column.title}`}
                              className={`min-h-full px-6 py-6 ${
                                columnIndex !== menu.columns.length - 1
                                  ? "border-r border-[#efe4d8]"
                                  : ""
                              }`}
                            >
                              <p className="text-[0.98rem] font-semibold text-[#9c4049]">
                                {column.title}
                              </p>
                              <div className="mt-4 space-y-2">
                                {column.links.length > 0 ? (
                                  column.links.map((item, linkIdx) => (
                                    <Link
                                      key={`${item.label}-${linkIdx}`}
                                      href={item.href}
                                      className="block text-[0.96rem] leading-7 text-[#2d3147] transition-colors duration-200 hover:text-[#9c4049]"
                                    >
                                      {item.label}
                                    </Link>
                                  ))
                                ) : column.title === "Coming Soon" ? (
                                  <p className="text-[0.96rem] leading-7 text-[#8b837b]">Coming soon</p>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-3 md:hidden">
              {user ? (
                <Link
                  href={user.role === "partner" || user.isPartner ? "/earnings" : "/account"}
                  className="flex min-w-[42px] flex-col items-center justify-center text-[#22253a]"
                >
                  <FaUserAlt className="text-[1rem] text-[#c53b45]" />
                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.04em]">
                    {user.role === "partner" || user.isPartner ? "Dashboard" : "Account"}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="flex min-w-[42px] flex-col items-center justify-center text-[#22253a]"
                >
                  <FaUserAlt className="text-[1rem] text-[#c53b45]" />
                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.04em]">
                    Register
                  </span>
                </Link>
              )}

              <Link
                href="/wishbag"
                className="flex min-w-[42px] flex-col items-center justify-center text-[#22253a]"
              >
                <IoMdHeart className="text-[1.15rem] text-[#c53b45]" />
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.04em]">
                  Wishbag
                </span>
              </Link>

              <Link
                href="/cart"
                className="flex min-w-[42px] flex-col items-center justify-center text-[#22253a]"
              >
                <HiMiniShoppingBag className="text-[1.1rem] text-[#c53b45]" />
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.04em]">
                  Bag
                </span>
              </Link>
            </div>

            <div className="hidden items-center gap-2 rounded-2xl bg-[#f5f5f5] px-3 py-2 lg:flex xl:px-4">
              <button
                type="button"
                onClick={submitSearch}
                aria-label="Search products"
                className="flex items-center justify-center text-[#6d7287] transition-opacity duration-200 hover:opacity-70"
              >
                <span className="material-symbols-outlined text-[1.15rem] text-[#6d7287]">
                  search
                </span>
              </button>
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for products, brands and more"
                className="w-[8rem] bg-transparent text-sm text-[#48473d] outline-none placeholder:text-[#8c8f9e] xl:w-[12rem] 2xl:w-[18rem]"
              />
            </div>

            <div
              ref={profileRef}
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
              className="relative hidden shrink-0 md:block"
            >
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex min-w-[58px] flex-col items-center justify-center text-[#22253a]"
              >
                <FaUserAlt className="text-[1.15rem] text-[#c53b45]" />
                <span className="mt-1 text-[11px] font-semibold">
                  {user ? (user.role === "partner" || user.isPartner ? "Dashboard" : "Account") : "Register"}
                </span>
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
              className="hidden min-w-[58px] shrink-0 flex-col items-center justify-center text-[#22253a] md:flex"
            >
              <IoMdHeart className="text-[1.35rem] text-[#c53b45]" />
              <span className="mt-1 text-[11px] font-semibold">Wishbag</span>
            </Link>

            <Link
              href="/cart"
              className="hidden min-w-[58px] shrink-0 flex-col items-center justify-center text-[#22253a] md:flex"
            >
              <HiMiniShoppingBag className="text-[1.3rem] text-[#c53b45]" />
              <span className="mt-1 text-[11px] font-semibold">My Bag</span>
            </Link>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="flex items-center gap-2 rounded-2xl bg-[#f5f5f5] px-3 py-2">
            <button
              type="button"
              onClick={submitSearch}
              aria-label="Search products"
              className="flex items-center justify-center text-[#6d7287]"
            >
              <span className="material-symbols-outlined text-[1.15rem] text-[#6d7287]">
                search
              </span>
            </button>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products, categories and more"
              className="w-full bg-transparent text-sm text-[#48473d] outline-none placeholder:text-[#8c8f9e]"
            />
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[60] bg-[#2d251f]/40 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-[70] flex h-full w-[88vw] max-w-[360px] flex-col bg-[linear-gradient(180deg,#fffdfb_0%,#f8f0e8_100%)] shadow-[0_24px_60px_rgba(58,45,35,0.18)] transition-transform duration-300 md:hidden ${
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
                  className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9c4049]"
                >
                  {menu.label}
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
