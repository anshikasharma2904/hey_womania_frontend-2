"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { StoreFooter } from "@/components/StoreFooter";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";

interface CartItem {
  productId: string;
  title: string;
  image: string;
  sku: string;
  size: string;
  color: string;
  salePrice: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart items from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("hey_womania_cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      setLoading(false);
    }
  }, []);

  // Update localStorage when cartItems changes
  const updateCartItems = (newItems: CartItem[]) => {
    setCartItems(newItems);
    localStorage.setItem("hey_womania_cart", JSON.stringify(newItems));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const handleIncrement = (sku: string) => {
    const updated = cartItems.map((item) =>
      item.sku === sku ? { ...item, quantity: item.quantity + 1 } : item
    );
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

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const discount = Math.round(subtotal * 0.2); // 20% discount
  const grandTotal = subtotal - discount + deliveryFee;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <p className="text-sm font-semibold text-[#6d655d]">Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-12 pt-44 text-[#1c1c19] md:px-10 md:pt-40 lg:pt-44 lg:px-16">
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
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold leading-5 text-[#111111] md:text-base">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-xs text-[#6d655d]">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-base font-bold text-[#111111] md:text-lg">
                          ₹{item.salePrice}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => handleDecrement(item.sku)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4efe8] text-[#6d655d] hover:bg-[#e8e2d7] md:h-8 md:w-8"
                      >
                        <FaMinus className="text-[10px]" />
                      </button>
                      <span className="min-w-5 text-center text-xs font-semibold md:text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item.sku)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4efe8] text-[#6d655d] hover:bg-[#e8e2d7] md:h-8 md:w-8"
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
              <h2 className="text-xl font-semibold text-[#111111]">Order Summary</h2>

              <div className="mt-6 space-y-4 text-sm text-[#6d655d]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount (-20%)</span>
                  <span className="text-[#ef6f63]">-₹{discount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-[#ece6df] pt-6">
                <div className="flex items-center justify-between text-lg font-semibold text-[#111111]">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <input
                  type="text"
                  placeholder="Add promo code"
                  className="min-w-0 flex-1 rounded-full border border-[#ddd5cc] bg-[#fcf9f4] px-4 py-3 text-sm outline-none placeholder:text-[#9b948d]"
                />
                <button className="rounded-full bg-[#111111] px-5 py-3 text-sm font-semibold text-white">
                  Apply
                </button>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block w-full rounded-full bg-[#111111] px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] text-white hover:opacity-90 transition-opacity"
              >
                Go to Checkout →
              </Link>
            </aside>
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  );
}
