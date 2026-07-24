import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("hey_womania_session");

    const res = await fetch(`${API_URL}/api/payments/razorpay/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionToken ? `hey_womania_session=${sessionToken.value}` : ""
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
