import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

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

export default async function EarningsLayout({ children }: { children: ReactNode }) {
  const user = await fetchUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "partner" && !user.isPartner) {
    redirect("/account");
  }

  return <>{children}</>;
}
