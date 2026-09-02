"use client";

import { useState } from "react";
import { FaCheckCircle, FaStar, FaUsers, FaArrowRight, FaTimes } from "react-icons/fa";
import PartnerDocModal from "@/components/PartnerDocModal";
import { PhoneVerificationField } from "@/components/PhoneVerificationField";

export default function BecomePartnerModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sponsorCode, setSponsorCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ tone: "idle" | "success" | "error"; message: string }>({
    tone: "idle",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      setStatus({ tone: "error", message: "You must agree to the guidelines to continue." });
      return;
    }

    setSubmitting(true);
    setStatus({ tone: "idle", message: "" });

    try {
      const res = await fetch(`/api/user/upgrade-partner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sponsorCode })
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ tone: "error", message: data.error || "Failed to upgrade account." });
        setSubmitting(false);
      } else {
        setStatus({ tone: "success", message: "Welcome to the Hey Womaniyaa Partner Program!" });
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = "/earnings";
        }, 1500);
      }
    } catch (err) {
      setStatus({ tone: "error", message: "A network error occurred. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 bg-[#7f3144]"
      >
        Become a Partner
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-[2rem] border border-[#ead9d1] bg-[#fcf9f4] shadow-[0_24px_70px_rgba(127,49,68,0.15)] overflow-hidden my-8">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#ead9d1] text-[#7a2e43] shadow-sm transition hover:bg-[#fff7f3]"
            >
              <FaTimes />
            </button>

            <header className="border-b border-[#ead9d1] px-6 py-8 sm:px-10 md:px-12 text-center bg-[linear-gradient(180deg,#fffaf7_0%,#fff2ec_100%)] relative overflow-hidden">
              <div className="absolute top-0 left-0 p-8 opacity-5 pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
                <FaStar className="text-[12rem]" />
              </div>
              <h1 className="font-[family:var(--font-display)] text-[2.2rem] leading-[1] tracking-[-0.04em] text-[#5c2530] sm:text-[2.5rem] relative z-10">
                Unlock Partner Status
              </h1>
              <p className="mt-3 text-sm text-[#6d655d] max-w-lg mx-auto relative z-10">
                Your current account is a normal user account. Upgrade to a Partner account to build your referral tree, earn rewards, and unlock point pools.
              </p>
            </header>

            <div className="p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8">
              
              {/* Benefits Column */}
              <div className="flex-1 space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#5f5d3e]">
                  Partner Benefits
                </h2>
                
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4efe8] text-[#5f5d3e]">
                    <FaUsers className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1c1c19]">Build Your Network</h3>
                    <p className="mt-1 text-sm text-[#6d655d]">Earn overrides on sales made by your downline up to three tiers deep.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0f1] text-[#7f3144]">
                    <FaStar className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1c1c19]">Womaniyaa Points</h3>
                    <p className="mt-1 text-sm text-[#6d655d]">Hit monthly milestones to unlock a share of the total company turnover pool.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf7ef] text-[#367743]">
                    <FaCheckCircle className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1c1c19]">Direct Cash Rewards</h3>
                    <p className="mt-1 text-sm text-[#6d655d]">Withdraw your network earnings instantly to your bank account every month.</p>
                  </div>
                </div>
              </div>

              {/* Form Column */}
              <div className="flex-1">
                <div className="rounded-[1.5rem] bg-white p-6 shadow-sm border border-[#f0ddd6]">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {!user?.uplineId && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#6d655d] mb-1.5">
                          Sponsor Code (Optional)
                        </label>
                        <input
                          type="text"
                          value={sponsorCode}
                          onChange={(e) => setSponsorCode(e.target.value)}
                          placeholder="e.g. HW-XXXXXX"
                          className="w-full rounded-xl border border-[#e6dcd4] bg-[#fcf9f4] px-4 py-3 text-sm outline-none transition-colors focus:border-[#7f3144] focus:bg-white"
                        />
                        <p className="mt-1.5 text-[0.7rem] text-[#8b837b]">
                          If you were referred by an existing partner, enter their ID here to join their team.
                        </p>
                      </div>
                    )}

                    {user?.uplineId && (
                      <div className="rounded-xl bg-[#f4efe8] p-4 border border-[#e6dcd4]">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#5f5d3e]">Your Sponsor</p>
                        <p className="mt-1 text-sm text-[#1c1c19]">You are already connected to sponsor network: <span className="font-bold text-[#7f3144]">{user.uplineName || user.uplineId}</span></p>
                      </div>
                    )}

                    <div className="rounded-[1rem] border border-[#f0ddd6] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6d655d] mb-3">
                        Verify Your Phone Number
                      </p>
                      <PhoneVerificationField
                        id="phone"
                        name="phone"
                        initialPhone={user?.phone || ""}
                        readOnlyPhone={true}
                        showRequiredIcon={false}
                        onVerifiedChange={setPhoneVerified}
                      />
                    </div>

                    <div className="mt-2 flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreed"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-[#e6dcd4] text-[#7f3144] focus:ring-[#7f3144]"
                      />
                      <label htmlFor="agreed" className="text-sm text-[#6d655d] leading-relaxed flex flex-wrap gap-1 items-center">
                        <span>I have read and agree to the </span> <PartnerDocModal variant="link" /> <span>. I understand that I am registering as an Independent Partner.</span>
                      </label>
                    </div>

                    {status.message && (
                      <div className={`rounded-xl p-3 text-sm font-medium ${status.tone === "error" ? "bg-[#fff0f1] text-[#9c4049]" : status.tone === "success" ? "bg-[#edf7ef] text-[#367743]" : ""}`}>
                        {status.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !phoneVerified}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7f3144] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#6c2939] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Upgrading Account..." : "Join Partner Program"}
                      {!submitting && <FaArrowRight className="text-[0.8rem]" />}
                    </button>

                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
