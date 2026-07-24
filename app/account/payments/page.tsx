"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FaCreditCard, FaPaypal, FaPlus, FaTimes } from "react-icons/fa";
import { SiGooglepay } from "react-icons/si";
import { type PublicUser } from "@/types/user";

export default function PaymentsPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: "Credit Card",
    details: "",
    expiry: "",
    isDefault: false
  });

  const fetchUser = () => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) {
        setUser(data.user);
        setIsAdding(false);
        setForm({ type: "Credit Card", details: "", expiry: "", isDefault: false });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/user/payments?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) setUser(data.user);
  };

  if (isLoading) return <div className="p-8 text-[#5f5d3e]">Loading payment methods...</div>;

  const paymentMethods = user?.paymentMethods || [];

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-6 shadow-[0_18px_40px_rgba(91,77,57,0.06)] md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#5f5d3e]">
              Saved Cards & UPI
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-3xl">
              Payment Methods
            </h2>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 rounded-full bg-[#5f5d3e] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#616040]"
            >
              <FaPlus />
              Add Method
            </button>
          )}
        </div>

        {isAdding && (
          <div className="mt-6 rounded-[1.5rem] border border-[#e8e2d9] bg-[#fcf9f4] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9c4049]">Add New Payment Method</h3>
              <button onClick={() => setIsAdding(false)} className="text-[#8b837b] hover:text-[#1c1c19]">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-2">
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="rounded-xl border border-[#e8e2d9] px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]">
                <option value="Credit Card">Credit Card</option>
                <option value="UPI">UPI</option>
                <option value="PayPal">PayPal</option>
              </select>
              <input required type="text" placeholder={form.type === "UPI" ? "UPI ID (e.g. name@bank)" : "Card Number / details"} value={form.details} onChange={e => setForm({...form, details: e.target.value})} className="rounded-xl border border-[#e8e2d9] px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
              {form.type === "Credit Card" && (
                <input type="text" placeholder="MM/YY" value={form.expiry} onChange={e => setForm({...form, expiry: e.target.value})} className="rounded-xl border border-[#e8e2d9] px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
              )}
              <label className="flex items-center gap-2 md:col-span-2 text-sm text-[#48473d]">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="rounded text-[#5f5d3e] focus:ring-[#5f5d3e]" />
                Set as Default
              </label>
              <button disabled={isSubmitting} className="mt-2 rounded-xl bg-[#5f5d3e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50 md:col-span-2">
                {isSubmitting ? "Saving..." : "Save Payment Method"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-5">
          {paymentMethods.length === 0 && !isAdding && (
            <p className="text-sm text-[#6d655d]">You haven't saved any payment methods yet.</p>
          )}
          {paymentMethods.map((method) => {
            const Icon = method.type === "UPI" ? SiGooglepay : method.type === "PayPal" ? FaPaypal : FaCreditCard;
            return (
              <div
                key={method.id}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-[#e8e2d9] bg-white p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f6f3ee] text-[#1c1c19]">
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-[#1c1c19]">{method.details}</p>
                      {method.isDefault && (
                        <span className="rounded-full bg-[#edf7ef] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#367743]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.1em] text-[#6d655d]">
                      {method.type} {method.expiry ? `• Expires ${method.expiry}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 sm:justify-end">
                  <button onClick={() => handleRemove(method.id)} className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9c4049] hover:text-[#81353f]">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
