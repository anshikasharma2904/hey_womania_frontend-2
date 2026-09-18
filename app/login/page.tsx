"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [phone, setPhone] = useState("");

  const handleSendOtp = async () => {
    if (phone.trim().length < 10) {
      setStatus("Enter a valid phone number before requesting OTP.");
      return;
    }

    try {
      setIsSendingOtp(true);
      setStatus("");

      const response = await fetch("/api/phone-verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setStatus(payload.message ?? "Unable to send OTP right now.");
        return;
      }

      setOtpSent(true);
      setStatus("OTP sent successfully. Please check your messages.");
    } catch {
      setStatus("Unable to send OTP right now. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const otp = formData.get("otp");

    try {
      setIsSubmitting(true);
      setStatus("");

      const endpoint = loginMethod === "otp" ? "/api/auth/login-otp" : "/api/auth/login";
      const body = loginMethod === "otp"
        ? { phone: phone, otp }
        : { phone: phone, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const payload = (await response.json()) as {
        ok: boolean;
        message?: string;
        user?: { role: string };
      };

      if (!response.ok || !payload.ok) {
        setStatus(payload.message ?? "Unable to sign in.");
        return;
      }

      window.scrollTo(0, 0);
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || "/account";
      window.location.href = redirectUrl;
    } catch {
      setStatus("Unable to sign in right now. Please try again.");
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
              Account Login
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-[1.85rem] leading-none tracking-[-0.035em] text-[#1c1c19] md:text-[2.35rem]">
              Welcome back.
            </h1>
          </div>

          <div className="mb-6 flex gap-2 rounded-xl bg-[#f4efe8] p-1">
            <button
              type="button"
              onClick={() => { setLoginMethod("password"); setStatus(""); }}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                loginMethod === "password" ? "bg-white text-[#9c4049] shadow-sm" : "text-[#6d655d] hover:text-[#111111]"
              }`}
            >
              With Password
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod("otp"); setStatus(""); }}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                loginMethod === "otp" ? "bg-white text-[#9c4049] shadow-sm" : "text-[#6d655d] hover:text-[#111111]"
              }`}
            >
              With OTP
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">
                Phone Number
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-[0.9rem] border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition placeholder:text-[#8b837b] focus:border-[#5f5d3e] focus:ring-0"
              />
            </label>

            {loginMethod === "password" ? (
              <label className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">
                    Password
                  </span>
                  <Link
                    href="/forgot-password"
                    className="text-[0.72rem] lowercase italic text-[#48473d] transition-colors hover:text-[#5f5d3e]"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required={loginMethod === "password"}
                    placeholder="••••••••"
                    className="w-full rounded-[0.9rem] border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 pr-10 text-sm text-[#1c1c19] outline-none transition placeholder:text-[#8b837b] focus:border-[#5f5d3e] focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b837b] hover:text-[#5f5d3e] focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">
                    One-Time Password (OTP)
                  </span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-[0.72rem] uppercase tracking-[0.1em] text-[#9c4049] transition-colors hover:text-[#5f5d3e] disabled:opacity-50"
                  >
                    {isSendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
                {otpSent && (
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required={loginMethod === "otp"}
                    placeholder="123456"
                    className="w-full rounded-[0.9rem] border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition placeholder:text-[#8b837b] focus:border-[#5f5d3e] focus:ring-0"
                  />
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (loginMethod === "otp" && !otpSent)}
              className="mt-2 w-full rounded-xl bg-[#5f5d3e] px-5 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#616040] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {status ? (
            <p className="mt-3 rounded-xl bg-[#fff0f1] px-4 py-3 text-sm text-[#9c4049]">
              {status}
            </p>
          ) : null}

          <div className="mt-5 border-t border-[#e8e2d9] pt-5">
            <p className="mb-3 text-center text-sm text-[#48473d]">
              New to Hey Womaniyaa?
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-xl border border-[#d9cfc5] px-5 py-3 text-sm font-medium uppercase tracking-[0.16em] text-[#1c1c19] transition-colors hover:bg-[#f7f0e9]"
              >
                Create Account
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-[0.16em] text-[#48473d] transition-colors hover:text-[#5f5d3e]"
              >
                <span className="material-symbols-outlined text-sm">
                  arrow_back
                </span>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
