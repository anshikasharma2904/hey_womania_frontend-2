"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FaIdCard, FaUpload, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export function KycForm() {
  const router = useRouter();
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [secondaryDocType, setSecondaryDocType] = useState<string>("Voter ID");
  const [secondaryDocNumber, setSecondaryDocNumber] = useState("");
  const [aadhaarFront, setAadhaarFront] = useState<string | null>("aadhaar_front.png");
  const [aadhaarBack, setAadhaarBack] = useState<string | null>("aadhaar_back.png");
  const [secondaryDocFront, setSecondaryDocFront] = useState<string | null>("doc_front.png");
  const [secondaryDocBack, setSecondaryDocBack] = useState<string | null>("doc_back.png");
  
  const [status, setStatus] = useState<{
    tone: "idle" | "error" | "success";
    message: string;
  }>({ tone: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!aadhaarNumber || !secondaryDocNumber) {
      setStatus({
        tone: "error",
        message: "Please enter both Aadhaar and secondary document numbers."
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
          secondaryDocumentType: secondaryDocType,
          secondaryDocumentNumber: secondaryDocNumber,
          files: {
            aadhaarFront,
            aadhaarBack,
            secondaryDocFront,
            secondaryDocBack
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
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">Secondary Document Type</span>
          <select
            value={secondaryDocType}
            onChange={(e) => {
              setSecondaryDocType(e.target.value);
              setSecondaryDocNumber(""); // Reset number when type changes
            }}
            className="w-full rounded-xl border border-[#e8e2d9] bg-[#fcf9f4] px-4 py-3 text-sm text-[#1c1c19] outline-none transition focus:border-[#5f5d3e]"
          >
            <option value="Voter ID">Voter ID</option>
            <option value="Driving License">Driving License</option>
            <option value="Other">Other</option>
          </select>
        </label>
        
        <label className="block md:col-span-2">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#5f5d3e]">{secondaryDocType} Number</span>
          <input
            type="text"
            required
            value={secondaryDocNumber}
            onChange={(e) => setSecondaryDocNumber(e.target.value)}
            placeholder={`Enter your ${secondaryDocType} number`}
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
          <p className="text-xs font-semibold text-[#48473d]">{secondaryDocType} Front</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8b837b]">
            <FaUpload /> {secondaryDocFront ?? "Select File"}
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-[#e8e2d9] bg-[#fcf9f4]/40 p-4 text-center">
          <p className="text-xs font-semibold text-[#48473d]">{secondaryDocType} Back</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8b837b]">
            <FaUpload /> {secondaryDocBack ?? "Select File"}
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
