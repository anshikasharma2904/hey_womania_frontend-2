"use client";

import React, { useState } from "react";
import { FaUserPlus, FaCheck, FaShareAlt, FaCopy, FaWhatsapp, FaFacebook, FaTwitter, FaEnvelope, FaTimes } from "react-icons/fa";

interface CopyInviteButtonProps {
  referralCode: string;
  partnerReferralCode?: string;
  variant?: "primary" | "secondary";
  type?: "customer" | "partner" | "both";
}

export default function CopyInviteButton({ referralCode, partnerReferralCode, variant = "primary", type = "both" }: CopyInviteButtonProps) {
  const [activeShare, setActiveShare] = useState<{ url: string, title: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const getInviteUrl = (linkType: "customer" | "partner") => {
    const code = linkType === "partner" && partnerReferralCode ? partnerReferralCode : referralCode;
    if (!code) return "";
    return `${window.location.origin}/register?ref=${code}&type=${linkType}`;
  };

  const handleShareClick = (linkType: "customer" | "partner") => {
    const url = getInviteUrl(linkType);
    const title = linkType === "partner" ? "Partner Invite Link" : "Customer Invite Link";
    
    if (navigator.share) {
      navigator.share({
        title: "Hey Womaniyaa Invite",
        text: `Join Hey Womaniyaa using my referral link!`,
        url: url,
      }).catch((err) => {
        // Fallback to custom modal if user cancels or it fails
        if (err.name !== 'AbortError') {
          setActiveShare({ url, title });
        }
      });
    } else {
      setActiveShare({ url, title });
    }
  };

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const showCustomer = type === "both" || type === "customer";
  const showPartner = type === "both" || type === "partner";

  return (
    <>
      {variant === "secondary" ? (
        <div className="flex flex-col sm:flex-row gap-3">
          {showCustomer && (
            <button
              onClick={() => handleShareClick("customer")}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 bg-[#7f3144]"
            >
              <FaShareAlt /> Customer Invite
            </button>
          )}
          {showPartner && (
            <button
              onClick={() => handleShareClick("partner")}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 bg-[#5f5d3e]"
            >
              <FaShareAlt /> Partner Invite
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {showCustomer && (
            <button
              onClick={() => handleShareClick("customer")}
              className="inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition duration-200 border-[#7f3144] bg-white text-[#7f3144] hover:bg-[#fff4f6]"
            >
              <FaShareAlt className="mr-2" /> Share Customer Invite Link
            </button>
          )}
          {showPartner && (
            <button
              onClick={() => handleShareClick("partner")}
              className="inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition duration-200 border-[#5f5d3e] bg-[#fcf9f4] text-[#5f5d3e] hover:bg-[#f4efe8]"
            >
              <FaShareAlt className="mr-2" /> Share Partner Invite Link
            </button>
          )}
        </div>
      )}

      {/* Share Modal */}
      {activeShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1410]/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.5rem] bg-white p-6 shadow-2xl relative">
            <button 
              onClick={() => setActiveShare(null)}
              className="absolute top-4 right-4 text-[#8b837b] hover:text-[#1c1c19] transition-colors"
            >
              <FaTimes />
            </button>
            <h3 className="font-[family:var(--font-display)] text-xl mb-4 text-[#382933]">
              Share {activeShare.title}
            </h3>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <button 
                onClick={() => handleCopy(activeShare.url)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${copiedUrl === activeShare.url ? 'bg-[#edf7ef] text-[#367743]' : 'bg-[#f4efe8] text-[#5f5d3e] hover:bg-[#e6dcd4]'}`}>
                  {copiedUrl === activeShare.url ? <FaCheck size={18} /> : <FaCopy size={18} />}
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6d655d]">
                  {copiedUrl === activeShare.url ? "Copied" : "Copy"}
                </span>
              </button>

              <a 
                href={`https://api.whatsapp.com/send?text=Join Hey Womaniyaa using my referral link: ${encodeURIComponent(activeShare.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8fce8] text-[#25D366] transition-colors hover:bg-[#c9f5c9]">
                  <FaWhatsapp size={22} />
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6d655d]">
                  WhatsApp
                </span>
              </a>

              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(activeShare.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0fe] text-[#1877F2] transition-colors hover:bg-[#d0e0fd]">
                  <FaFacebook size={22} />
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6d655d]">
                  Facebook
                </span>
              </a>

              <a 
                href={`https://twitter.com/intent/tweet?text=Join Hey Womaniyaa using my referral link!&url=${encodeURIComponent(activeShare.url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f5fa] text-[#1DA1F2] transition-colors hover:bg-[#e1edf7]">
                  <FaTwitter size={22} />
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[#6d655d]">
                  Twitter
                </span>
              </a>
            </div>
            
            <div className="relative mt-2 rounded-xl bg-[#fcf9f4] p-3 text-sm text-[#48473d] break-all border border-[#eadbcf]">
              {activeShare.url}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
