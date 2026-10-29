import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageWithFallback from "@/components/ImageWithFallback";
import { FaTimes, FaMapMarkerAlt, FaCreditCard, FaBoxOpen } from "react-icons/fa";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payload: any;
  deliveryDays: string;
  isSubmitting: boolean;
}

export function OrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  payload,
  deliveryDays,
  isSubmitting
}: OrderConfirmationModalProps) {
  if (!isOpen || !payload) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full sm:max-w-md bg-[#fcf9f4] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh]"
        style={{ animation: "fadeInUp 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-[#e8e2d9] bg-white shrink-0">
          <h2 className="font-[family:var(--font-display)] text-xl sm:text-2xl text-[#1c1c19]">Confirm Order</h2>
          <button 
            onClick={onClose}
            className="text-[#8b837b] hover:text-[#1c1c19] transition-colors p-1.5 -mr-1 rounded-full hover:bg-[#fcf9f4]"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-4 sm:gap-5">
          {/* Items Summary */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b837b] mb-3 flex items-center gap-2">
              <FaBoxOpen className="text-[#5f5d3e]" /> Order Items ({payload.items?.length || 0})
            </h3>
            <div className="flex flex-col gap-2.5 max-h-[35vh] sm:max-h-[30vh] overflow-y-auto pr-1">
              {payload.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-center bg-white p-2.5 sm:p-3 rounded-xl border border-[#e8e2d9]/60 shadow-xs">
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#f0ede8] overflow-hidden shrink-0">
                    {item.img ? (
                      <ImageWithFallback src={item.img} alt={item.name} fill sizes="48px" className="object-cover" />
                    ) : (
                      <ImageWithFallback src="/products/product-placeholder.png" alt={item.name} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1c1c19] text-xs sm:text-sm truncate">{item.name}</p>
                    <p className="text-[11px] text-[#6d655d]">Qty: {item.qty}</p>
                  </div>
                  <div className="font-[family:var(--font-display)] font-semibold text-xs sm:text-sm text-[#1c1c19] shrink-0">
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-3.5 rounded-xl border border-[#e8e2d9]/60 shadow-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b837b] mb-1.5 flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-[#9c4049]" /> Delivery
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#1c1c19] truncate">{payload.address?.city || "Address"}</p>
              <p className="text-[11px] text-[#6d655d] mt-0.5">{payload.address?.pincode}</p>
              {deliveryDays && (
                <p className="text-[9px] font-extrabold text-[#367743] mt-1.5 uppercase tracking-wider bg-[#edf7ef] inline-block px-2 py-0.5 rounded">
                  {deliveryDays}
                </p>
              )}
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#e8e2d9]/60 shadow-xs">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b837b] mb-1.5 flex items-center gap-1.5">
                <FaCreditCard className="text-[#5f5d3e]" /> Payment
              </h3>
              <p className="text-xs sm:text-sm font-bold uppercase text-[#1c1c19]">{payload.paymentMethod}</p>
              {(payload.useWallet || payload.useNetworkWallet) && (
                <p className="text-[10px] text-[#367743] font-semibold mt-1">Wallet Applied ✓</p>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-[#5f5d3e] p-4 sm:p-5 rounded-2xl text-white flex justify-between items-center shadow-md relative overflow-hidden shrink-0">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="relative z-10 w-full flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-0.5">Total Amount</p>
                <p className="font-[family:var(--font-display)] text-2xl sm:text-3xl leading-tight font-bold">{payload.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Fixed Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#e8e2d9] flex gap-3 shrink-0 pb-6 sm:pb-5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl border border-[#e8e2d9] text-[#6d655d] font-bold text-xs sm:text-sm transition-colors hover:bg-[#fcf9f4] disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-[2] py-3 px-4 rounded-xl bg-[#9c4049] text-white font-bold text-xs sm:text-sm transition-transform hover:bg-[#81353f] active:scale-95 disabled:opacity-70 flex items-center justify-center shadow-md shadow-[#9c4049]/20"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></span>
                Processing...
              </span>
            ) : (
              "Confirm & Place Order"
            )}
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e8e2d9; border-radius: 10px; }
      `}} />
    </div>
  );
}
