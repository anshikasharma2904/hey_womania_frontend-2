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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
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
      window.location.href = "/account";
      // // Redirect based on user role
      // if (payload.user?.role === "partner") {
      //   window.location.href = "/earnings"; // Redirect partners to the earnings page
      // } else {
      //   // Redirect shoppers to the top of the account dashboard
      //   window.scrollTo(0, 0);
      //   window.location.href = "/account";    
      // }
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">
                Email Address
              </span>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="archive@fashion.com"
                className="w-full rounded-[0.9rem] border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition placeholder:text-[#8b837b] focus:border-[#5f5d3e] focus:ring-0"
              />
            </label>

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
                  required
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

            <button
              type="submit"
              disabled={isSubmitting}
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
              New to HeyWomaniyaa?
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
