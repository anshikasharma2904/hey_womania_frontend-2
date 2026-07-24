import { KycForm } from "@/components/KycForm";

export default function PartnerKycPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#9c4049]">Verification</p>
        <h1 className="mt-1 font-[family:var(--font-display)] text-3xl tracking-tight text-[#1c1c19] md:text-4xl">
          KYC Compliance
        </h1>
      </div>

      <KycForm />
    </div>
  );
}
