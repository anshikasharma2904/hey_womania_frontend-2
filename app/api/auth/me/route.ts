import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("hey_womania_session");

  if (!sessionToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`, {
      headers: {
        "Cookie": `hey_womania_session=${sessionToken.value}`
      }
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const user = await res.json();
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
