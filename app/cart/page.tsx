"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { StoreFooter } from "@/components/StoreFooter";
import ImageWithFallback from "@/components/ImageWithFallback";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";

interface CartItem {
  productId: string;
  title: string;
  image: string;
  images?: string[];
  sku: string;
  size: string;
  color: string;
  salePrice: number;
  quantity: number;
  maxStock?: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [loadingStock, setLoadingStock] = useState(true);

  // Load cart items from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("hey_womania_cart");
      let items: CartItem[] = [];
      if (storedCart) {
        items = JSON.parse(storedCart);
        setCartItems(items);
      }
      setLoading(false);

      if (items.length > 0) {
        const skus = items.map(item => item.sku);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products/check-stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skus })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStockMap(data.stockMap || {});
          }
        })
        .catch(err => console.error("Failed to check stock", err))
        .finally(() => setLoadingStock(false));
      } else {
        setLoadingStock(false);
      }
    }
  }, []);

  // Update localStorage when cartItems changes
  const updateCartItems = (newItems: CartItem[]) => {
    setCartItems(newItems);
    localStorage.setItem("hey_womania_cart", JSON.stringify(newItems));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const handleIncrement = (sku: string) => {
    const stock = stockMap[sku];
    if (stock === undefined || stock <= 0) return; // out of stock or not loaded

    const updated = cartItems.map((item) => {
      if (item.sku === sku) {
        const stockLimit = stockMap[sku] !== undefined ? stockMap[sku] : (item.maxStock ?? 999);
        return item.quantity < stockLimit ? { ...item, quantity: item.quantity + 1 } : item;
      }
      return item;
    });
    updateCartItems(updated);
  };

  const handleDecrement = (sku: string) => {
    const updated = cartItems.map((item) =>
      item.sku === sku && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    );
    updateCartItems(updated);
  };

  const handleRemove = (sku: string) => {
    const updated = cartItems.filter((item) => item.sku !== sku);
    updateCartItems(updated);
  };

  // Derived state
  const subtotal = Math.round(cartItems.reduce(
    (acc, item) => acc + item.salePrice * item.quantity,
    0
  ));
  
  // Calculate final grand total
  const grandTotal = subtotal;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <p className="text-sm font-semibold text-[#6d655d]">Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-6 text-[#1c1c19] md:px-10 md:pt-8 lg:px-16 lg:pt-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[#8b837b]">
          <Link href="/">Home</Link>
          <span>&gt;</span>
          <span className="text-[#1c1c19]">Cart</span>
        </div>

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.26em] text-[#9c4049]/70">
              Shopping Bag
            </p>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-[-0.05em] text-[#111111] md:text-5xl">
              Your Cart
            </h1>
          </div>
          <Link
            href="/category/all"
            className="rounded-full bg-[#111111] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:opacity-90"
          >
            Keep Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[#ece6df] bg-white p-12 text-center shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
            <p className="text-base font-semibold text-[#6d655d]">Your shopping bag is empty.</p>
            <p className="text-xs text-[#a09489] mt-1">Add items to proceed to checkout.</p>
            <Link
              href="/category/all"
              className="mt-6 inline-flex rounded-full bg-[#9c4049] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:bg-[#81353f]"
            >
              Shop Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Items List */}
            <section className="space-y-4">
              {cartItems.map((item) => (
                <article
                  key={item.sku}
                  className="rounded-[1.2rem] border border-[#ece6df] bg-white/92 p-3 shadow-[0_10px_28px_rgba(95,93,62,0.05)] md:rounded-[1.6rem] md:p-4"
                >
                  <div className="grid gap-3 grid-cols-[88px_1fr] md:grid-cols-[88px_1fr_auto_auto] md:items-center md:gap-6">
                    <div className="overflow-hidden rounded-[0.95rem] bg-[#f4efe8] md:rounded-[1rem] relative w-20 h-20">
                      <ImageWithFallback
                        src={item.image}
                        fallbackSrcs={item.images || []}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold leading-5 text-[#111111] md:text-base">
                        {item.title}
                      </h2>
                      {Boolean(item.size || item.color) && (
                        <p className="mt-1 text-xs text-[#6d655d]">
                          {[
                            item.size ? `Size: ${item.size}` : null,
                            item.color ? `Color: ${item.color}` : null
                          ].filter(Boolean).join(" | ")}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-sm font-bold text-[#1c1c19]">
                          ₹{Math.round(item.salePrice)}
                        </span>
                        {!loadingStock && stockMap[item.sku] !== undefined && stockMap[item.sku] <= 0 && (
                          <span className="text-[10px] uppercase font-bold text-[#ef6f63] tracking-widest px-2 py-0.5 bg-[#ef6f63]/10 rounded-full">
                            Out of Stock
                          </span>
                        )}
                        {!loadingStock && ((stockMap[item.sku] !== undefined && stockMap[item.sku] > 0 && item.quantity >= stockMap[item.sku]) || (stockMap[item.sku] === undefined && item.maxStock !== undefined && item.quantity >= item.maxStock)) && (
                          <span className="text-[9px] uppercase font-bold text-[#f59e0b] tracking-wider px-2 py-0.5 bg-[#f59e0b]/10 rounded-full ml-1">
                            Max Reached
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => handleDecrement(item.sku)}
                        disabled={loadingStock || (stockMap[item.sku] !== undefined && stockMap[item.sku] <= 0)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4efe8] text-[#6d655d] hover:bg-[#e8e2d7] md:h-8 md:w-8 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaMinus className="text-[10px]" />
                      </button>
                      <span className="min-w-5 text-center text-xs font-semibold md:text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.sku)}
                        disabled={
                          loadingStock || 
                          (stockMap[item.sku] !== undefined && stockMap[item.sku] <= 0) || 
                          (stockMap[item.sku] !== undefined && item.quantity >= stockMap[item.sku]) ||
                          (stockMap[item.sku] === undefined && item.maxStock !== undefined && item.quantity >= item.maxStock)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4efe8] text-[#6d655d] hover:bg-[#e8e2d7] md:h-8 md:w-8 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaPlus className="text-[10px]" />
                      </button>
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => handleRemove(item.sku)}
                      className="text-[#a09489] hover:text-[#9c4049] p-2 transition md:self-center"
                      title="Remove item"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </article>
              ))}
            </section>

            {/* Checkout panel */}
            <aside className="rounded-[1.6rem] border border-[#ece6df] bg-white/92 p-5 shadow-[0_10px_28px_rgba(95,93,62,0.05)] text-[#111111] h-fit">
              <div className="mt-2 flex gap-3">
                <input
                  type="text"
                  placeholder="Add promo code"
                  className="min-w-0 flex-1 rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-4 py-3 text-sm outline-none placeholder:text-[#9b948d]"
                />
                <button className="rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white">
                  Apply
                </button>
              </div>

              {cartItems.some(item => stockMap[item.sku] !== undefined && stockMap[item.sku] <= 0) ? (
                <button
                  disabled
                  className="mt-6 block w-full rounded-full bg-[#111111]/50 px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white cursor-not-allowed"
                >
                  Remove out of stock items
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="mt-6 block w-full rounded-full bg-[#111111] px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white hover:opacity-90 transition-opacity"
                >
                  Go to Checkout →
                </Link>
              )}
            </aside>
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  );
}
