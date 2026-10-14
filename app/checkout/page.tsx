"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreFooter } from "@/components/StoreFooter";
import { OrderConfirmationModal } from "@/components/OrderConfirmationModal";
import { trackMetaEvent } from "@/lib/metaTracking";

import { FaTrash } from "react-icons/fa";
import { MODEL_ASSETS } from "@/lib/fashion-assets";
import { SURPRISE_GIFT_SKU, syncCartWithSurpriseGift } from "@/lib/surpriseGift";
import { formatItemSize } from "@/lib/format-utils";

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [hasPastOrders, setHasPastOrders] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [promoInput, setPromoInput] = useState<string>("");
  const [promoStatusMsg, setPromoStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Load cart from localStorage and fetch addresses
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear any legacy auto-applied promos from localStorage so phone verification is required
      localStorage.removeItem("hey_womania_promo");

      const stored = localStorage.getItem("hey_womania_cart");
      if (stored) {
        try {
          const parsedItems = JSON.parse(stored);
          const { cart: syncedItems } = syncCartWithSurpriseGift(parsedItems);
          setCartItems(syncedItems);

          if (syncedItems.length > 0) {
            const totalVal = syncedItems.reduce((acc: number, item: any) => acc + ((item.salePrice || 0) * item.quantity), 0);
            trackMetaEvent("InitiateCheckout", {
              value: totalVal,
              currency: "INR",
              content_ids: syncedItems.map((i: any) => i.productId),
              num_items: syncedItems.length
            });
          }
        } catch (e) {
          console.error("Failed to parse checkout cart", e);
        }
      }
      setLoading(false);
    }

    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.user) {
          setIsLoggedIn(true);
          const u = data.user;
          const uName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || "";
          const uPhone = u.phone ? u.phone.replace(/^\+91/, "").replace(/^91/, "") : "";
          const defaultAddr = u.addresses?.find((a: any) => a.isDefault) || u.addresses?.[0] || u.address;

          if (data.user.partnerProfile?.walletBalance) {
            setWalletBalance(data.user.partnerProfile.walletBalance);
          }
          if (data.user.hasPastOrders) {
            setHasPastOrders(true);
          }
          if (data.user.partnerProfile?.networkWalletBalance) {
            setNetworkWalletBalance(data.user.partnerProfile.networkWalletBalance);
          }
          if (data.user.addresses && data.user.addresses.length > 0) {
            setSavedAddresses(data.user.addresses);
            setSelectedAddressId(data.user.addresses[0]._id || data.user.addresses[0].id || "new");
          } else {
            // No saved addresses - user will click "Add Shipping Address" or see form if filled
            if (defaultAddr?.streetAddress) {
              setShowAddressForm(true);
            }
          }

          // Pre-populate formData with known name, phone, and address details
          setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || defaultAddr?.fullName || uName || "",
            phone: prev.phone || defaultAddr?.phone || uPhone || "",
            streetAddress: prev.streetAddress || defaultAddr?.streetAddress || "",
            streetAddressLine2: prev.streetAddressLine2 || defaultAddr?.streetAddressLine2 || "",
            city: prev.city || defaultAddr?.city || "",
            state: prev.state || defaultAddr?.state || "",
            pincode: prev.pincode || defaultAddr?.pincode || "",
          }));
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch user addresses:", err);
        setIsLoggedIn(false);
      });
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
  const activePhone = (selectedAddressId === "new"
    ? formData.phone
    : savedAddresses.find((a) => a._id === selectedAddressId || a.id === selectedAddressId)?.phone || formData.phone || ""
  ).replace(/[^0-9]/g, "");

  const [phoneHasPastOrders, setPhoneHasPastOrders] = useState(false);

  useEffect(() => {
    const normalized = activePhone.length > 10 ? activePhone.slice(-10) : activePhone;
    if (normalized.length === 10) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${baseUrl}/api/orders/promo-eligibility?code=WELCOME100&phone=${normalized}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.eligible === false) {
            setPhoneHasPastOrders(true);
            if (appliedCoupon === "WELCOME100") {
              setAppliedCoupon("");
              localStorage.removeItem("hey_womania_promo");
            }
          } else {
            setPhoneHasPastOrders(false);
          }
        })
        .catch(() => {});
    }
  }, [activePhone, appliedCoupon]);

  const isPhoneValid = activePhone.length >= 10;
  const isEligibleForWelcome = !hasPastOrders && !phoneHasPastOrders;
  const walletDiscount = (isPhoneValid && isEligibleForWelcome && useWallet) ? Math.floor(Math.min(walletBalance, subtotal * 0.05)) : 0;
  const couponDiscount = (isPhoneValid && isEligibleForWelcome && appliedCoupon === "WELCOME100") ? Math.min(100, subtotal) : 0;

  const remainingTotalBeforeNetwork = Math.max(0, subtotal + shippingAmount - walletDiscount - couponDiscount);
  const networkWalletDiscount = useNetworkWallet ? Math.floor(Math.min(networkWalletBalance, remainingTotalBeforeNetwork)) : 0;
  const grandTotal = Math.max(0, remainingTotalBeforeNetwork - networkWalletDiscount);

  const hasEnteredAddress = Boolean(
    formData.fullName?.trim() &&
    formData.phone?.replace(/[^0-9]/g, "").length >= 10 &&
    formData.streetAddress?.trim() &&
    formData.city?.trim() &&
    formData.pincode?.replace(/[^0-9]/g, "").length === 6
  );

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (addressErrors[field]) {
      setAddressErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleApplyCheckoutPromo = async (codeToUse?: string | any) => {
    const rawVal = typeof codeToUse === "string" ? codeToUse : promoInput;
    const code = String(rawVal || "").trim().toUpperCase();
    if (!code) {
      setPromoStatusMsg({ text: "Please enter a promo code", isError: true });
      return;
    }

    if (code !== "WELCOME100") {
      setPromoStatusMsg({ text: "Invalid promo code.", isError: true });
      return;
    }

    const normalized = activePhone.length > 10 ? activePhone.slice(-10) : activePhone;
    if (!normalized || normalized.length < 10) {
      setPromoStatusMsg({
        text: "Please enter your 10-digit mobile number in the shipping address first to verify your offer eligibility.",
        isError: true
      });
      // Automatically expand the address form so user can easily enter phone
      setShowAddressForm(true);
      const phoneInput = document.getElementById("checkout-phone-input");
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (hasPastOrders) {
      setPromoStatusMsg({ text: "WELCOME100 is valid only on your first order.", isError: true });
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/orders/promo-eligibility?code=WELCOME100&phone=${normalized}`);
      const data = await res.json();
      if (data && data.eligible === false) {
        setPhoneHasPastOrders(true);
        setPromoStatusMsg({ text: data.message || "WELCOME100 is valid only on your first purchase.", isError: true });
        setAppliedCoupon("");
        localStorage.removeItem("hey_womania_promo");
        return;
      }
    } catch (err) {
      console.error("Promo eligibility error:", err);
    }

    setAppliedCoupon("WELCOME100");
    setPromoInput("WELCOME100");
    setPromoStatusMsg({ text: "WELCOME100 applied! ₹100 discount applied to order.", isError: false });
    localStorage.setItem("hey_womania_promo", JSON.stringify({ code: "WELCOME100", discount: 100 }));
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
      deliveryFee: shippingAmount,
      couponCode: couponDiscount > 0 ? "WELCOME100" : "",
      couponDiscount,
      total: `₹${grandTotal.toLocaleString("en-IN")}`,
      items: cartItems.map(item => ({
        productId: item.productId,
        sku: item.sku,
        qty: item.quantity,
        price: `₹${(item.salePrice || 0).toLocaleString("en-IN")}`,
        name: item.title,
        img: item.image,
        images: item.images || [],
        size: item.size || "",
        color: item.color || "",
        isFreeGift: Boolean(item.isFreeGift || item.sku === SURPRISE_GIFT_SKU)
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
    if (typeof window !== "undefined") {
      trackMetaEvent("Purchase", {
        value: grandTotal,
        currency: "INR",
        content_ids: cartItems.map((i: any) => i.productId),
        num_items: cartItems.length
      });
    }

    localStorage.removeItem("hey_womania_cart");
    localStorage.removeItem("hey_womania_promo");
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
        items: payload.items,
        useWallet: useWallet,
        useNetworkWallet: useNetworkWallet,
        deliveryFee: payload.deliveryFee,
        couponCode: payload.couponCode,
        paymentMethod: payload.paymentMethod,
        address: payload.address
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

    // Validate shipping address
    if (selectedAddressId === "new") {
      const errors: Record<string, string> = {};
      const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
      const cleanPincode = formData.pincode.replace(/[^0-9]/g, "");

      if (!formData.fullName.trim()) {
        errors.fullName = "Please enter your full name.";
      }
      if (!cleanPhone || cleanPhone.length < 10) {
        errors.phone = "Please enter a valid 10-digit mobile number.";
      }
      if (!formData.streetAddress.trim()) {
        errors.streetAddress = "Please enter your street address / house details.";
      }
      if (!formData.city.trim()) {
        errors.city = "Please enter your city.";
      }
      if (!formData.state.trim()) {
        errors.state = "Please enter your state.";
      }
      if (!cleanPincode || cleanPincode.length !== 6) {
        errors.pincode = "Please enter a valid 6-digit delivery pincode.";
      }

      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors);
        setShowAddressForm(true);
        setSubmitStatus("Please complete all required shipping address fields before placing your order.");
        const firstErrorKey = Object.keys(errors)[0];
        const el = document.getElementById(`checkout-${firstErrorKey}-input`) || document.getElementById("shipping-address-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
    } else {
      const selected = savedAddresses.find((a) => (a._id === selectedAddressId) || (a.id === selectedAddressId));
      if (!selected) {
        setShowAddressForm(true);
        setSubmitStatus("Please select or add a delivery address to proceed.");
        return;
      }
    }

    if (shippingError) {
      setSubmitStatus("Cannot place order to an unserviceable pincode.");
      return;
    }

    setAddressErrors({});
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

      if (formData.paymentMethod === "online" || formData.paymentMethod === "cod") {
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
      <main className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[#fcf9f4] px-3 sm:px-4 pb-16 pt-5 text-[#1c1c19] md:px-10 md:pt-12 lg:pt-16 lg:px-16 box-border">
        <section className="mx-auto max-w-7xl w-full min-w-0 box-border">
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[#8b837b]">
            <Link href="/">Home</Link>
            <span>&gt;</span>
            <Link href="/cart">Cart</Link>
            <span>&gt;</span>
            <span className="text-[#1c1c19]">Checkout</span>
          </div>

          <h1 className="mb-6 sm:mb-8 font-sans text-2xl sm:text-3xl font-black uppercase tracking-[-0.05em] text-[#111111] md:text-5xl">
            Checkout
          </h1>

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_380px] w-full min-w-0">
            {/* Cart summary panel - shown FIRST on mobile via order-1, on desktop side via lg:order-2 */}
            <aside className="order-1 lg:order-2 rounded-[1.3rem] sm:rounded-[1.6rem] border border-[#ece6df] bg-white/95 p-4 sm:p-5 shadow-[0_10px_28px_rgba(95,93,62,0.05)] h-fit w-full min-w-0 max-w-full box-border">
              <div className="flex items-center justify-between border-b border-[#ece6df] pb-3 mb-4">
                <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                  Order Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                </h2>
                <span className="text-xs font-semibold text-[#8b837b] uppercase tracking-wider">Summary</span>
              </div>

              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const isGift = Boolean(item.isFreeGift || item.sku === SURPRISE_GIFT_SKU);
                  return (
                    <div
                      key={item.sku}
                      className={`flex gap-3 p-2 rounded-xl transition-all ${isGift
                          ? "bg-gradient-to-r from-[#fffcf8] via-[#fff8f0] to-[#fffcf8] border border-[#f0dfce] shadow-xs"
                          : ""
                        }`}
                    >
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-[#f4efe8] overflow-hidden p-1 flex items-center justify-center relative border border-[#ece6df]">
                        <ImageWithFallback
                          src={item.image}
                          fallbackSrcs={item.images || []}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-semibold text-[#1c1c19] truncate">{item.title}</h4>
                        </div>
                        <p className="text-[11px] text-[#8b837b]">
                          {isGift
                            ? "Complimentary Reward • Qty: 1"
                            : [
                              `Qty: ${item.quantity}`,
                              formatItemSize(item.size, item.title) ? `Size: ${formatItemSize(item.size, item.title)}` : null,
                              item.color && !["DEFAULT", "STANDARD"].includes(item.color.toUpperCase()) ? `Color: ${item.color}` : null
                            ].filter(Boolean).join(" | ")}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          {isGift ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">FREE</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold">₹{item.salePrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-[#ece6df] pt-4 space-y-3 text-sm text-[#6d655d]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {cartItems.some(i => i.isFreeGift || i.sku === SURPRISE_GIFT_SKU) && (
                  <div className="flex justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 font-medium">
                    <span className="flex items-center gap-1">
                      <span>🎁</span> Free Surprise Gift
                    </span>
                    <span className="font-bold">FREE (₹0)</span>
                  </div>
                )}

                {/* Checkout Promo Code Input */}
                <div className="pt-3 pb-1 border-t border-[#ece6df]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">Coupons & Offers</span>
                  </div>

                  {/* Available Offer shown ON TOP for instant 1-tap apply */}
                  {isEligibleForWelcome && appliedCoupon !== "WELCOME100" && (
                    <div className="mb-2.5 rounded-xl border border-dashed border-[#9c4049]/50 bg-gradient-to-r from-[#fff6f6] to-[#fffbfa] p-2.5 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9c4049]/10 text-xs">🎉</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#9c4049] tracking-wide">WELCOME100</p>
                            <p className="text-[11px] text-[#6d655d] leading-tight truncate">Flat ₹100 OFF on your first purchase</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyCheckoutPromo("WELCOME100")}
                          className="shrink-0 rounded-lg bg-[#9c4049] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#85343d] transition-all cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCheckoutPromo();
                        }
                      }}
                      placeholder="Enter promo code"
                      className="min-w-0 flex-1 rounded-xl border border-[#ddd5cc] bg-[#fcf9f4] px-3.5 py-2.5 text-xs outline-none placeholder:text-[#9b948d] font-mono tracking-wider focus:border-[#9c4049]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCheckoutPromo()}
                      className="rounded-xl bg-[#111111] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#9c4049] transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  {promoStatusMsg && (
                    <div className={`mt-2 rounded-lg p-2.5 text-xs font-medium flex items-start gap-1.5 ${
                      promoStatusMsg.isError 
                        ? "bg-[#fff0f1] text-[#9c4049] border border-[#f5c6cb]" 
                        : "bg-[#eaf7ee] text-emerald-800 border border-[#c3e6cb]"
                    }`}>
                      <span className="font-bold shrink-0">{promoStatusMsg.isError ? "⚠️" : "✓"}</span>
                      <p className="leading-snug">{promoStatusMsg.text}</p>
                    </div>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 font-medium">
                    <span className="flex items-center gap-1">
                      <span>🏷️</span> Promo Discount ({appliedCoupon})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon("");
                          setPromoStatusMsg(null);
                          setPromoInput("");
                          localStorage.removeItem("hey_womania_promo");
                        }}
                        className="text-[10px] text-red-600 hover:underline font-bold ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
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

                {walletBalance > 0 && !hasPastOrders && (
                  <div className="flex flex-col py-2 border-t border-[#ece6df] mt-2">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-[#111111]">
                        <input
                          type="checkbox"
                          checked={useWallet}
                          onChange={(e) => setUseWallet(e.target.checked)}
                          className="accent-[#9c4049] h-4 w-4 rounded cursor-pointer"
                        />
                        Use Shopping Wallet
                      </label>
                      <span className="text-xs font-bold text-[#8b837b]">Available: ₹{walletBalance}</span>
                    </div>
                  </div>
                )}

                {useWallet && walletDiscount > 0 && (
                  <div className="flex justify-between text-[#367743] font-semibold text-xs">
                    <span>Shopping Wallet Discount (max 5% of order value only for first purchase)</span>
                    <span>-₹{walletDiscount}</span>
                  </div>
                )}

                {networkWalletBalance > 0 && (
                  <div className="flex flex-col py-2 border-t border-[#ece6df] mt-2">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm text-[#111111]">
                        <input
                          type="checkbox"
                          checked={useNetworkWallet}
                          onChange={(e) => setUseNetworkWallet(e.target.checked)}
                          className="accent-[#9c4049] h-4 w-4 rounded cursor-pointer"
                        />
                        Use Referral / Network Wallet
                      </label>
                      <span className="text-xs font-bold text-[#8b837b]">Available: ₹{networkWalletBalance}</span>
                    </div>
                  </div>
                )}

                {useNetworkWallet && networkWalletDiscount > 0 && (
                  <div className="flex justify-between text-[#367743] font-semibold text-xs">
                    <span>Network Wallet Discount</span>
                    <span>-₹{networkWalletDiscount}</span>
                  </div>
                )}

                <div className="border-t border-[#ece6df] pt-3 flex justify-between font-bold text-[#111111] text-base">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </aside>

            {/* Address & Payment form - shown SECOND on mobile via order-2, on desktop main via lg:order-1 */}
            <form onSubmit={handleInitiateCheckout} className="order-2 lg:order-1 space-y-6 rounded-[1.3rem] sm:rounded-[1.6rem] border border-[#ece6df] bg-white p-3 sm:p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)] w-full max-w-full min-w-0 box-border overflow-hidden">
              <div id="shipping-address-section">
                <div className="flex items-center justify-between border-b border-[#ece6df] pb-3 mb-4">
                  <h2 className="text-lg font-bold text-[#111111]">
                    Shipping Address
                  </h2>
                  {selectedAddressId === "new" && hasEnteredAddress && !showAddressForm && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="text-xs font-bold text-[#5f5d3e] hover:underline uppercase tracking-wider"
                    >
                      Edit Address
                    </button>
                  )}
                </div>
              </div>

              {/* Saved addresses list for logged in users */}
              {savedAddresses.length > 0 && (
                <div className="space-y-3 mb-4 w-full min-w-0">
                  {savedAddresses.map((addr) => {
                    const id = addr._id || addr.id;
                    return (
                      <div key={id} className={`flex items-start justify-between gap-2.5 sm:gap-3 border p-3 sm:p-4 rounded-xl transition w-full min-w-0 box-border ${selectedAddressId === id
                          ? "border-[#5f5d3e] bg-[#fcf9f4]"
                          : "border-[#e8e2d9]"
                        }`}>
                        <label className="flex items-start gap-2.5 sm:gap-3 cursor-pointer flex-1 min-w-0">
                          <input
                            type="radio"
                            name="selectedAddress"
                            value={id}
                            checked={selectedAddressId === id}
                            onChange={() => {
                              setSelectedAddressId(id);
                              setShowAddressForm(false);
                            }}
                            className="mt-1 h-4 w-4 shrink-0 border-[#e8e2d9] text-[#5f5d3e] focus:ring-[#5f5d3e]"
                          />
                          <div className="min-w-0 flex-1 pr-1">
                            <p className="font-semibold text-sm text-[#111111] break-words">{addr.fullName}</p>
                            <p className="text-xs sm:text-sm text-[#5e5a54] mt-1 break-words leading-relaxed">
                              {addr.streetAddress}{addr.streetAddressLine2 ? `, ${addr.streetAddressLine2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-xs sm:text-sm text-[#5e5a54] mt-1 break-words font-medium">Phone: {addr.phone}</p>
                          </div>
                        </label>
                        <div className="flex flex-col gap-2 shrink-0 justify-start items-end pt-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setEditingAddressId(id);
                              setSelectedAddressId("new");
                              setShowAddressForm(true);
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
                            className="text-xs font-semibold text-[#5f5d3e] hover:underline px-1 py-0.5"
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
                            className="text-xs font-semibold text-[#9c4049] hover:text-red-700 disabled:opacity-50 flex items-center justify-center p-1.5"
                            title="Delete address"
                          >
                            {deletingAddressId === id ? (
                              <span className="animate-spin h-3 w-3 border-2 border-[#9c4049] border-t-transparent rounded-full"></span>
                            ) : (
                              <FaTrash className="text-xs sm:text-sm" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Collapsed address preview when user already filled details and collapsed the form */}
              {selectedAddressId === "new" && hasEnteredAddress && !showAddressForm && !editingAddressId && (
                <div className="rounded-xl border border-[#5f5d3e] bg-[#fcf9f4] p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 text-sm text-[#1c1c19]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#111111]">{formData.fullName}</span>
                      <span className="rounded bg-[#5f5d3e]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5f5d3e]">Delivery Address</span>
                    </div>
                    <p className="text-xs text-[#5e5a54] leading-relaxed">
                      {formData.streetAddress}{formData.streetAddressLine2 ? `, ${formData.streetAddressLine2}` : ""}, {formData.city}, {formData.state} - <span className="font-semibold text-[#111111]">{formData.pincode}</span>
                    </p>
                    <p className="text-xs text-[#5e5a54] font-medium">Mobile: <span className="font-semibold text-[#111111]">{formData.phone}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="shrink-0 text-xs font-bold text-[#5f5d3e] hover:underline px-2 py-1 rounded border border-[#5f5d3e]/30 bg-white"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* "Add Shipping Address" button when not yet expanded */}
              {(!showAddressForm && !editingAddressId && (savedAddresses.length > 0 ? selectedAddressId === "new" && !hasEnteredAddress : !hasEnteredAddress)) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId("new");
                    setEditingAddressId(null);
                    setShowAddressForm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#5f5d3e]/40 bg-[#fcf9f4] p-4 text-sm font-bold text-[#5f5d3e] hover:bg-[#f6f0e6] transition shadow-xs group cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5f5d3e] text-white text-base group-hover:scale-105 transition-transform">+</span>
                  <span>Add Shipping / Delivery Address</span>
                </button>
              )}

              {/* The Address Form */}
              {(showAddressForm || editingAddressId) && (
                <div className="space-y-4 rounded-xl border border-[#e8e2d9] bg-[#faf7f2]/50 p-3 sm:p-5">
                  <div className="flex items-center justify-between border-b border-[#ece6df] pb-2">
                    <h3 className="text-sm font-bold text-[#1c1c19] uppercase tracking-wider">
                      {editingAddressId ? "Editing Address" : "Delivery Details"}
                    </h3>
                    {hasEnteredAddress && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-xs font-semibold text-[#8b837b] hover:text-[#111111]"
                      >
                        Collapse
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#5f5d3e]">
                        Full Name <span className="text-red-500">*</span>
                      </span>
                      <input
                        id="checkout-fullName-input"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => updateField("fullName", e.target.value)}
                        placeholder="Priya Sharma"
                        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1c1c19] outline-none transition ${
                          addressErrors.fullName ? "border-red-500 ring-1 ring-red-500" : "border-[#e8e2d9] focus:border-[#5f5d3e]"
                        }`}
                      />
                      {addressErrors.fullName && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{addressErrors.fullName}</p>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#5f5d3e]">
                        Mobile Number <span className="text-red-500">*</span>
                      </span>
                      <input
                        id="checkout-phone-input"
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210 (10 digits)"
                        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1c1c19] outline-none transition ${
                          addressErrors.phone ? "border-red-500 ring-1 ring-red-500" : "border-[#e8e2d9] focus:border-[#5f5d3e]"
                        }`}
                      />
                      {addressErrors.phone && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{addressErrors.phone}</p>
                      )}
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#5f5d3e]">
                      Street Address / Flat / House No. <span className="text-red-500">*</span>
                    </span>
                    <input
                      id="checkout-streetAddress-input"
                      type="text"
                      required
                      value={formData.streetAddress}
                      onChange={(e) => updateField("streetAddress", e.target.value)}
                      placeholder="Flat No, Wing, Building Name, Street"
                      className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1c1c19] outline-none transition ${
                        addressErrors.streetAddress ? "border-red-500 ring-1 ring-red-500" : "border-[#e8e2d9] focus:border-[#5f5d3e]"
                      }`}
                    />
                    {addressErrors.streetAddress && (
                      <p className="mt-1 text-xs text-red-600 font-medium">{addressErrors.streetAddress}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-[#8b837b]">
                      Address Line 2 (Optional)
                    </span>
                    <input
                      type="text"
                      value={formData.streetAddressLine2}
                      onChange={(e) => updateField("streetAddressLine2", e.target.value)}
                      placeholder="Apartment, suite, unit etc."
                      className="w-full rounded-xl border border-[#e8e2d9] bg-white px-3.5 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#5f5d3e]">
                        City <span className="text-red-500">*</span>
                      </span>
                      <input
                        id="checkout-city-input"
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Mumbai"
                        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1c1c19] outline-none transition ${
                          addressErrors.city ? "border-red-500 ring-1 ring-red-500" : "border-[#e8e2d9] focus:border-[#5f5d3e]"
                        }`}
                      />
                      {addressErrors.city && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{addressErrors.city}</p>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#5f5d3e]">
                        State <span className="text-red-500">*</span>
                      </span>
                      <input
                        id="checkout-state-input"
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="Maharashtra"
                        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1c1c19] outline-none transition ${
                          addressErrors.state ? "border-red-500 ring-1 ring-red-500" : "border-[#e8e2d9] focus:border-[#5f5d3e]"
                        }`}
                      />
                      {addressErrors.state && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{addressErrors.state}</p>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#5f5d3e]">
                        Pincode <span className="text-red-500">*</span>
                      </span>
                      <input
                        id="checkout-pincode-input"
                        type="text"
                        required
                        pattern="\d{6}"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, ""))}
                        placeholder="400001"
                        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-[#1c1c19] outline-none transition ${
                          addressErrors.pincode ? "border-red-500 ring-1 ring-red-500" : "border-[#e8e2d9] focus:border-[#5f5d3e]"
                        }`}
                      />
                      {addressErrors.pincode && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{addressErrors.pincode}</p>
                      )}
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
                    <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-[#8b837b]">Landmark (Optional)</span>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => updateField("landmark", e.target.value)}
                      placeholder="Near Mall / Next to Metro Station"
                      className="w-full rounded-xl border border-[#e8e2d9] bg-white px-3.5 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
                    />
                  </label>

                  {editingAddressId && (
                    <div className="flex gap-3 mt-4 border-t border-[#ece6df] pt-4">
                      <button
                        type="button"
                        disabled={isSavingAddress || formData.pincode.length !== 6 || !!shippingError}
                        onClick={async () => {
                          setIsSavingAddress(true);
                          try {
                            await fetch(`/api/user/addresses?id=${editingAddressId}`, {
                              method: "DELETE"
                            });

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
                              setShowAddressForm(false);
                              const newAdded = data.user?.addresses?.[data.user?.addresses.length - 1];
                              if (newAdded) setSelectedAddressId(newAdded.id || newAdded._id);
                            }
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsSavingAddress(false);
                          }
                        }}
                        className="rounded-xl bg-[#5f5d3e] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#4a4831] disabled:opacity-50"
                      >
                        {isSavingAddress ? "Saving..." : "Save Address"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          setShowAddressForm(false);
                          setSelectedAddressId(editingAddressId);
                        }}
                        className="rounded-xl border border-[#ece6df] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6d655d] hover:bg-[#f4efe8]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h2 className="text-lg font-bold text-[#111111] border-b border-[#ece6df] pb-3 mb-4 mt-6">
                  Payment Method
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 w-full min-w-0">
                  <label className={`flex items-center gap-3 border rounded-xl p-3.5 sm:p-4 cursor-pointer transition w-full min-w-0 box-border ${formData.paymentMethod === "cod" ? "border-[#9c4049] bg-[#fff0f1]/20" : "border-[#e8e2d9]"
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={(e) => updateField("paymentMethod", e.target.value)}
                      className="accent-[#9c4049]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1c1c19]">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-[#8b837b]">Pay in cash at delivery time</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 border rounded-xl p-3.5 sm:p-4 cursor-pointer transition w-full min-w-0 box-border ${formData.paymentMethod === "online" ? "border-[#9c4049] bg-[#fff0f1]/20" : "border-[#e8e2d9]"
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={formData.paymentMethod === "online"}
                      onChange={(e) => updateField("paymentMethod", e.target.value)}
                      className="accent-[#9c4049]"
                    />
                    <div className="min-w-0 flex-1">
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
                <div className="mt-3 rounded-xl bg-[#fff0f1] border border-[#f5c6cb] px-4 py-3 text-sm text-[#9c4049] font-medium flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{submitStatus}</span>
                </div>
              )}
            </form>
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
