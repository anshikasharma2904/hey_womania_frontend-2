import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");

  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/partner/network`, {
      headers: {
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      cache: "no-store"
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch network" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
