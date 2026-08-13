import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PartnerSidebar } from "@/components/PartnerSidebar";

async function fetchUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");
  
  if (!sessionToken) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`, {
      headers: {
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const user = await fetchUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "partner" && !user.isPartner) {
    redirect("/account");
  }

  return (
    <main className="min-h-screen bg-[#fcf9f4] px-5 pb-16 pt-10 text-[#1c1c19] md:px-16 md:pt-10 lg:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          <PartnerSidebar />
          <section className="flex-1 min-w-0">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
