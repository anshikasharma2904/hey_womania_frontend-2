"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaIdCard, FaUpload, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export function KycForm() {
  const router = useRouter();
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarFront, setAadhaarFront] = useState<string | null>("aadhaar_front.png");
  const [aadhaarBack, setAadhaarBack] = useState<string | null>("aadhaar_back.png");
  const [panFront, setPanFront] = useState<string | null>("pan_front.png");
  const [panBack, setPanBack] = useState<string | null>("pan_back.png");
  
  const [status, setStatus] = useState<{
    tone: "idle" | "error" | "success";
    message: string;
  }>({ tone: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!aadhaarNumber || !panNumber) {
      setStatus({
        tone: "error",
        message: "Please enter both Aadhaar and PAN numbers."
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ tone: "idle", message: "" });

      const response = await fetch("/api/kyc/digilocker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaarNumber,
          panNumber,
          files: {
            aadhaarFront,
            aadhaarBack,
            panFront,
            panBack
          }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        setStatus({
          tone: "error",
          message: data.message ?? "Unable to submit KYC documents."
        });
        return;
      }

      setStatus({
        tone: "success",
        message: "KYC documents submitted successfully and verified!"
      });

      router.refresh();
    } catch {
      setStatus({
        tone: "error",
        message: "An unexpected error occurred during KYC submission. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.6rem] border border-[#ece6df] bg-white p-6 shadow-[0_10px_28px_rgba(95,93,62,0.04)]">
      <div className="flex items-center gap-3 pb-4 border-b border-[#ece6df]">
        <div className="rounded-full bg-[#fff0f1] p-3 text-[#9c4049]">
          <FaIdCard className="text-[1.2rem]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1c1c19]">Submit KYC Details</h3>
          <p className="text-xs text-[#6d655d]">Fill out ID numbers and upload copies</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">Aadhaar Number</span>
          <input
            type="text"
            required
            pattern="\d{12}"
            maxLength={12}
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="12-digit Aadhaar number"
            className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">PAN Card Number</span>
          <input
            type="text"
            required
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            maxLength={10}
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-dashed border-[#e8e2d9] bg-[#fcf9f4]/40 p-4 text-center">
          <p className="text-xs font-semibold text-[#48473d]">Aadhaar Card Front</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8b837b]">
            <FaUpload /> {aadhaarFront ?? "Select File"}
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-[#e8e2d9] bg-[#fcf9f4]/40 p-4 text-center">
          <p className="text-xs font-semibold text-[#48473d]">Aadhaar Card Back</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8b837b]">
            <FaUpload /> {aadhaarBack ?? "Select File"}
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-[#e8e2d9] bg-[#fcf9f4]/40 p-4 text-center">
          <p className="text-xs font-semibold text-[#48473d]">PAN Card Front</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8b837b]">
            <FaUpload /> {panFront ?? "Select File"}
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-[#e8e2d9] bg-[#fcf9f4]/40 p-4 text-center">
          <p className="text-xs font-semibold text-[#48473d]">PAN Card Back</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8b837b]">
            <FaUpload /> {panBack ?? "Select File"}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#9c4049] px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-[#81353f] disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit KYC Documents"}
      </button>

      {status.message && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
            status.tone === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
              : "bg-rose-50 text-rose-800 border border-rose-100"
          }`}
        >
          {status.tone === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          <span>{status.message}</span>
        </div>
      )}
    </form>
  );
}
