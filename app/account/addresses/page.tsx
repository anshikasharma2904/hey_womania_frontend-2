"use client";

import { useEffect, useState, type FormEvent } from "react";
import { FaHome, FaBriefcase, FaPlus, FaTimes } from "react-icons/fa";
import { type PublicUser } from "@/types/user";

export default function AddressesPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    streetAddress: "",
    streetAddressLine2: "",
    city: "",
    state: "",
    pincode: "",
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
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) {
        setUser(data.user);
        setIsAdding(false);
        setForm({ fullName: "", phone: "", streetAddress: "", streetAddressLine2: "", city: "", state: "", pincode: "", isDefault: false });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/user/addresses?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) setUser(data.user);
  };

  if (isLoading) return <div className="p-8 text-[#5f5d3e]">Loading addresses...</div>;

  const addresses = user?.addresses || [];

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-6 shadow-[0_18px_40px_rgba(91,77,57,0.06)] md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#5f5d3e]">
              Saved Locations
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-3xl">
              My Addresses
            </h2>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 rounded-full bg-[#5f5d3e] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#616040]"
            >
              <FaPlus />
              Add New
            </button>
          )}
        </div>

        {isAdding && (
          <div className="mt-6 rounded-[1.5rem] border border-[#e8e2d9] bg-[#fcf9f4] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#9c4049]">Add New Address</h3>
              <button onClick={() => setIsAdding(false)} className="text-[#8b837b] hover:text-[#1c1c19]">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">Full Name</span>
                  <input required type="text" placeholder="Priya Sharma" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full rounded-xl border border-[#e8e2d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">Phone Number</span>
                  <input required type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-xl border border-[#e8e2d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">Street Address</span>
                <input required type="text" placeholder="Flat No, Wing, Building Name" value={form.streetAddress} onChange={e => setForm({...form, streetAddress: e.target.value})} className="w-full rounded-xl border border-[#e8e2d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">Address Line 2 (Optional)</span>
                <input type="text" placeholder="Apartment, suite, unit etc." value={form.streetAddressLine2} onChange={e => setForm({...form, streetAddressLine2: e.target.value})} className="w-full rounded-xl border border-[#e8e2d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
              </label>

              <div className="grid gap-4 grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">City</span>
                  <input required type="text" placeholder="Mumbai" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full rounded-xl border border-[#e8e2d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">State</span>
                  <input required type="text" placeholder="Maharashtra" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full rounded-xl border border-[#e8e2d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-[#5f5d3e] font-semibold">Pincode</span>
                  <input required type="text" placeholder="400001" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="w-full rounded-xl border border-[#e8e2d9] bg-white px-4 py-3 text-sm outline-none focus:border-[#5f5d3e]" />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-[#48473d] pt-2">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="rounded text-[#5f5d3e] focus:ring-[#5f5d3e]" />
                Set as Default Address
              </label>

              <button disabled={isSubmitting} className="w-full mt-4 rounded-xl bg-[#5f5d3e] px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50 transition hover:bg-[#616040]">
                {isSubmitting ? "Saving..." : "Save Address"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {addresses.length === 0 && !isAdding && (
            <p className="text-sm text-[#6d655d]">You haven't saved any addresses yet.</p>
          )}
          {addresses.map((addr) => {
            return (
              <div key={addr.id} className="relative flex flex-col justify-between rounded-[1.5rem] border border-[#e8e2d9] bg-white p-5 transition hover:shadow-lg">
                {addr.isDefault && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#edf7ef] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#367743]">
                    Default
                  </span>
                )}
                
                <div>
                  <h3 className="font-bold text-[#1c1c19]">{addr.fullName}</h3>
                  <p className="mt-1 text-sm text-[#6d655d]">{addr.phone}</p>
                  <p className="mt-3 text-sm leading-6 text-[#48473d]">
                    {addr.streetAddress} {addr.streetAddressLine2 && `, ${addr.streetAddressLine2}`}<br />
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                </div>

                <div className="mt-6 flex gap-3 border-t border-[#f0ede8] pt-4">
                  <button onClick={() => handleRemove(addr.id)} className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9c4049] hover:text-[#81353f]">
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
