"use client";

import React, { useState } from "react";
import { FaUserPlus, FaCheck, FaShareAlt } from "react-icons/fa";

interface CopyInviteButtonProps {
  referralCode: string;
  variant?: "primary" | "secondary";
}

export default function CopyInviteButton({ referralCode, variant = "primary" }: CopyInviteButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!referralCode) return;
    const inviteUrl = `${window.location.origin}/register?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  if (variant === "secondary") {
    return (
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 ${
          copied ? "bg-[#4f9158]" : "bg-[#7f3144]"
        }`}
      >
        {copied ? (
          <>
            <FaCheck className="text-[0.85rem]" />
            Copied!
          </>
        ) : (
          <>
            <FaShareAlt className="text-[0.85rem]" />
            Copy Invite Link
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`mt-4 inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition duration-200 ${
        copied
          ? "border-[#4f9158] bg-[#f0faf1] text-[#4f9158]"
          : "border-[#7f3144] bg-white text-[#7f3144] hover:bg-[#fff4f6]"
      }`}
    >
      {copied ? (
        <>
          <FaCheck className="mr-2 text-[0.85rem]" />
          Invite Link Copied!
        </>
      ) : (
        <>
          <FaUserPlus className="mr-2 text-[0.85rem]" />
          Copy Invite Link
        </>
      )}
    </button>
  );
}
