"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaAsterisk, FaEye, FaEyeSlash } from "react-icons/fa";
import { PhoneVerificationField } from "@/components/PhoneVerificationField";

function RequiredLabel({
  children,
  optional = false
}: {
  children: string;
  optional?: boolean;
}) {
  return (
    <span className="mb-2 inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-[#48473d]">
      {children}
      {!optional ? <FaAsterisk className="text-[0.55rem] text-[#9c4049]" /> : null}
    </span>
  );
}

export function RegisterFlow() {
  const router = useRouter();
  const [submitStatus, setSubmitStatus] = useState<{
    tone: "idle" | "error" | "success";
    message: string;
  }>({ tone: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneVerified: false,
    password: "",
    isPartner: false,
    referralCode: "",
    refType: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      const role = params.get("role");
      const type = params.get("type"); // "customer" or "partner"
      
      if (ref || role || type) {
        let isPartnerValue = form.isPartner;
        if (type === "partner" || role === "partner") {
          isPartnerValue = true;
        } else if (type === "customer") {
          isPartnerValue = false;
        }

        setForm((current) => ({
          ...current,
          referralCode: ref || current.referralCode,
          isPartner: isPartnerValue,
          refType: type || ""
        }));
      }
    }
  }, []);

  const updateField = (
    field: keyof typeof form,
    value: (typeof form)[keyof typeof form]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.phoneVerified) {
      setSubmitStatus({
        tone: "error",
        message: "Please verify your phone number before signing up."
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus({ tone: "idle", message: "" });

      const role = form.isPartner ? "partner" : "member";

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role,
          isPartner: form.isPartner,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          ref: form.referralCode,
          refType: form.refType
        })
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        setSubmitStatus({
          tone: "error",
          message: payload.message ?? "Unable to create account."
        });
        return;
      }

      setSubmitStatus({
        tone: "success",
        message: "Account created successfully.",
      });

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect");
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = form.isPartner ? "/partner/dashboard" : "/account";
      }
    } catch {
      setSubmitStatus({
        tone: "error",
        message: "Unable to create account right now. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="signup-form"
      className="scroll-mt-24 rounded-[1.5rem] border border-[#ece6df] bg-white/92 p-4 shadow-[0_18px_48px_rgba(95,93,62,0.08)] md:scroll-mt-32 md:rounded-[2rem] md:p-7 lg:p-8"
    >
      <form
        className="space-y-5 rounded-[1.5rem] border border-[#ece6df] bg-[#fcf9f4] p-4 md:space-y-6 md:p-6"
        onSubmit={handleSubmit}
      >
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#9c4049]">
            Personal Info
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          <label className="block">
            <RequiredLabel>First Name</RequiredLabel>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              placeholder="Priya"
              className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 text-sm text-[#1c1c19] outline-none transition-colors placeholder:text-[#d6cfc7] focus:border-[#5f5d3e]"
            />
          </label>

          <label className="block">
            <RequiredLabel>Last Name</RequiredLabel>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              placeholder="Sharma"
              className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 text-sm text-[#1c1c19] outline-none transition-colors placeholder:text-[#d6cfc7] focus:border-[#5f5d3e]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          <label className="block">
            <RequiredLabel>Email Address</RequiredLabel>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="example@example.com"
              className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 text-sm text-[#1c1c19] outline-none transition-colors placeholder:text-[#d6cfc7] focus:border-[#5f5d3e]"
            />
          </label>

          <PhoneVerificationField
            placeholder="(000) 000-0000"
            onPhoneChange={(phone) => updateField("phone", phone)}
            onVerifiedChange={(verified) => updateField("phoneVerified", verified)}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          <label className="block">
            <RequiredLabel>Password</RequiredLabel>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="••••••••"
                className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 pr-10 text-sm text-[#1c1c19] outline-none transition-colors placeholder:text-[#d6cfc7] focus:border-[#5f5d3e]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#d6cfc7] hover:text-[#5f5d3e] focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#b9afa5]">
              Minimum 8 characters
            </p>
          </label>

          <label className="block">
            <span className="mb-2 inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-[#48473d]">
              Referral Code
              <span className="text-[10px] lowercase text-[#b9afa5] tracking-normal font-normal ml-1">(optional)</span>
            </span>
            <input
              type="text"
              value={form.referralCode}
              onChange={(event) => updateField("referralCode", event.target.value)}
              placeholder="e.g. PRIY123"
              className="w-full border-0 border-b border-[#e8e2d9] bg-transparent py-3 text-sm text-[#1c1c19] outline-none transition-colors placeholder:text-[#d6cfc7] focus:border-[#5f5d3e]"
            />
          </label>
        </div>
        
        <div className="flex flex-col gap-3 border-t border-[#eadbcf] pt-5 md:pt-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#9c4049]">
            Account Type
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:gap-8">
            <label className={`flex items-center gap-2 ${form.refType === "partner" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
              <input
                type="radio"
                name="accountType"
                checked={!form.isPartner}
                onChange={() => updateField("isPartner", false)}
                disabled={form.refType === "partner"}
                className="h-4 w-4 border-[#e8e2d9] text-[#9c4049] focus:ring-[#9c4049]"
              />
              <span className="text-sm text-[#48473d]">Sign up as Normal User</span>
            </label>
            <label className={`flex items-center gap-2 ${form.refType === "customer" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
              <input
                type="radio"
                name="accountType"
                checked={form.isPartner}
                onChange={() => updateField("isPartner", true)}
                disabled={form.refType === "customer"}
                className="h-4 w-4 border-[#e8e2d9] text-[#9c4049] focus:ring-[#9c4049]"
              />
              <span className="text-sm text-[#48473d]">Sign up as Partner</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 border-t border-[#eadbcf] pt-5 md:flex-row md:items-center md:gap-6 md:pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#5f5d3e] px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-lg transition-all duration-300 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:px-8"
          >
            {isSubmitting ? "Creating..." : "Sign Up"}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#48473d]">Already registered?</span>
            <a
              href="/login"
              className="border-b border-[#5f5d3e] pb-0.5 text-xs uppercase tracking-[0.16em] text-[#5f5d3e] transition-opacity hover:opacity-70"
            >
              Sign In
            </a>
          </div>
        </div>

        {submitStatus.message ? (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              submitStatus.tone === "success"
                ? "bg-[#edf7ef] text-[#367743]"
                : "bg-[#fff0f1] text-[#9c4049]"
            }`}
          >
            {submitStatus.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
