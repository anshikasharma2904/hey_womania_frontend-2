"use client";

import { useState, useEffect } from "react";
import { FaCheckCircle, FaClock, FaTimesCircle, FaUser, FaIdCard, FaUniversity, FaMobileAlt, FaUserCircle } from "react-icons/fa";

type KYCData = {
  panNumber?: string;
  aadhaarNumber?: string;
  bankAccount?: string;
  ifscCode?: string;
  upiId?: string;
  status?: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  updatedAt?: string;
} | null;

type User = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  partnerProfile?: {
    kycStatus?: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const maskString = (value: string | undefined, visible = 4) => {
  if (!value) return "—";
  if (value.length <= visible) return value;
  return "•".repeat(value.length - visible) + value.slice(-visible);
};

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null;
  const configs: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    Approved: { icon: <FaCheckCircle />, label: "Verified", cls: "bg-green-50 text-green-700 border-green-200" },
    Pending:  { icon: <FaClock />,        label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    Rejected: { icon: <FaTimesCircle />,  label: "Rejected", cls: "bg-red-50 text-red-700 border-red-200" },
  };
  const cfg = configs[status] || configs.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

export default function AccountInfoSection({ user, renderAsCard = false }: { user: User, renderAsCard?: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"personal" | "kyc" | "bank">("personal");
  const [kyc, setKyc] = useState<KYCData>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ panNumber: "", aadhaarNumber: "", bankAccount: "", ifscCode: "", upiId: "" });

  useEffect(() => {
    const fetchKyc = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/kyc`, { credentials: "include" });
        const data = await res.json();
        if (data.kyc) {
          setKyc(data.kyc);
          setForm({
            panNumber: data.kyc.panNumber || "",
            aadhaarNumber: data.kyc.aadhaarNumber || "",
            bankAccount: data.kyc.bankAccount || "",
            ifscCode: data.kyc.ifscCode || "",
            upiId: data.kyc.upiId || "",
          });
        }
      } catch {}
      setLoading(false);
    };
    fetchKyc();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users/kyc`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setKyc(data.kyc);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSubmitting(false);
  };

  const userName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—";
  const kycStatus = kyc?.status || user.partnerProfile?.kycStatus || null;

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <FaUser className="text-xs" /> },
  ] as const;

  const content = (
    <div className="rounded-[2rem] border border-[#cac7b9]/50 bg-white p-6 shadow-[0_18px_40px_rgba(91,77,57,0.06)] md:p-8 relative">
      {/* Close button for modal mode */}
      {!renderAsCard && (
        <button 
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/5 flex items-center justify-center text-gray-500 hover:bg-black/10 transition-colors"
        >
          ✕
        </button>
      )}
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#5f5d3e]">Account Info</p>
          <h2 className="mt-1 font-[family:var(--font-display)] text-2xl">Your Details</h2>
        </div>
        {kycStatus && <StatusBadge status={kycStatus} />}
      </div>



      {/* Personal Info */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Full Name", value: userName },
            { label: "Email", value: user.email || "—" },
            { label: "Mobile Number", value: user.phone || "—" },
            { label: "Role", value: user.role === "partner" ? "Hey Womaniyaa Partner" : "Member" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[1rem] border border-[#ece6df] bg-[#fcf9f4] p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#9c4049]/70">{label}</p>
              <p className="mt-1 text-sm font-semibold text-[#111111]">{value}</p>
            </div>
          ))}
      </div>
    </div>
  );

  if (renderAsCard) {
    return content;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group w-full rounded-[1.1rem] border border-[#e6dcd4] bg-white p-3 text-center shadow-[0_10px_22px_rgba(95,93,62,0.04)] transition-all hover:-translate-y-1 hover:border-[#cac7b9] md:rounded-[1.35rem] md:p-4"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#e6dcd4] bg-[#fcf9f4] text-[#5f5d3e] transition-colors group-hover:bg-[#5f5d3e] group-hover:text-white md:h-14 md:w-14">
          <FaUserCircle className="text-[1.05rem] md:text-[1.15rem]" />
        </div>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.1%em] text-[#6d655d] md:mt-3 md:text-[0.72rem] md:tracking-[0.12em]">
          Profile Info
        </p>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
