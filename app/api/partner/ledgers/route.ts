import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");

  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/partner/ledgers`, {
      headers: {
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      cache: "no-store"
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Failed to fetch ledgers" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
