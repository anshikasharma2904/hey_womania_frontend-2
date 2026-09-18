"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Detect if the input looks like a phone number
function isPhone(value: string) {
  return /^[+\d][\d\s\-()]{7,}$/.test(value.trim());
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [identifier, setIdentifier] = useState(""); // email or phone
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const usingPhone = isPhone(identifier);

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setStatus("");

      const url = usingPhone
        ? `${API}/api/auth/forgot-password-phone`
        : `${API}/api/auth/forgot-password`;

      const body = usingPhone
        ? { phone: identifier.trim() }
        : { email: identifier.trim() };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Failed to send OTP");
        return;
      }

      setStep(2);
      setStatus(
        usingPhone
          ? "OTP sent to your phone via SMS."
          : "OTP sent to your email."
      );
    } catch {
      setStatus("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setStatus("");

      const url = usingPhone
        ? `${API}/api/auth/verify-otp-phone`
        : `${API}/api/auth/verify-otp`;

      const body = usingPhone
        ? { phone: identifier.trim(), otp }
        : { email: identifier.trim(), otp };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Invalid OTP");
        return;
      }

      setStep(3);
      setStatus("OTP verified. Please enter your new password.");
    } catch {
      setStatus("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setStatus("Password must be at least 8 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("");

      const url = usingPhone
        ? `${API}/api/auth/reset-password-phone`
        : `${API}/api/auth/reset-password`;

      const body = usingPhone
        ? { phone: identifier.trim(), otp, newPassword }
        : { email: identifier.trim(), otp, newPassword };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Failed to reset password");
        return;
      }

      setStatus("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setStatus("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-4 pb-8 pt-8 text-[#1c1c19] lg:pt-16">
      <section className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md items-center">
        <div className="w-full rounded-[1.4rem] border border-[#ece6df] bg-white/88 p-4 shadow-[0_16px_42px_rgba(95,93,62,0.08)] md:rounded-[1.7rem] md:p-6 lg:p-8">
          <div className="mb-6 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/75">
              Account Recovery
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-[1.85rem] leading-none tracking-[-0.035em] text-[#1c1c19] md:text-[2.35rem]">
              Forgot Password
            </h1>
          </div>

          {/* Step 1 — Enter email or phone */}
          {step === 1 && (
            <form className="space-y-4" onSubmit={handleRequestOtp}>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">
                  Registered Email or Phone
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="email@example.com or 9876543210"
                  className="w-full rounded-[0.9rem] border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition placeholder:text-[#8b837b] focus:border-[#5f5d3e]"
                />
                {identifier.length > 3 && (
                  <span className="text-[0.7rem] text-[#9c4049]/70">
                    {usingPhone
                      ? "📱 Will send OTP via SMS"
                      : "✉️ Will send OTP via Email"}
                  </span>
                )}
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-[#5f5d3e] px-5 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#616040] disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2 — Enter OTP */}
          {step === 2 && (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <p className="text-xs text-[#5f5d3e]">
                OTP sent to{" "}
                <span className="font-semibold">{identifier}</span>
              </p>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">
                  Enter 6-Digit OTP
                </span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-[0.9rem] border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm tracking-widest text-[#1c1c19] outline-none transition placeholder:text-[#8b837b] focus:border-[#5f5d3e]"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-[#5f5d3e] px-5 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#616040] disabled:opacity-60"
              >
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(""); setStatus(""); }}
                className="w-full text-center text-xs text-[#9c4049] underline underline-offset-2"
              >
                Try a different email / phone
              </button>
            </form>
          )}

          {/* Step 3 — New password */}
          {step === 3 && (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <label className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">
                  New Password
                </span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[0.9rem] border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition placeholder:text-[#8b837b] focus:border-[#5f5d3e]"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl bg-[#5f5d3e] px-5 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#616040] disabled:opacity-60"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {status && (
            <p
              className={`mt-3 rounded-xl px-4 py-3 text-sm ${
                status.includes("successful") ||
                status.includes("sent") ||
                status.includes("verified")
                  ? "bg-[#edf7ef] text-[#367743]"
                  : "bg-[#fff0f1] text-[#9c4049]"
              }`}
            >
              {status}
            </p>
          )}

          <div className="mt-5 border-t border-[#e8e2d9] pt-5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-[0.16em] text-[#48473d] transition-colors hover:text-[#5f5d3e]"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
