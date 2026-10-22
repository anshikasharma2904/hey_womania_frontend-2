import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { FaCheckCircle, FaShippingFast, FaBoxOpen, FaFileInvoiceDollar, FaMapMarkerAlt, FaTimesCircle } from "react-icons/fa";
import { slugifyProductName } from "@/app/category/category-data";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { ReturnOrderButton } from "@/components/ReturnOrderButton";
import ImageWithFallback from "@/components/ImageWithFallback";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";



async function fetchOrderById(id: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");
  
  if (!sessionToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/orders/${id}`, {
      headers: {
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage(props: PageProps) {
  const { id } = await props.params;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("hey_womania_session")?.value;
  if (!token) return redirect("/login");

  const order = await fetchOrderById(id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 py-20 shadow-sm">
        <h2 className="font-[family:var(--font-display)] text-2xl text-[#1c1c19]">Order Not Found</h2>
        <p className="mt-2 text-[#6d655d]">We couldn't find an order with ID #{id}.</p>
        <Link href="/account/orders" className="mt-6 rounded-lg bg-[#9c4049] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#81353f]">
          Back to All Orders
        </Link>
      </div>
    );
  }

  let steps = [
    { title: "Order Placed", date: order.date, icon: FaFileInvoiceDollar },
    { title: "Processing", date: order.activeStep >= 2 ? "In Progress" : "Pending", icon: FaBoxOpen },
    { title: "Shipped", date: order.activeStep >= 3 ? "Completed" : "Pending", icon: FaShippingFast },
    { title: "Delivered", date: order.status === "Delivered" ? order.statusText.replace("Delivered on ", "") : "Pending", icon: FaCheckCircle }
  ];

  let displayActiveStep = order.activeStep;
  if (order.status === "Cancelled") {
    steps = [
      { title: "Order Placed", date: order.date, icon: FaFileInvoiceDollar },
      { title: "Cancelled", date: order.statusText, icon: FaTimesCircle }
    ];
    displayActiveStep = 2; // Both steps active
  }

  // Calculate percentage based on dynamic steps length
  const progressPercentage = steps.length > 1 ? ((displayActiveStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="rounded-[1.5rem] md:rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-4 sm:p-6 md:p-8 shadow-[0_18px_40px_rgba(91,77,57,0.06)]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e2d9] pb-6">
          <div>
            <Link href="/account/orders" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b837b] transition-colors hover:text-[#5f5d3e]">
              <span className="material-symbols-outlined text-[1rem]">arrow_back</span>
              Back to Orders
            </Link>
            <h2 className="font-[family:var(--font-display)] text-3xl">
              Order {order.orderNumber}
            </h2>
            <p className="mt-1 text-sm text-[#6d655d]">Placed on {order.date}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-[#5f5d3e]">Order Total</p>
            <p className="font-[family:var(--font-display)] text-2xl text-[#1c1c19]">{order.total}</p>
          </div>
        </div>

        {/* Tracking Timeline Component */}
        {order.status === "Cancelled" ? (
          <div className="mb-8 flex items-start gap-4 rounded-xl border border-[#fde8e8] bg-[#fdf5f5] p-5">
            <FaTimesCircle className="mt-0.5 text-xl text-[#ef6f63] shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-[#ef6f63] uppercase tracking-[0.1em] text-sm">Order Cancelled</h3>
              <p className="mt-1 text-sm text-[#ef6f63]/80">{order.statusText}</p>
              {order.refundAmount ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                  <span className="material-symbols-outlined text-[1rem] text-emerald-600">currency_rupee</span>
                  <span>Refund of ₹{order.refundAmount} automatically initiated to your original payment method.</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : order.status === "Return Requested" || order.status === "Returned" || order.status === "Refunded" ? (
          <div className="mb-8 flex items-start gap-4 rounded-xl border border-[#f3e8fd] bg-[#f8f5fd] p-5">
            <FaCheckCircle className="mt-0.5 text-xl text-[#7c3aed] shrink-0" />
            <div>
              <h3 className="font-bold text-[#7c3aed] uppercase tracking-[0.1em] text-sm">Return Status: {order.status}</h3>
              <p className="mt-1 text-sm text-[#7c3aed]/80">{order.statusText}</p>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-[1.25rem] sm:rounded-[1.5rem] border border-[#e8e2d9] bg-[#fcf9f4] p-4 sm:p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e8e2d9]/60 pb-5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-[#1c1c19]">Tracking Status</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] ${
                  order.status === "Delivered" ? "bg-[#edf7ef] text-[#367743]" : 
                  order.status === "Ongoing" ? "bg-[#eff6ff] text-[#3b82f6]" : "bg-[#fffbeb] text-[#d97706]"
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <CancelOrderButton orderId={order.id || order.orderNumber} currentStatus={order.status} />
                <ReturnOrderButton orderId={order.id || order.orderNumber} currentStatus={order.status} deliveredAt={order.deliveredAt} />
                <Link
                  href={`/invoice/${order.orderNumber || order.id}`}
                  target="_blank"
                  className="rounded-full border border-[#5f5d3e] px-3.5 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#5f5d3e] transition-colors hover:bg-[#5f5d3e] hover:text-white shrink-0"
                >
                  Download Invoice
                </Link>
              </div>
            </div>
            <p className="mb-6 text-center font-[family:var(--font-display)] text-lg sm:text-xl text-[#1c1c19]">
              {order.statusText}
            </p>

            <div className="relative mt-6 sm:mt-8 px-1 sm:px-0">
              {/* Connecting Line Background (Vertical for mobile, Horizontal for md+) */}
              <div className="absolute left-[1.375rem] sm:left-[1.5rem] top-5 bottom-5 w-[2px] bg-[#e8e2d9] md:left-0 md:right-0 md:top-[1.5rem] md:h-[2px] md:w-full" />
              
              {/* Connecting Line Active */}
              {/* Vertical active line for mobile */}
              <div 
                className={`absolute left-[1.375rem] sm:left-[1.5rem] top-5 w-[2px] transition-all duration-1000 md:hidden bg-[#5f5d3e]`}
                style={{ height: `${progressPercentage}%` }}
              />
              {/* Horizontal active line for desktop */}
              <div 
                className={`absolute left-0 top-[1.5rem] hidden h-[2px] transition-all duration-1000 md:block bg-[#5f5d3e]`}
                style={{ width: `${progressPercentage}%` }}
              />

              <div className="relative flex flex-col justify-between gap-6 sm:gap-8 md:flex-row md:gap-4">
                {steps.map((step, idx) => {
                  const isActive = idx < displayActiveStep;
                  const isCurrent = idx === displayActiveStep - 1;
                  const StepIcon = step.icon;
                  
                  let iconClasses = "border-[#fcf9f4] bg-[#e8e2d9] text-[#a9a29a]";
                  if (isActive) {
                    iconClasses = "border-[#fcf9f4] bg-[#5f5d3e] text-white";
                  }
                  
                  return (
                    <div key={idx} className="flex flex-row items-center gap-3.5 sm:gap-4 md:flex-col md:text-center z-10 w-full">
                      <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border-4 ${iconClasses} ${isCurrent ? "ring-4 ring-[#5f5d3e]/20" : ""} transition-all duration-500`}>
                        <StepIcon className="text-lg sm:text-xl" />
                      </div>
                      <div>
                        <p className={`text-xs sm:text-sm font-bold ${isActive ? "text-[#1c1c19]" : "text-[#8b837b]"}`}>
                          {step.title}
                        </p>
                        <p className={`mt-0.5 text-[11px] sm:text-xs ${isActive ? "text-[#5f5d3e]" : "text-[#a9a29a]"}`}>
                          {step.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Items Summary */}
          <div className="rounded-[1.5rem] border border-[#e8e2d9] p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[#48473d]">Items in Order</h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item: any, idx: number) => (
                <Link 
                  href={`/product/${slugifyProductName(item.name)}`} 
                  key={idx} 
                  className="group -mx-2 flex gap-4 rounded-xl p-2 transition-colors hover:bg-[#fcf9f4]"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f0ede8]">
                    <ImageWithFallback
                      src={item.img || "/products/product-traditional-1.png"}
                      fallbackSrcs={item.images || []}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="font-bold text-[#1c1c19] transition-colors group-hover:text-[#9c4049]">{item.name}</p>
                    <p className="text-xs text-[#6d655d]">Qty: {item.qty || item.quantity || 1}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="font-[family:var(--font-display)] text-[#1c1c19]">
                        {typeof item.price === "number" ? `₹${item.price.toLocaleString("en-IN")}` : item.price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Details */}
          <div className="flex flex-col gap-6">
            <div className="rounded-[1.5rem] border border-[#e8e2d9] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#48473d]">
                <FaMapMarkerAlt className="text-[#9c4049]" /> Full Shipping Address
              </h3>
              <p className="font-bold text-base text-[#1c1c19]">{order.address?.fullName || order.address?.name || "Customer"}</p>
              
              <div className="mt-2.5 text-sm leading-6 text-[#524b45] space-y-1">
                {order.address?.streetAddress && <p>{order.address.streetAddress}</p>}
                {!order.address?.streetAddress && order.address?.street && <p>{order.address.street}</p>}
                {order.address?.streetAddressLine2 && <p>{order.address.streetAddressLine2}</p>}
                <p>
                  {[order.address?.city, order.address?.state].filter(Boolean).join(", ")}
                  {order.address?.pincode ? ` - ${order.address.pincode}` : ""}
                </p>
                {order.address?.phone && (
                  <p className="pt-2 font-medium text-[#1c1c19]">
                    <span className="text-[#8b837b]">Phone:</span> +91 {order.address.phone.replace(/[^0-9]/g, "").slice(-10)}
                  </p>
                )}
                {order.address?.email && (
                  <p className="text-xs text-[#6d655d]">
                    <span className="text-[#8b837b]">Email:</span> {order.address.email}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#e8e2d9] p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[#48473d]">Payment Summary</h3>
              {(() => {
                const isCOD = String(order.paymentMethod || order.paymentMode || "").toLowerCase().includes("cod");
                const numericTotal = typeof order.total === "number"
                  ? order.total
                  : parseFloat(String(order.total || "0").replace(/[^0-9.]/g, "")) || 0;
                const advancePaid = isCOD ? 100 : 0;
                const remainingCOD = isCOD ? Math.max(0, numericTotal - advancePaid) : 0;

                return (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-[#f2ede7] pb-2.5">
                      <span className="text-sm text-[#6d655d]">Payment Method</span>
                      <span className="rounded-md bg-[#f6f3ee] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1c1c19]">
                        {isCOD ? "Cash on Delivery (COD)" : (order.paymentMethod || "Prepaid")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6d655d]">Total Order Amount</span>
                      <span className="font-semibold text-[#1c1c19]">₹{numericTotal.toLocaleString("en-IN")}</span>
                    </div>

                    {isCOD ? (
                      <>
                        <div className="flex items-center justify-between text-sm text-emerald-700">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[1rem]">check_circle</span>
                            Advance Online Paid
                          </span>
                          <span className="font-semibold">- ₹{advancePaid.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="mt-2 flex items-center justify-between rounded-xl bg-[#fff0f1]/60 border border-[#9c4049]/20 p-3.5">
                          <div>
                            <p className="text-xs uppercase tracking-wider font-bold text-[#9c4049]">To Pay at Delivery</p>
                            <p className="text-[11px] text-[#6d655d]">Cash / UPI to courier agent</p>
                          </div>
                          <span className="font-[family:var(--font-display)] text-xl font-bold text-[#9c4049]">
                            ₹{remainingCOD.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="mt-2 flex items-center justify-between rounded-xl bg-[#edf7ef] border border-[#367743]/20 p-3.5 text-[#367743]">
                        <div>
                          <p className="text-xs uppercase tracking-wider font-bold">Payment Status</p>
                          <p className="text-[11px] opacity-80">Paid in full online</p>
                        </div>
                        <span className="font-[family:var(--font-display)] text-lg font-bold">
                          Paid
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
