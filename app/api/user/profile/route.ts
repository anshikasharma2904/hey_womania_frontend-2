import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hey_womania_session");

    if (!sessionToken) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `hey_womania_session=${sessionToken.value}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, message: "Failed to update profile" }, { status: res.status });
    }

    const user = await res.json();
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
