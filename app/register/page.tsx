import Link from "next/link";
import { RegisterFlow } from "@/components/RegisterFlow";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#fcf9f4] text-[#1c1c19]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-8 pt-44 lg:px-10 lg:pb-10 lg:pt-44">
        <section className="rounded-[1.25rem] border border-[#ece6df] bg-white/82 p-3 shadow-[0_14px_38px_rgba(95,93,62,0.07)] md:rounded-[1.6rem] md:p-6 lg:p-8">
          <div className="flex flex-col gap-1 text-center">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#9c4049]/75">
              Account Registration
            </p>
            <h1 className="font-[family:var(--font-display)] text-[1.65rem] leading-none tracking-[-0.035em] text-[#1c1c19] md:text-[2.25rem]">
              Create your HeyWomaniyaa profile.
            </h1>
            <p className="mt-2 text-sm text-[#5e5a54] md:text-base">
              Join to shop, save looks, and track orders. You can also become a partner to start earning.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-5xl">
          <RegisterFlow />
        </div>
      </div>
    </main>
  );
}
