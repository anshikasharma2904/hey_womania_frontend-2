"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import Image from "next/image";
import { FaBoxOpen, FaShippingFast, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaUser, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setOrders(resData.data);
        } else if (Array.isArray(resData)) {
          setOrders(resData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch admin orders:", err);
        setLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "ALL" || (order.status || "").toUpperCase() === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const orderNum = String(order.orderNumber || order.id || "").toLowerCase();
    const customerName = String(order.customer?.name || order.address?.fullName || order.address?.name || "").toLowerCase();
    const customerPhone = String(order.customer?.phone || order.address?.phone || "").toLowerCase();
    const customerCity = String(order.address?.city || "").toLowerCase();
    const customerPincode = String(order.address?.pincode || "").toLowerCase();
    const hasItemName = (order.items || []).some((item: any) => String(item.name || "").toLowerCase().includes(q));

    return matchesStatus && (
      orderNum.includes(q) ||
      customerName.includes(q) ||
      customerPhone.includes(q) ||
      customerCity.includes(q) ||
      customerPincode.includes(q) ||
      hasItemName
    );
  });

  return (
    <div className="flex h-screen bg-[#fcf9f4]">
      <AdminSidebar />

      <main className="flex-1 overflow-auto p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9c4049]">Admin Portal</p>
            <h1 className="mt-1 text-3xl font-black text-[#1c1c19]">Order Management</h1>
            <p className="text-sm text-[#7c6e68] mt-1">Review customer orders, delivery locations, and item details.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-[#ece6df] text-[#1c1c19]">
              Total Orders: <strong className="text-[#9c4049]">{orders.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-[#ece6df] shadow-sm">
          <input
            type="text"
            placeholder="Search by order #, customer name, phone, city, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-xl border border-[#ece6df] bg-[#fcf9f4] px-4 py-2.5 text-sm text-[#1c1c19] outline-none focus:border-[#9c4049]"
          />
          <div className="flex gap-2 overflow-x-auto">
            {["ALL", "PENDING", "ONGOING", "DELIVERED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  statusFilter === status
                    ? "bg-[#111111] text-white"
                    : "bg-[#fcf9f4] text-[#7c6e68] hover:bg-[#ece6df]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table & Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9c4049]"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#ece6df]">
            <p className="text-[#8b837b] text-base font-medium">No orders matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const customerName = order.customer?.name || order.address?.fullName || order.address?.name || "Customer";
              const customerPhone = order.customer?.phone || order.address?.phone || "N/A";
              const customerEmail = order.customer?.email || order.address?.email || "";
              const address = order.address || {};
              const items = Array.isArray(order.items) ? order.items : [];
              const orderNum = order.orderNumber || order.id;

              const isDelivered = (order.status || "").toLowerCase() === "delivered";
              const isCancelled = (order.status || "").toLowerCase() === "cancelled";

              return (
                <div
                  key={order.id || order._id}
                  className="rounded-2xl border border-[#ece6df] bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-[#f0ece5] pb-4 mb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-[family:var(--font-display)] text-lg font-bold text-[#1c1c19]">
                          Order #{orderNum}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                            isDelivered
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : isCancelled
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                        <span className="text-xs text-[#8b837b]">
                          {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "")}
                        </span>
                      </div>
                      <p className="text-xs text-[#8b837b] mt-1">
                        Payment: <strong>{order.paymentMethod || "COD"}</strong> ({order.paymentStatus || "Pending"})
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-[#8b837b]">Total Amount</p>
                        <p className="font-[family:var(--font-display)] text-2xl font-bold text-[#1c1c19]">
                          {order.total || "₹0"}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="rounded-xl border border-[#ece6df] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1c1c19] hover:bg-[#fcf9f4] transition"
                      >
                        {selectedOrder?.id === order.id ? "Hide Details" : "View Full Details"}
                      </button>
                    </div>
                  </div>

                  {/* Quick Glance: Customer and Delivery summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Customer Info */}
                    <div className="bg-[#fcf9f4] p-3.5 rounded-xl border border-[#ece6df]">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9c4049] mb-1.5">
                        <FaUser className="text-[11px]" /> Customer Info
                      </div>
                      <p className="font-bold text-[#1c1c19]">{customerName}</p>
                      <p className="text-xs text-[#6d655d] flex items-center gap-1.5 mt-1">
                        <FaPhoneAlt className="text-[10px]" /> {customerPhone}
                      </p>
                      {customerEmail && (
                        <p className="text-xs text-[#6d655d] flex items-center gap-1.5 mt-0.5 truncate">
                          <FaEnvelope className="text-[10px]" /> {customerEmail}
                        </p>
                      )}
                    </div>

                    {/* Delivery Location */}
                    <div className="bg-[#fcf9f4] p-3.5 rounded-xl border border-[#ece6df]">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9c4049] mb-1.5">
                        <FaMapMarkerAlt className="text-[11px]" /> Delivery Location
                      </div>
                      <p className="text-xs text-[#1c1c19] leading-relaxed">
                        {address.streetAddress || address.street || "Address not provided"}
                        {address.streetAddressLine2 ? `, ${address.streetAddressLine2}` : ""}
                      </p>
                      <p className="text-xs font-semibold text-[#1c1c19] mt-1">
                        {address.city ? `${address.city}, ` : ""}{address.state || ""} {address.pincode ? `- ${address.pincode}` : ""}
                      </p>
                    </div>

                    {/* Product Summary */}
                    <div className="bg-[#fcf9f4] p-3.5 rounded-xl border border-[#ece6df]">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9c4049] mb-1.5">
                        <FaBoxOpen className="text-[11px]" /> Items Ordered ({items.length})
                      </div>
                      <div className="space-y-1">
                        {items.slice(0, 2).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="truncate max-w-[170px] text-[#1c1c19] font-medium">{item.name || item.title || "Product"}</span>
                            <span className="text-[#8b837b]">Qty: {item.qty || 1} • {item.price}</span>
                          </div>
                        ))}
                        {items.length > 2 && (
                          <p className="text-[11px] text-[#9c4049] font-semibold">+{items.length - 2} more items</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Order Breakdown */}
                  {selectedOrder?.id === order.id && (
                    <div className="mt-5 pt-5 border-t border-[#f0ece5] space-y-4 animate-fadeIn">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1c1c19]">Full Product Breakdown</h4>
                      <div className="divide-y divide-[#ece6df] border border-[#ece6df] rounded-xl overflow-hidden bg-white">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 gap-4">
                            <div className="flex items-center gap-3">
                              {item.img || item.image ? (
                                <img
                                  src={item.img || item.image}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-lg object-cover border border-[#ece6df]"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-[#f0ece5] flex items-center justify-center text-[#8b837b]">
                                  <FaBoxOpen />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-[#1c1c19]">{item.name || "Product"}</p>
                                <p className="text-xs text-[#8b837b]">SKU: {item.sku || "N/A"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#1c1c19]">{item.price}</p>
                              <p className="text-xs text-[#8b837b]">Quantity: {item.qty || 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.shippingProvider && (
                        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 flex justify-between items-center">
                          <span>Logistics: <strong>{order.shippingProvider}</strong> ({order.shippingStatus || "Pending"})</span>
                          {order.shipmentId && <span>Shipment ID: <strong>{order.shipmentId}</strong></span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
