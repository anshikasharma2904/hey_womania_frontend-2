"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreFooter } from "@/components/StoreFooter";
import { MODEL_ASSETS } from "@/lib/fashion-assets";

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    streetAddress: "",
    streetAddressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    paymentMethod: "cod"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hey_womania_cart");
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
      setLoading(false);
    }
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);
  const deliveryFee = subtotal > 0 ? 15 : 0;
  const discount = Math.round(subtotal * 0.2); // 20% discount
  const grandTotal = subtotal - discount + deliveryFee;

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const loadRazorpayCheckout = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const buildOrderPayload = () => ({
    address: {
      fullName: formData.fullName,
      phone: formData.phone,
      streetAddress: formData.streetAddress,
      streetAddressLine2: formData.streetAddressLine2,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    },
    landmark: formData.landmark,
    paymentMethod: formData.paymentMethod,
    total: `₹${grandTotal.toLocaleString("en-IN")}`,
    items: cartItems.map(item => ({
      productId: item.productId,
      sku: item.sku,
      qty: item.quantity,
      price: `₹${item.salePrice.toLocaleString("en-IN")}`,
      name: item.title,
      img: item.image
    }))
  });

  const completeOrder = async (payload: ReturnType<typeof buildOrderPayload>) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Unable to process your order. Please check details.");
    }
  };

  const markOrderSuccess = () => {
    localStorage.removeItem("hey_womania_cart");
    window.dispatchEvent(new Event("cart_updated"));
    setSubmitStatus("success");
    setTimeout(() => {
      router.push("/account/orders");
    }, 1500);
  };

  const handleRazorpayPayment = async (payload: ReturnType<typeof buildOrderPayload>) => {
    const isLoaded = await loadRazorpayCheckout();

    if (!isLoaded || !window.Razorpay) {
      throw new Error("Unable to load Razorpay checkout. Please try again.");
    }

    const orderResponse = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: grandTotal })
    });

    const razorpayOrder = await orderResponse.json().catch(() => ({}));

    if (!orderResponse.ok) {
      throw new Error(razorpayOrder.error || "Unable to start Razorpay payment.");
    }

    const Razorpay = window.Razorpay;

    if (!Razorpay) {
      throw new Error("Unable to load Razorpay checkout. Please try again.");
    }

    await new Promise<void>((resolve, reject) => {
      const razorpay = new Razorpay({
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "Hey Womaniya",
        description: "Order payment",
        order_id: razorpayOrder.orderId,
        prefill: {
          name: formData.fullName,
          contact: formData.phone
        },
        theme: {
          color: "#9c4049"
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentResponse,
                orderPayload: payload
              })
            });

            const verifyData = await verifyResponse.json().catch(() => ({}));

            if (!verifyResponse.ok) {
              reject(new Error(verifyData.error || "Payment completed, but order verification failed."));
              return;
            }

            resolve();
          } catch {
            reject(new Error("Payment completed, but order verification failed."));
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment was cancelled."))
        }
      });

      razorpay.open();
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      setSubmitStatus("Your cart is empty. Cannot place order.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus("");

      const payload = buildOrderPayload();

      if (formData.paymentMethod === "online") {
        await handleRazorpayPayment(payload);
      } else {
        await completeOrder(payload);
      }

      markOrderSuccess();
    } catch (error) {
      setSubmitStatus(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <main className="min-h-screen bg-[#fcf9f4] flex items-center justify-center pt-20 px-5">
        <div className="max-w-md w-full rounded-[2rem] border border-[#ece6df] bg-white p-8 text-center shadow-lg">
          <span className="text-5xl text-emerald-600">✓</span>
          <h2 className="mt-4 text-2xl font-black text-[#1c1c19]">Order Placed!</h2>
          <p className="mt-2 text-sm text-[#6d655d]">
            Thank you for your purchase. We are redirecting you to your order history.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-16 pt-8 text-[#1c1c19] md:px-10 md:pt-12 lg:pt-16 lg:px-16">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[#8b837b]">
          <Link href="/">Home</Link>
          <span>&gt;</span>
          <Link href="/cart">Cart</Link>
          <span>&gt;</span>
          <span className="text-[#1c1c19]">Checkout</span>
        </div>

        <h1 className="mb-8 font-sans text-3xl font-black uppercase tracking-[-0.05em] text-[#111111] md:text-5xl">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
            <div>
              <h2 className="text-lg font-bold text-[#111111] border-b border-[#ece6df] pb-3 mb-4">
                Shipping Address
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">Full Name</span>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">Phone Number</span>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="9876543210"
                  className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">Street Address</span>
              <input
                type="text"
                required
                value={formData.streetAddress}
                onChange={(e) => updateField("streetAddress", e.target.value)}
                placeholder="Flat No, Wing, Building Name"
                className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">Address Line 2 (Optional)</span>
              <input
                type="text"
                value={formData.streetAddressLine2}
                onChange={(e) => updateField("streetAddressLine2", e.target.value)}
                placeholder="Apartment, suite, unit etc."
                className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
              />
            </label>

            <div className="grid gap-6 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">City</span>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Mumbai"
                  className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">State</span>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">Pincode</span>
                <input
                  type="text"
                  required
                  pattern="\d{6}"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, ""))}
                  placeholder="400001"
                  className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">Landmark (Optional)</span>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => updateField("landmark", e.target.value)}
                placeholder="Near Mall / Next to Metro Station"
                className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
              />
            </label>

            <div>
              <h2 className="text-lg font-bold text-[#111111] border-b border-[#ece6df] pb-3 mb-4 mt-8">
                Payment Method
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                  formData.paymentMethod === "cod" ? "border-[#9c4049] bg-[#fff0f1]/20" : "border-[#e8e2d9]"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={(e) => updateField("paymentMethod", e.target.value)}
                    className="accent-[#9c4049]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1c1c19]">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-[#8b837b]">Pay in cash at delivery time</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition ${
                  formData.paymentMethod === "online" ? "border-[#9c4049] bg-[#fff0f1]/20" : "border-[#e8e2d9]"
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={formData.paymentMethod === "online"}
                    onChange={(e) => updateField("paymentMethod", e.target.value)}
                    className="accent-[#9c4049]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1c1c19]">UPI / Cards / Net Banking</p>
                    <p className="text-[11px] text-[#8b837b]">Secure online payment</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-[#111111] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:opacity-90 transition shadow-lg disabled:opacity-50"
            >
              {isSubmitting
                ? formData.paymentMethod === "online" ? "Opening Payment..." : "Placing Order..."
                : `${formData.paymentMethod === "online" ? "Pay Now" : "Place Order"} (Total: ₹${grandTotal})`}
            </button>

            {submitStatus && submitStatus !== "success" && (
              <p className="mt-3 rounded-xl bg-[#fff0f1] px-4 py-3 text-sm text-[#9c4049]">
                {submitStatus}
              </p>
            )}
          </form>

          {/* Cart summary side panel */}
          <aside className="rounded-[1.6rem] border border-[#ece6df] bg-white/92 p-5 shadow-[0_10px_28px_rgba(95,93,62,0.05)] h-fit">
            <h2 className="text-lg font-bold text-[#111111] border-b border-[#ece6df] pb-3 mb-4">
              Items
            </h2>
            <div className="space-y-4 max-h-[240px] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.sku} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-[#f4efe8] overflow-hidden p-1 flex items-center justify-center relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-[#1c1c19] truncate">{item.title}</h4>
                    <p className="text-[11px] text-[#8b837b]">Qty: {item.quantity} | Size: {item.size}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold">₹{item.salePrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#ece6df] pt-4 space-y-3 text-sm text-[#6d655d]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-[#ef6f63]">-₹{discount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1c1c19] border-t border-[#ece6df] pt-3 text-base">
                <span>Total Amount</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}
