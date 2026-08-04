"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  CategoryPageData,
  CategoryQuickLink
} from "@/app/category/category-data";

type FilterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

type CategoryDetailClientProps = {
  slug: string;
  category: CategoryPageData;
  quickLinks: Array<CategoryQuickLink | { slug: string; label: string; icon?: string; href: string }>;
  activeQuickLink?: CategoryQuickLink | { slug: string; label: string; icon?: string; href: string };
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

const INVALID_SIZE_TOKENS = new Set([
  "BOX",
  "DEFAULT",
  "NOSIZE",
  "N/A",
  "NA",
  "PCS",
  "PC",
  "PIECE",
  "PIECES",
  "PACK",
  "PAIR",
  "QTY",
  "SET"
]);

const normalizeSize = (value: string) => {
  const cleaned = String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

  if (!cleaned || INVALID_SIZE_TOKENS.has(cleaned)) {
    return "";
  }

  if (/^\d+$/.test(cleaned) && Number(cleaned) > 60) {
    return "";
  }

  return cleaned;
};

export function CategoryDetailClient({
  slug,
  category,
  activeQuickLink,
  sizes
}: CategoryDetailClientProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState<number>(3000);

  const availableCategories = useMemo(() => {
    const collected = new Set<string>();

    for (const product of category.products as Array<any>) {
      const label = String(product?.categoryLabel || "").trim();
      if (label) {
        collected.add(label);
      }
    }

    return Array.from(collected).sort((a, b) => a.localeCompare(b));
  }, [category.products]);

  const availableSubcategories = useMemo(() => {
    const collected = new Set<string>();

    for (const product of category.products as Array<any>) {
      const categoryLabel = String(product?.categoryLabel || "").trim();
      if (selectedCategories.length > 0 && !selectedCategories.includes(categoryLabel)) {
        continue;
      }

      const label = String(product?.subcategoryLabel || "").trim();
      if (label) {
        collected.add(label);
      }
    }

    return Array.from(collected).sort((a, b) => a.localeCompare(b));
  }, [category.products, selectedCategories]);

  const availableSizes = useMemo(() => {
    const collectedSizes = new Set<string>();

    for (const product of category.products as Array<any>) {
      const variantSizes = Array.isArray(product.variants)
        ? product.variants
            .map((variant: any) => normalizeSize(variant?.size || ""))
            .filter(Boolean)
        : [];
      const explicitSizes = Array.isArray(product.sizes)
        ? product.sizes.map((size: string) => normalizeSize(size || "")).filter(Boolean)
        : [];

      [...variantSizes, ...explicitSizes].forEach((size) => collectedSizes.add(size));
    }

    const fallbackSizes = sizes.map((size) => normalizeSize(size)).filter(Boolean);

    const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
    const sizeSort = (a: string, b: string) => {
      const ai = SIZE_ORDER.indexOf(a.toUpperCase());
      const bi = SIZE_ORDER.indexOf(b.toUpperCase());
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    };

    return collectedSizes.size > 0
      ? Array.from(collectedSizes).sort(sizeSort)
      : fallbackSizes;
  }, [category.products, sizes]);

  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const toggleSize = (size: string) => {
    toggleSelection(size, selectedSizes, setSelectedSizes);
  };

  const filteredProducts = useMemo(() => {
    return category.products.filter((product) => {
      const priceNum = parsePrice(product.price);
      if (!isNaN(priceNum) && priceNum > priceLimit) {
        return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(String((product as any).categoryLabel || "").trim())
      ) {
        return false;
      }

      if (
        selectedSubcategories.length > 0 &&
        !selectedSubcategories.includes(String((product as any).subcategoryLabel || "").trim())
      ) {
        return false;
      }

      if (selectedSizes.length > 0) {
        const productSizes = [
          ...(((product as any).sizes as string[] | undefined) || []),
          ...((((product as any).variants as Array<any> | undefined) || []).map((variant) =>
            normalizeSize(variant?.size || "")
          ))
        ]
          .map((size) => normalizeSize(size))
          .filter(Boolean);
        const hasMatch = selectedSizes.some((s) => productSizes.includes(s));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [category.products, priceLimit, selectedCategories, selectedSizes, selectedSubcategories]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedSizes([]);
    setPriceLimit(3000);
  };

  const activeResultsLabel = useMemo(() => {
    if (selectedSubcategories.length === 1) {
      return selectedSubcategories[0];
    }

    if (selectedCategories.length === 1) {
      return selectedCategories[0];
    }

    if (selectedSubcategories.length > 1) {
      return `${selectedSubcategories.length} subcategories`;
    }

    if (selectedCategories.length > 1) {
      return `${selectedCategories.length} categories`;
    }

    return category.title;
  }, [category.title, selectedCategories, selectedSubcategories]);

  const activeHeaderTitle = useMemo(() => {
    if (selectedSubcategories.length === 1) {
      return selectedSubcategories[0];
    }

    if (selectedCategories.length === 1) {
      return selectedCategories[0];
    }

    return category.title;
  }, [category.title, selectedCategories, selectedSubcategories]);

  const handleCategoryToggle = (value: string) => {
    const willSelect = !selectedCategories.includes(value);
    const nextSelectedCategories = willSelect
      ? [...selectedCategories, value]
      : selectedCategories.filter((item) => item !== value);

    setSelectedCategories(nextSelectedCategories);

    if (nextSelectedCategories.length === 0) {
      return;
    }

    setSelectedSubcategories((prev) =>
      prev.filter((subCategory) =>
        category.products.some((product: any) => {
          const categoryLabel = String(product?.categoryLabel || "").trim();
          const subcategoryLabel = String(product?.subcategoryLabel || "").trim();
          return (
            nextSelectedCategories.includes(categoryLabel) &&
            subcategoryLabel === subCategory
          );
        })
      )
    );
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSubcategories.length > 0 ||
    selectedSizes.length > 0 ||
    priceLimit < 3000;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[#8b837b]">
        <Link href="/">Home</Link>
        <span>&gt;</span>
        <Link href="/category">Category</Link>
        <span>&gt;</span>
        <span className="text-[#1c1c19]">{activeHeaderTitle}</span>
      </div>

      <div className="border-b border-[#ece6df] pb-6">
        <p className="text-[0.7rem] uppercase tracking-[0.26em] text-[#9c4049]/70">
          {category.eyebrow}
        </p>
        <h1 className="mt-3 font-sans text-3xl font-black uppercase tracking-[-0.05em] text-[#111111] md:text-5xl">
          {activeHeaderTitle}
        </h1>
      </div>

      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-[250px_1fr]">
      {/* ----------------- Desktop Sidebar (Interactive Client Version) ----------------- */}
      <aside className="hidden rounded-[1.8rem] border border-[#ece6df] bg-white/90 p-5 shadow-[0_10px_30px_rgba(95,93,62,0.05)] lg:block h-fit">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#111111]">
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-[#9c4049] hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {availableCategories.length > 0 ? (
          <div className="mt-6 border-t border-[#ece6df] pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]">
              Category
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {availableCategories.map((item) => {
                const isSelected = selectedCategories.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleCategoryToggle(item)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                      isSelected
                        ? "border-[#111111] bg-[#111111] text-white shadow-sm"
                        : "border-[#ddd5cc] bg-white text-[#6d655d] hover:bg-[#f4efe8]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {availableSubcategories.length > 0 ? (
          <div className="mt-6 border-t border-[#ece6df] pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]">
              Subcategory
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {availableSubcategories.map((item) => {
                const isSelected = selectedSubcategories.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSelection(item, selectedSubcategories, setSelectedSubcategories)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
                      isSelected
                        ? "border-[#111111] bg-[#111111] text-white shadow-sm"
                        : "border-[#ddd5cc] bg-white text-[#6d655d] hover:bg-[#f4efe8]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

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

        {availableSizes.length > 0 ? (
          <div className="mt-6 border-t border-[#ece6df] pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111111]">
              Sizes
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {availableSizes.map((size) => {
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
        ) : null}
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

          {availableCategories.length > 0 ? (
            <div className="mt-6 border-t border-[#ece6df] pt-4">
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#111111]">
                Category
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableCategories.map((item) => {
                  const isSelected = selectedCategories.includes(item);
                  return (
                    <button
                      key={`drawer-category-${item}`}
                      type="button"
                      onClick={() => handleCategoryToggle(item)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-[#111111] bg-[#111111] text-white shadow-sm"
                          : "border-[#ddd5cc] bg-white text-[#6d655d]"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {availableSubcategories.length > 0 ? (
            <div className="mt-6 border-t border-[#ece6df] pt-4">
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#111111]">
                Subcategory
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableSubcategories.map((item) => {
                  const isSelected = selectedSubcategories.includes(item);
                  return (
                    <button
                      key={`drawer-subcategory-${item}`}
                      type="button"
                      onClick={() => toggleSelection(item, selectedSubcategories, setSelectedSubcategories)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-[#111111] bg-[#111111] text-white shadow-sm"
                          : "border-[#ddd5cc] bg-white text-[#6d655d]"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

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

          {availableSizes.length > 0 ? (
            <div className="mt-6 border-t border-[#ece6df] pt-4">
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#111111]">
                Sizes
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {availableSizes.map((size) => {
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
          ) : null}

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
              {activeResultsLabel}
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product.name}
                href={`/product/${(product as any).slug || slugifyProductName(product.name)}`}
                className="group overflow-hidden rounded-[1.75rem] border border-[#ece6df] bg-white shadow-[0_14px_34px_rgba(95,93,62,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(95,93,62,0.1)]"
              >
                <div className="p-4 pb-0">
                  <div className="relative aspect-[4/4.9] overflow-hidden rounded-[1.35rem] bg-[#f4efe8]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  </div>
                </div>

                <div className="flex flex-col gap-2 px-4 pb-4 pt-4">
                  <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#9c4049]/72 sm:text-[0.64rem]">
                    {(product as any).categoryLabel || "Live Collection"}
                  </p>
                  <h2 className="line-clamp-2 min-h-[2.6rem] text-[0.98rem] font-semibold leading-[1.35rem] text-[#1c1c19] sm:min-h-[2.8rem] sm:text-[1.05rem]">
                    {product.name}
                  </h2>
                  {(product as any).subcategoryLabel ? (
                    <p className="line-clamp-1 text-[0.76rem] text-[#8a8076] sm:text-[0.82rem]">
                      {(product as any).subcategoryLabel}
                    </p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1 text-[#ffb000]">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <span key={starIndex} className="text-[10px] sm:text-[11px]">
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="rounded-full bg-[#f7f1ea] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7b6d64]">
                      New
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[1.05rem] font-bold text-[#111111] sm:text-[1.15rem]">
                        {product.price}
                    </span>
                    {(product as any).originalPrice ? (
                      <span className="text-[0.8rem] text-[#a7a09a] line-through sm:text-sm">
                        {(product as any).originalPrice}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
