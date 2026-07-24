"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import type {
  CategoryPageData,
  CategoryQuickLink,
  CategorySlug
} from "@/app/category/category-data";

type FilterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

type CategoryDetailClientProps = {
  slug: CategorySlug;
  category: CategoryPageData;
  quickLinks: CategoryQuickLink[];
  activeQuickLink?: CategoryQuickLink;
  activeCategoryColumns: FilterColumn[];
  sizes: string[];
};

const slugifyProductName = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parsePrice = (value: string | number | undefined) => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  return Number(value.replace(/[^0-9.]/g, "")) || 0;
};

export function CategoryDetailClient({
  slug,
  category,
  quickLinks,
  activeQuickLink,
  activeCategoryColumns,
  sizes
}: CategoryDetailClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(3000); // Support up to 3000 Rs

  // Handle toggling size selections
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Perform dynamic filtering
  const filteredProducts = useMemo(() => {
    return category.products.filter((product) => {
      // 1. Price Filter
      const priceNum = parsePrice(product.price);
      if (!isNaN(priceNum) && priceNum > priceLimit) {
        return false;
      }

      // 2. Size Filter
      if (selectedSizes.length > 0) {
        const productSizes = (product as any).sizes || ["S", "M", "L", "XL"];
        const hasMatch = selectedSizes.some((s) => productSizes.includes(s));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [category.products, priceLimit, selectedSizes]);

  const clearFilters = () => {
    setSelectedSizes([]);
    setPriceLimit(3000);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      {/* ----------------- Desktop Sidebar (Interactive Client Version) ----------------- */}
      <aside className="hidden rounded-[1.8rem] border border-[#ece6df] bg-white/90 p-5 shadow-[0_10px_30px_rgba(95,93,62,0.05)] lg:block h-fit">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#111111]">
            Filters
          </h2>
          {(selectedSizes.length > 0 || priceLimit < 3000) && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-[#9c4049] hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Category list */}
        <div className="mt-6 border-t border-[#ece6df] pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]">
            Categories
          </h3>
          <div className="mt-4 space-y-5">
            {activeCategoryColumns.map((column) => (
              <div key={column.title}>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9c4049]">
                  {column.title}
                </p>
                <div className="mt-3 space-y-2.5">
                  {column.links.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block text-sm leading-6 text-[#6d655d] transition-colors duration-200 hover:text-[#9c4049]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="mt-6 border-t border-[#ece6df] pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111111] flex justify-between">
            <span>Max Price</span>
            <span className="text-[#9c4049] font-bold">₹{priceLimit}</span>
          </h3>
          <input
            type="range"
            min="100"
            max="3000"
            step="50"
            value={priceLimit}
            onChange={(e) => setPriceLimit(Number(e.target.value))}
            className="mt-4 w-full accent-[#9c4049] cursor-pointer"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[#8b837b]">
            <span>₹100</span>
            <span>₹3000</span>
          </div>
        </div>

        {/* Sizes */}
        <div className="mt-6 border-t border-[#ece6df] pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]">
            Sizes
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                      : "border-[#ddd5cc] text-[#6d655d] bg-white hover:bg-[#f4efe8]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ----------------- Mobile Drawer & Products Grid Area ----------------- */}
      <div>
        {/* Mobile Filter Drawer Overlay */}
        <div
          className={`fixed inset-0 z-[60] bg-[#2d251f]/25 transition-opacity duration-300 lg:hidden ${
            mobileFiltersOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMobileFiltersOpen(false)}
        />

        {/* Mobile Filter Drawer */}
        <aside
          className={`fixed left-0 top-0 z-[70] h-full w-[80vw] max-w-[300px] overflow-y-auto bg-[#fcf9f4] px-5 pb-8 pt-6 shadow-[0_24px_60px_rgba(58,45,35,0.18)] transition-transform duration-300 lg:hidden ${
            mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#111111]">
              Filters
            </h2>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd5cc] text-[#5f5d3e]"
            >
              <span className="material-symbols-outlined text-[1.15rem]">close</span>
            </button>
          </div>

          {/* Categories */}
          <div className="mt-6 border-t border-[#ece6df] pt-4">
            <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9c4049]">
              Categories
            </h3>
            <div className="mt-4 space-y-5">
              {activeCategoryColumns.map((column) => (
                <div key={`drawer-${column.title}`}>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#111111]">
                    {column.title}
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {column.links.map((item) => (
                      <Link
                        key={`drawer-${item.label}`}
                        href={item.href}
                        onClick={() => setMobileFiltersOpen(false)}
                        className="block text-sm leading-6 text-[#6d655d]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price limit (Mobile) */}
          <div className="mt-6 border-t border-[#ece6df] pt-4">
            <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#111111] flex justify-between">
              <span>Max Price</span>
              <span className="text-[#9c4049] font-bold">₹{priceLimit}</span>
            </h3>
            <input
              type="range"
              min="100"
              max="3000"
              step="50"
              value={priceLimit}
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              className="mt-3 w-full accent-[#9c4049]"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-[#8b837b]">
              <span>₹100</span>
              <span>₹3000</span>
            </div>
          </div>

          {/* Sizes (Mobile) */}
          <div className="mt-6 border-t border-[#ece6df] pt-4">
            <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#111111]">
              Sizes
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={`drawer-${size}`}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                        : "border-[#ddd5cc] text-[#6d655d] bg-white"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 rounded-full border border-[#ddd5cc] py-3 text-xs font-bold uppercase text-[#6d655d]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 rounded-full bg-[#9c4049] py-3 text-xs font-bold uppercase text-white shadow-md"
            >
              Apply
            </button>
          </div>
        </aside>

        {/* ----------------- Toolbar ----------------- */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[#6d655d]">
            Showing{" "}
            <span className="font-semibold text-[#111111]">
              {filteredProducts.length}
            </span>{" "}
            of <span className="font-semibold text-[#111111]">{category.products.length}</span> items in{" "}
            <span className="font-semibold text-[#111111]">
              {activeQuickLink?.label ?? category.title}
            </span>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-[1.25rem] border border-[#ece6df] bg-white/95 px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#111111] shadow-[0_10px_24px_rgba(95,93,62,0.05)] lg:hidden"
            >
              Filters
              <span className="material-symbols-outlined text-[1.1rem] text-[#6d655d]">tune</span>
            </button>
            <div className="rounded-full bg-[#f4efe8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6f5f56]">
              Sort by: Popular
            </div>
          </div>
        </div>

        {/* ----------------- Products Grid ----------------- */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#ece6df] bg-white p-12 text-center">
            <p className="text-sm font-semibold text-[#6d655d]">
              No products match your selected filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-xs font-semibold text-[#9c4049] underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.name}
                href={`/product/${(product as any).slug || slugifyProductName(product.name)}`}
                className="group rounded-[1.2rem] border border-[#ece6df] bg-white/92 p-3 shadow-[0_10px_28px_rgba(95,93,62,0.05)] transition-all duration-300 hover:-translate-y-1 sm:rounded-[1.5rem] sm:p-4"
              >
                <div className="relative overflow-hidden rounded-[0.95rem] bg-[#f4efe8] sm:rounded-[1.2rem] h-[220px] sm:h-[300px]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>

                <div className="pt-3 sm:pt-4">
                  <p className="text-[0.56rem] uppercase tracking-[0.14em] text-[#9c4049]/72 sm:text-[0.62rem] sm:tracking-[0.18em]">
                    {product.subtitle}
                  </p>
                  <h2 className="mt-2 text-[0.95rem] font-semibold leading-5 text-[#1c1c19] sm:text-base sm:leading-6">
                    {product.name}
                  </h2>
                  <div className="mt-2.5 flex items-center gap-1 text-[#ffb000] sm:mt-3">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <span key={starIndex} className="text-[10px] sm:text-xs">
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="mt-2.5 flex flex-col gap-1 sm:mt-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="text-[1rem] font-bold text-[#111111] sm:text-lg">
                        {product.price}
                      </span>
                      {(product as any).originalPrice ? (
                        <span className="text-[0.78rem] text-[#a7a09a] line-through sm:text-sm">
                          {(product as any).originalPrice}
                        </span>
                      ) : (
                        <span className="text-[0.78rem] text-[#a7a09a] line-through sm:text-sm">
                          ₹300
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
