"use client";

import { useEffect, useState, type FormEvent } from "react";
import { type PublicUser } from "@/types/user";

export default function ProfileDetailsPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.user) {
          setUser(data.user);
          setForm({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            phone: data.user.phone || ""
          });
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (data.ok) {
        setUser(data.user);
        setMessage({ text: "Profile updated successfully!", type: "success" });
      } else {
        setMessage({ text: data.message || "Failed to update profile", type: "error" });
      }
    } catch {
      setMessage({ text: "An error occurred", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-[#5f5d3e]">Loading profile...</div>;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-[2rem] border border-[#cac7b9]/50 bg-white/70 p-6 shadow-[0_18px_40px_rgba(91,77,57,0.06)] md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#5f5d3e]">
          Profile Settings
        </p>
        <h2 className="mt-3 font-[family:var(--font-display)] text-3xl">
          Personal Information
        </h2>

        {message.text && (
          <div className={`mt-4 rounded-xl p-3 text-sm font-medium ${message.type === "success" ? "bg-[#edf7ef] text-[#367743]" : "bg-[#fff0f1] text-[#9c4049]"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 inline-block text-xs uppercase tracking-[0.16em] text-[#48473d]">
                First Name
              </span>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 text-sm text-[#1c1c19] outline-none transition-colors focus:border-[#5f5d3e]"
              />
            </label>
            <label className="block">
              <span className="mb-2 inline-block text-xs uppercase tracking-[0.16em] text-[#48473d]">
                Last Name
              </span>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 text-sm text-[#1c1c19] outline-none transition-colors focus:border-[#5f5d3e]"
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 inline-block text-xs uppercase tracking-[0.16em] text-[#48473d]">
                Email Address
              </span>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 text-sm text-[#8c8f9e] outline-none cursor-not-allowed"
              />
            </label>
            <label className="block">
              <span className="mb-2 inline-block text-xs uppercase tracking-[0.16em] text-[#48473d]">
                Phone Number
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 text-sm text-[#1c1c19] outline-none transition-colors focus:border-[#5f5d3e]"
              />
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#5f5d3e] px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-lg transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
