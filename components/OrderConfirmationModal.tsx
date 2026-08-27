import React from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="w-full max-w-md bg-[#fcf9f4] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ animation: "fadeInUp 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#e8e2d9] bg-white">
          <h2 className="font-[family:var(--font-display)] text-2xl text-[#1c1c19]">Confirm Order</h2>
          <button 
            onClick={onClose}
            className="text-[#8b837b] hover:text-[#1c1c19] transition-colors p-2 -mr-2"
            disabled={isSubmitting}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
          {/* Items Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b837b] mb-4 flex items-center gap-2">
              <FaBoxOpen className="text-[#5f5d3e]" /> Order Items ({payload.items?.length || 0})
            </h3>
            <div className="flex flex-col gap-3">
              {payload.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-[#e8e2d9]/50">
                  <div className="w-12 h-12 rounded-lg bg-[#f0ede8] overflow-hidden shrink-0">
                    {item.img && <img src={item.img} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1c1c19] text-sm truncate">{item.name}</p>
                    <p className="text-xs text-[#6d655d]">Qty: {item.qty}</p>
                  </div>
                  <div className="font-[family:var(--font-display)] text-[#1c1c19]">
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#e8e2d9]/50">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b837b] mb-2 flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-[#9c4049]" /> Delivery
              </h3>
              <p className="text-sm font-medium text-[#1c1c19] truncate">{payload.address?.city}</p>
              <p className="text-xs text-[#6d655d] mt-1">{payload.address?.pincode}</p>
              {deliveryDays && (
                <p className="text-[10px] font-bold text-[#367743] mt-2 uppercase tracking-wider bg-[#edf7ef] inline-block px-2 py-1 rounded-md">
                  {deliveryDays}
                </p>
              )}
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#e8e2d9]/50">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8b837b] mb-2 flex items-center gap-1.5">
                <FaCreditCard className="text-[#5f5d3e]" /> Payment
              </h3>
              <p className="text-sm font-medium text-[#1c1c19]">{payload.paymentMethod}</p>
              {(payload.useWallet || payload.useNetworkWallet) && (
                <p className="text-[10px] text-[#6d655d] mt-1">Wallet Applied</p>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-[#5f5d3e] p-5 rounded-2xl text-white flex justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1">Total Amount</p>
              <p className="font-[family:var(--font-display)] text-3xl">{payload.total}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-[#e8e2d9] flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl border border-[#e8e2d9] text-[#6d655d] font-bold text-sm transition-colors hover:bg-[#fcf9f4] disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-[2] py-3 px-4 rounded-xl bg-[#9c4049] text-white font-bold text-sm transition-transform hover:bg-[#81353f] hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center shadow-lg shadow-[#9c4049]/20"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
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
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e8e2d9; border-radius: 10px; }
      `}} />
    </div>
  );
}
