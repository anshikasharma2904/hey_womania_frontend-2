import { cookies } from "next/headers";

export async function getNetworkOrders(): Promise<any[] | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("hey_womania_session");

    if (!session) {
      return null;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/partner/network-orders`,
      {
        headers: {
          Cookie: `hey_womania_session=${session.value}`
        },
        cache: "no-store"
      }
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}
