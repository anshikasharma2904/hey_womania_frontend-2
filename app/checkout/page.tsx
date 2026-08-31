"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreFooter } from "@/components/StoreFooter";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";

import { FaTrash } from "react-icons/fa";
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

  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState<any>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | "success">("");
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  
  const [shiprocketRate, setShiprocketRate] = useState(99);
  const [shippingError, setShippingError] = useState("");

  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [networkWalletBalance, setNetworkWalletBalance] = useState(0);
  const [useNetworkWallet, setUseNetworkWallet] = useState(false);

  // Load cart from localStorage and fetch addresses
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hey_womania_cart");
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
      setLoading(false);
    }

    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.user) {
          if (data.user.partnerProfile?.walletBalance) {
            setWalletBalance(data.user.partnerProfile.walletBalance);
          }
          if (data.user.partnerProfile?.networkWalletBalance) {
            setNetworkWalletBalance(data.user.partnerProfile.networkWalletBalance);
          }
          if (data.user.addresses && data.user.addresses.length > 0) {
            setSavedAddresses(data.user.addresses);
            setSelectedAddressId(data.user.addresses[0]._id || data.user.addresses[0].id || "new");
          }
        }
      })
      .catch(err => console.error("Failed to fetch user addresses:", err));
  }, []);

  useEffect(() => {
    const activePincode =
      selectedAddressId === "new"
        ? formData.pincode
        : savedAddresses.find((a) => a._id === selectedAddressId || a.id === selectedAddressId)?.pincode;

    if (!activePincode || activePincode.length !== 6) {
      setShiprocketRate(99);
      setDeliveryDays("");
      setShippingError("");
      return;
    }

    const fetchRate = async () => {
      setIsCalculatingShipping(true);
      setShippingError("");
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/shiprocket/serviceability?delivery_postcode=${activePincode}&weight=0.5`);
        const result = await res.json();
        
        if (result.success && result.data?.data?.available_courier_companies) {
          const companies = result.data.data.available_courier_companies;
          if (companies.length > 0) {
            // Find the company with the lowest rate
            const cheapestCompany = companies.reduce((prev: any, curr: any) => 
              (prev.rate < curr.rate) ? prev : curr
            );
            setShiprocketRate(Math.round(cheapestCompany.rate));
            
            if (cheapestCompany.estimated_delivery_days) {
              setDeliveryDays(`${cheapestCompany.estimated_delivery_days} days`);
            } else if (cheapestCompany.etd) {
              setDeliveryDays(cheapestCompany.etd);
            } else {
              setDeliveryDays("");
            }
          } else {
            setShiprocketRate(99);
            setDeliveryDays("");
            setShippingError("No couriers available for this pincode.");
          }
        } else {
          setShiprocketRate(99);
          setShippingError(result.data?.message || result.error || "Pincode is unserviceable or invalid.");
        }
      } catch (err) {
        console.error("Failed to fetch shipping rate:", err);
        setShiprocketRate(99);
        setDeliveryDays("");
        setShippingError("Unable to verify pincode serviceability.");
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchRate();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [formData.pincode, selectedAddressId, savedAddresses]);

  const subtotal = Math.round(cartItems.reduce((acc, item) => acc + (Math.round(item.salePrice) * item.quantity), 0));
  const isFreeDelivery = subtotal >= 999;
  const shippingAmount = subtotal > 0 ? (isFreeDelivery ? 0 : shiprocketRate) : 0;
  const walletDiscount = useWallet ? Math.floor(Math.min(walletBalance, subtotal * 0.05)) : 0;
  
  const remainingTotalBeforeNetwork = subtotal + shippingAmount - walletDiscount;
  const networkWalletDiscount = useNetworkWallet ? Math.floor(Math.min(networkWalletBalance, remainingTotalBeforeNetwork)) : 0;
  
  const grandTotal = remainingTotalBeforeNetwork - networkWalletDiscount;

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

  const buildOrderPayload = () => {
    let address = {
      fullName: formData.fullName,
      phone: formData.phone,
      streetAddress: formData.streetAddress,
      streetAddressLine2: formData.streetAddressLine2,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode
    };

    if (selectedAddressId !== "new") {
      const selected = savedAddresses.find(a => (a._id === selectedAddressId) || (a.id === selectedAddressId));
      if (selected) {
        address = {
          fullName: selected.fullName,
          phone: selected.phone,
          streetAddress: selected.streetAddress,
          streetAddressLine2: selected.streetAddressLine2 || "",
          city: selected.city,
          state: selected.state,
          pincode: selected.pincode
        };
      }
    }

    return {
      address,
      landmark: formData.landmark,
      paymentMethod: formData.paymentMethod,
      useWallet,
      useNetworkWallet,
      total: `₹${grandTotal.toLocaleString("en-IN")}`,
      items: cartItems.map(item => ({
        productId: item.productId,
        sku: item.sku,
        qty: item.quantity,
        price: `₹${item.salePrice.toLocaleString("en-IN")}`,
        name: item.title,
        img: item.image
      }))
    };
  };

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
      body: JSON.stringify({ 
        amount: grandTotal, // kept as fallback
        items: items,
        useWallet: applyWallet,
        useNetworkWallet: applyNetworkWallet
      })
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
        name: "Hey Womaniyaa",
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

  const handleInitiateCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      setSubmitStatus("Your cart is empty. Cannot place order.");
      return;
    }

    if (shippingError) {
      setSubmitStatus("Cannot place order to an unserviceable pincode.");
      return;
    }

    const payload = buildOrderPayload();
    setModalPayload(payload);
    setIsConfirmModalOpen(true);
  };

  const executeOrder = async () => {
    try {
      setIsSubmitting(true);
      setSubmitStatus("");
      
      const payload = modalPayload || buildOrderPayload();

      if (selectedAddressId === "new") {
        try {
          await fetch(`/api/user/addresses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: formData.fullName,
              phone: formData.phone,
              streetAddress: formData.streetAddress,
              streetAddressLine2: formData.streetAddressLine2,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              country: "India"
            })
          });
        } catch (err) {
          console.error("Failed to auto-save address", err);
        }
      }

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
    <>
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
            <form onSubmit={handleInitiateCheckout} className="space-y-6 rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
              <div>
                <h2 className="text-lg font-bold text-[#111111] border-b border-[#ece6df] pb-3 mb-4">
                  Shipping Address
                </h2>
              </div>

              {savedAddresses.length > 0 && (
                <div className="space-y-4 mb-6">
                  {savedAddresses.map((addr) => {
                    const id = addr._id || addr.id;
                    return (
                      <div key={id} className={`flex items-start justify-between border p-4 rounded-xl transition ${
                        selectedAddressId === id
                          ? "border-[#5f5d3e] bg-[#fcf9f4]"
                          : "border-[#e8e2d9]"
                      }`}>
                        <label className="flex items-start gap-4 cursor-pointer flex-1">
                          <input
                            type="radio"
                            name="selectedAddress"
                            value={id}
                            checked={selectedAddressId === id}
                            onChange={() => setSelectedAddressId(id)}
                            className="mt-1 h-4 w-4 border-[#e8e2d9] text-[#5f5d3e] focus:ring-[#5f5d3e]"
                          />
                          <div>
                            <p className="font-semibold text-sm text-[#111111]">{addr.fullName}</p>
                            <p className="text-sm text-[#5e5a54] mt-1">
                              {addr.streetAddress}, {addr.streetAddressLine2 && `${addr.streetAddressLine2}, `}
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-sm text-[#5e5a54] mt-1">Phone: {addr.phone}</p>
                          </div>
                        </label>
                        <div className="flex flex-col gap-3 justify-start items-end">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setEditingAddressId(id);
                              setSelectedAddressId("new");
                              setFormData({
                                fullName: addr.fullName || "",
                                phone: addr.phone || "",
                                streetAddress: addr.streetAddress || "",
                                streetAddressLine2: addr.streetAddressLine2 || "",
                                city: addr.city || "",
                                state: addr.state || "",
                                pincode: addr.pincode || "",
                                landmark: addr.landmark || "",
                                paymentMethod: formData.paymentMethod,
                              });
                            }}
                            className="text-xs font-semibold text-[#5f5d3e] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingAddressId === id}
                            onClick={async (e) => {
                              e.preventDefault();
                              if (!confirm("Are you sure you want to delete this address?")) return;
                              setDeletingAddressId(id);
                              try {
                                const res = await fetch(`/api/user/addresses?id=${id}`, {
                                  method: "DELETE"
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  setSavedAddresses(data.user?.addresses || []);
                                  if (selectedAddressId === id) {
                                    const remaining = data.user?.addresses || [];
                                    setSelectedAddressId(remaining.length > 0 ? (remaining[0].id || remaining[0]._id) : "new");
                                  }
                                }
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setDeletingAddressId(null);
                              }
                            }}
                            className="text-xs font-semibold text-[#9c4049] hover:text-red-700 disabled:opacity-50 flex items-center justify-center p-2"
                            title="Delete address"
                          >
                            {deletingAddressId === id ? (
                              <span className="animate-spin h-3 w-3 border-2 border-[#9c4049] border-t-transparent rounded-full"></span>
                            ) : (
                              <FaTrash className="text-sm" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <label
                    className={`flex items-center gap-4 border p-4 rounded-xl cursor-pointer transition ${
                      selectedAddressId === "new" && !editingAddressId
                        ? "border-[#5f5d3e] bg-[#fcf9f4]"
                        : "border-[#e8e2d9] hover:border-[#5f5d3e]"
                    }`}
                    onClick={() => {
                      setEditingAddressId(null);
                      setFormData({
                        fullName: "",
                        phone: "",
                        streetAddress: "",
                        streetAddressLine2: "",
                        city: "",
                        state: "",
                        pincode: "",
                        landmark: "",
                        paymentMethod: formData.paymentMethod,
                      });
                    }}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      value="new"
                      checked={selectedAddressId === "new" && !editingAddressId}
                      onChange={() => {
                        setSelectedAddressId("new");
                        setEditingAddressId(null);
                      }}
                      className="h-4 w-4 border-[#e8e2d9] text-[#5f5d3e] focus:ring-[#5f5d3e]"
                    />
                    <span className="font-semibold text-sm text-[#111111]">Add New Address</span>
                  </label>
                </div>
              )}

              {(selectedAddressId === "new" || editingAddressId) && (
                <div className="space-y-6">
                  {editingAddressId && (
                    <h3 className="text-sm font-semibold text-[#1c1c19] border-b border-[#ece6df] pb-2">
                      Editing Address
                    </h3>
                  )}
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
                      {formData.pincode.length === 6 && (
                        <div className="mt-1.5 flex items-center text-[11px]">
                          {isCalculatingShipping ? (
                            <span className="text-[#8b837b] flex items-center gap-1">
                              <span className="animate-spin h-3 w-3 border-2 border-[#8b837b] border-t-transparent rounded-full"></span>
                              Checking serviceability...
                            </span>
                          ) : shippingError ? (
                            <span className="text-[#ef6f63] font-medium flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              {shippingError}
                            </span>
                          ) : (
                            <span className="text-[#367743] font-medium flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              Serviceable for delivery
                            </span>
                          )}
                        </div>
                      )}
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

                  {editingAddressId && (
                    <div className="flex gap-4 mt-6 border-t border-[#ece6df] pt-6">
                      <button
                        type="button"
                        disabled={isSavingAddress || formData.pincode.length !== 6 || !!shippingError}
                        onClick={async () => {
                          setIsSavingAddress(true);
                          try {
                            // Remove old
                            await fetch(`/api/user/addresses?id=${editingAddressId}`, {
                              method: "DELETE"
                            });

                            // Add new
                            const res = await fetch(`/api/user/addresses`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                fullName: formData.fullName,
                                phone: formData.phone,
                                streetAddress: formData.streetAddress,
                                streetAddressLine2: formData.streetAddressLine2,
                                city: formData.city,
                                state: formData.state,
                                pincode: formData.pincode,
                                country: "India"
                              })
                            });
                            
                            if (res.ok) {
                              const data = await res.json();
                              setSavedAddresses(data.user?.addresses || []);
                              setEditingAddressId(null);
                              const newAdded = data.user?.addresses?.[data.user?.addresses.length - 1];
                              if (newAdded) setSelectedAddressId(newAdded.id || newAdded._id);
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsSavingAddress(false);
                          }
                        }}
                        className="rounded-xl bg-[#5f5d3e] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#4a4831] disabled:opacity-50"
                      >
                        {isSavingAddress ? "Saving..." : "Save Address"}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          setSelectedAddressId(editingAddressId);
                        }}
                        className="rounded-xl border border-[#ece6df] bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#6d655d] hover:bg-[#f4efe8]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                disabled={isSubmitting || !!shippingError}
                className="mt-6 w-full rounded-xl bg-[#111111] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? formData.paymentMethod === "online" ? "Opening Payment..." : "Placing Order..."
                  : shippingError
                  ? "Address Not Serviceable"
                  : formData.paymentMethod === "online" ? "Pay Securely" : "Place Order"}
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
                      <p className="text-[11px] text-[#8b837b]">
                        Qty: {item.quantity}
                        {item.size ? ` | Size: ${item.size}` : ""}
                        {item.color ? ` | Color: ${item.color}` : ""}
                      </p>
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
                  <span>Delivery</span>
                  <span>
                    {isCalculatingShipping ? (
                      <span className="text-[#8b837b] text-xs">Calculating...</span>
                    ) : subtotal > 0 && isFreeDelivery ? (
                      <>
                        <span className="line-through text-[#8b837b] mr-2">₹{shiprocketRate}</span>
                        <span className="text-[#367743] font-bold">Free</span>
                      </>
                    ) : (
                      <span>₹{Math.round(shippingAmount).toLocaleString("en-IN")}</span>
                    )}
                  </span>
                </div>
                {deliveryDays && !shippingError && !isCalculatingShipping && (
                  <div className="flex justify-between items-center text-[#6d655d] text-xs">
                    <span>Estimated Delivery</span>
                    <span className="font-medium text-[#1c1c19]">{deliveryDays}</span>
                  </div>
                )}
                {shippingError && (
                  <div className="text-right text-[10px] text-[#ef6f63] -mt-2">
                    {shippingError}
                  </div>
                )}
                
                {walletBalance > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-[#ece6df] mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[#111111] font-semibold text-sm">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                        className="accent-[#9c4049] h-4 w-4 rounded"
                      />
                      Use Shopping Wallet
                    </label>
                    <span className="text-xs font-bold text-[#8b837b]">Available: ₹{walletBalance}</span>
                  </div>
                )}
                
                {useWallet && walletDiscount > 0 && (
                  <div className="flex justify-between text-[#367743] font-semibold text-xs">
                    <span>Shopping Wallet Discount (max 5%)</span>
                    <span>-₹{walletDiscount}</span>
                  </div>
                )}

                {networkWalletBalance > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-[#ece6df] mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[#111111] font-semibold text-sm">
                      <input
                        type="checkbox"
                        checked={useNetworkWallet}
                        onChange={(e) => setUseNetworkWallet(e.target.checked)}
                        className="accent-[#9c4049] h-4 w-4 rounded"
                      />
                      Use Network Earnings
                    </label>
                    <span className="text-xs font-bold text-[#8b837b]">Available: ₹{networkWalletBalance}</span>
                  </div>
                )}
                
                {useNetworkWallet && networkWalletDiscount > 0 && (
                  <div className="flex justify-between text-[#367743] font-semibold text-xs">
                    <span>Network Wallet Applied</span>
                    <span>-₹{networkWalletDiscount}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-[#ece6df] pt-6 flex justify-between items-center text-lg font-bold text-[#111111]">
                <span>Total Amount</span>
                <span>₹{grandTotal}</span>
              </div>
            </aside>
          </div>
        </section>
        <StoreFooter />
      </main>
      

      <OrderConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeOrder}
        payload={modalPayload}
        deliveryDays={deliveryDays}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
